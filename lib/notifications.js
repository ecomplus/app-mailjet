'use strict'
const logger = require('console-files')
const axios = require('axios')
const fillSchema = require('json-schema-fill')
const fetchCustomer = require('./store-api/fetch-customer')
const fetchOrder = require('./store-api/fetch-orders')
const fetchStore = require('./store-api/fetch-store')
const fetchSchema = require('./store-api/fetch-schema')
const patchCustomerNotified = require('./store-api/patch-notified')
//
let processingOrders = []

module.exports = (appSdk, configObj, storeId) => {
  return (trigger) => {
    if (configObj.mailjet_key && configObj.mailjet_secret && configObj.mailjet_from && configObj.mailjet_templates) {
      console.log(1)
      const resourceId = trigger.resource_id || null
      const insertedId = trigger.inserted_id || null
      const orderId = resourceId || insertedId
      const delay = Math.random() * (6000 - 1000) + 1000
      let store = null
      let order = null
      let customer = null
      let error = false
      let orderSchema = null
      let templateVars = null
      if (processingOrders.indexOf(orderId) === -1) {
        processingOrders.push(orderId)
        setTimeout(async () => {
          try {
            // fetch merchant's store data
            store = await fetchStore(appSdk, storeId)
            // fetch order
            order = await fetchOrder(appSdk, storeId, orderId)
            // fetch custumer data
            customer = await fetchCustomer(appSdk, storeId, order.buyers[0]._id)
            // order schema
            orderSchema = await fetchSchema(appSdk, storeId)
            // try to fill missing vars in
            templateVars = fillSchema(order, orderSchema)
          } catch (err) {
            logger.error('Error with store-api request', err)
            throw err
          }

          const { action, subresource, body } = trigger
          const to = {
            name: order.buyers[0].display_name,
            email: order.buyers[0].main_email
          }

          if (action === 'create' && body.customer_notified === false) {
            // verifica qual é o template de e-mail
            switch (subresource) {
              // payments_history
              case 'payments_history':
                console.log(2)
                if (!order.payments_history.find(entry => entry.customer_notified)) {
                  // envia o email de nova order
                  let templanteId = configObj.mailjet_templates.find(template => template.trigger === 'new_order')
                  if (templanteId) {
                    sendMail(templanteId.id, templateVars, to, configObj).then(resp => {
                      console.log(JSON.stringify(resp.data))
                      logger.log(`[!]: new_order | ${order.number} | #${storeId}`)
                    }).catch(e => console.log(e))
                  }
                } else {
                  const lastNotifiedStatus = order.payments_history
                    .filter(entry => entry.customer_notified)
                    .sort((a, b) => a.date_time > b.date_time ? -1 : 1)[0].status

                  const lastCustomerNotified = order.payments_history.find(entry => entry._id === trigger.inserted_id && entry.customer_notified === false)
                  console.log(3)
                  console.log(order.number)
                  if (lastNotifiedStatus !== body.status && lastCustomerNotified) {
                    console.log(4)
                    // envia o email
                    let templanteId = configObj.mailjet_templates.find(template => template.trigger === body.status)
                    if (templanteId) {
                      sendMail(templanteId.id, templateVars, to, configObj).then(() => {
                        logger.log(`[!]: new_order | ${body.status} | #${storeId}`)
                      }).catch(e => console.log(e))
                    }
                  }
                }

                break;

              // fulfillment
              case 'fulfillments':
                break

              default: break
            }
            // verifica se o templante está configurado no applicativo

            // envia o email
          }

          processingOrders.splice(processingOrders.indexOf(orderId), 1)
        }, delay)
      }
    } else {
      logger.log(`No settings configured for mailjet_key, mailjet_secret, mailjet_from, and mailjet_templates for store #${storeId}`)
    }
  }
}

const sendMail = (templateId, variables, to, configObj) => {
  const data = {
    'Messages': [
      {
        'From': {
          'Email': 'noreply@e-com.club',
          'Name': configObj.mailjet_from.name
        },
        'To': [
          {
            'Email': to.email,
            'Name': to.name
          }
        ],
        'TemplateErrorDeliver': true,
        'TemplateErrorReporting': {
          'Email': configObj.mailjet_from.email,
          'Name': configObj.mailjet_from.name
        },
        'TemplateLanguage': true,
        'TemplateID': templateId,
        'Variables': variables
      }
    ],
    'SandboxMode': false
  }

  return axios({
    url: 'https://api.mailjet.com/v3.1/send',
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(configObj.mailjet_key + ':' + configObj.mailjet_secret).toString('base64'),
      'Content-Type': 'application/json'
    },
    data
  })
}
