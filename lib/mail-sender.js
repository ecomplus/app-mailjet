'use strict'
const logger = require('console-files')
const fillSchema = require('json-schema-fill')
const fetchCustomer = require('./store-api/fetch-customer')
const fetchOrder = require('./store-api/fetch-orders')
const fetchStore = require('./store-api/fetch-store')
const fetchSchema = require('./store-api/fetch-schema')
const getEmailConfig = require('./get-email-config')
const orderSchema = require('./order-schema.json')
const errorHandling = require('./store-api/error-handling')
const mj = require('node-mailjet')
const queue = []
const orderStatus = [
  'pending',
  'under_analysis',
  'authorized',
  'unauthorized',
  'partially_paid',
  'paid',
  'in_dispute',
  'partially_refunded',
  'refunded',
  'canceled',
  'voided',
  'invoice_issued',
  'in_production',
  'in_separation',
  'ready_for_shipping',
  'partially_shipped',
  'shipped',
  'partially_delivered',
  'delivered',
  'returned_for_exchange',
  'received_for_exchange',
  'returned'
]

/**
 * Este handle recebe webhook da ecomplus, busca na api os dados do pedido, do costumer, do lojista
 * monta o body e envia para o mailjet
 */
const handler = (appSdk, configObj, storeId, trigger) => {
  const resourceId = trigger.resource_id || null
  const insertedId = trigger.inserted_id || null
  const orderId = resourceId || insertedId

  const { body, subresource } = trigger
  let status = body.status
  if (
    queue.indexOf(orderId) !== -1 ||
    body.customer_notified === true ||
    orderStatus.indexOf(body.status) === -1
  ) {
    return
  }

  let isRetry = false
  const queueAndSend = () => {
    queue.push(orderId)

    setTimeout(async () => {
      let lastValidRecord
      Promise
        .all([
          fetchStore(appSdk, storeId),
          fetchOrder(appSdk, storeId, orderId)
        ])

        .then(([store, order]) => {
          return fetchCustomer(appSdk, storeId, order.buyers[0]._id)
            .then(customer => ({ customer, order, store }))
        })

        .then(async ({ customer, order, store }) => {
          let isCustomerNotified, lastNotifiedStatus, mjConfig
          if (Array.isArray(order[subresource])) {
            const sortedRecords = order[subresource]
              .sort((a, b) => a.date_time > b.date_time ? -1 : 1)
            lastValidRecord = sortedRecords.find(({ status }) => orderStatus.includes(status))
            if (lastValidRecord) {
              status = lastValidRecord.status
            }

            isCustomerNotified = Boolean(order[subresource]
              .find(entry => entry._id === trigger.inserted_id && entry.customer_notified))
            if (!isCustomerNotified) {
              const lastNotification = sortedRecords.find(entry => entry.customer_notified)
              if (lastNotification) {
                lastNotifiedStatus = lastNotification.status
              }
            }
          }

          if (!isCustomerNotified && lastNotifiedStatus !== status) {
            if (subresource === 'payments_history') {
              const listOfStatus = ['unauthorized', 'in_dispute', 'refunded', 'voided']
              const isCancelled = order.status !== 'cancelled'
              if (
                !lastNotifiedStatus &&
                !isCancelled &&
                listOfStatus.every(entry => entry !== status)
              ) {
                // new_order
                mjConfig = getEmailConfig(configObj, store, order.number, 'new_order')
              } else if (
                status !== 'under_analysis' ||
                Date.now() - new Date(order.created_at).getTime() > 180000
              ) {
                // other status
                mjConfig = getEmailConfig(configObj, store, order.number, status)
              }

              if (!order.financial_status) {
                order.financial_status = {
                  current: status
                }
              }
            } else {
              // fullfilment
              if (!order.fulfillment_status) {
                order.fulfillment_status = {
                  current: status
                }
              }
              mjConfig = getEmailConfig(configObj, store, order.number, status)
            }
          }

          if (!mjConfig) {
            const err = new Error('IgnoreTrigger')
            err.type = 'IgnoreTrigger'
            throw err
          }

          return { customer, mjConfig, order }
        })

        .then(async ({ customer, mjConfig, order }) => {
          let schema
          try {
            // order schema
            schema = await fetchSchema(appSdk, storeId)
          } catch (err) {
            // if api fails uses saved schema
            schema = orderSchema
          }
          order._id = resourceId
          const Variables = fillSchema(order, schema)
          const To = [
            {
              Name: customer.display_name,
              Email: customer.main_email
            }
          ]

          const mailjet = mj
            .connect(mjConfig.mailjet_key, mjConfig.mailjet_secret, {
              'version': 'v3.1'
            })
            // delete key and secrete from config
            ;['mailjet_key', 'mailjet_secret'].forEach(key => delete mjConfig[key])

          const Messages = [
            {
              To,
              Variables,
              TemplateLanguage: true,
              TemplateErrorDeliver: true,
              TemplateErrorReporting: {
                // ...mjConfig.From
                ...To[0]
              },
              ...mjConfig
            }
          ]

          return mailjet
            .post('send')
            .request({
              Messages,
              SandboxMode: false
            })
        })

        .then(res => {
          const statusRecordId = lastValidRecord ? lastValidRecord._id : insertedId
          const url = `orders/${orderId}/${subresource}/${statusRecordId}.json`
          const method = 'PATCH'
          const data = {
            customer_notified: true
          }

          // return appSdk.apiRequest(storeId, url, method, data)
        })

        .catch(err => {
          logger.error('email_notification_err', err)
          if (err.type !== 'IgnoreTrigger' && err.code !== 'InvalidParameterValue') {
            logger.error('email_notification_err', err)
            if (!isRetry && (!err.response || !(err.response.status >= 400 && err.response.status < 500))) {
              // one minute and retry
              setTimeout(() => {
                if (queue.indexOf(orderId) === -1) {
                  isRetry = true
                  queueAndSend()
                }
              }, Math.random() * (180000 - 30000) + 30000)
            } else {
              errorHandling(err)
              logger.log(`>> Notification failed for #${storeId} ${orderId}`)
            }
          }
        })

      queue.splice(queue.indexOf(orderId), 1)
    }, Math.random() * (5000 - 1000) + 1000)
  }
  queueAndSend()
}

module.exports = handler
