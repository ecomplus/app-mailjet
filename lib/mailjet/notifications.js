'use strict'
require('dotenv').config()
const { ecomAuth } = require('ecomplus-app-sdk')
const fillSchemaWithFake = require('json-schema-fill')
const logger = require('console-files')
const rq = require('request')
const cartsWatch = require('./carts')

/**
 * @description Verifica se o trigger precisa ser processado
 */
module.exports.handleNotification = async (request, response) => {
  // trigger body
  let { body } = request

  // store_id
  let storeId = body.store_id

  // resource do trigger
  // resourceId
  // action realizada
  let { resource, resource_id, action, method } = body
  let inserted_id = body.inserted_id || null

  // subresource?
  let subresource = body.subresource || ''
  let subresourceId = body.subresource_id || ''

  // resources válidos
  switch (resource) {
    case 'carts':
      cartsWatch.register(inserted_id, storeId)
      response.status(204)
      return response.end()
    // case 'products':
    case 'orders':
    case 'customers':
      await notifications(storeId, action, method, body, response, resource, resource_id, inserted_id, subresource, subresourceId)
      break
    default:
      response.status(204)
      return response.end()
  }

  response.status(204)
  return response.end()
}

/**
 * @description Processa trigger recebido e envia e-mail transacional
 * @param {Number} storeId Headers X-Store-Id
 * @param {String} action ação que ocorreu no trigger (change or create)
 * @param {String} method http verb
 * @param {Object} body trigger body
 * @param {String} resource ECP api resource
 * @param {String} resourceId ECP api resource_id
 * @param {String} subresource ECPM api subresource
 * @param {String} subresourceId ECPM api subresource_id
 * @returns {Number} http status code [204 ou 500]
 */
const notifications = async (storeId, action, method, body, response, resource, resourceId, insertedId, subresource, subresourceId) => {
  // sdk
  const sdk = await ecomAuth.then().catch(e => logger.error(e))

  // reponse
  const end = statusCode => {
    response.status(statusCode)
    return response.end()
  }

  if (!sdk) {
    return end(500)
  }

  // app auth
  let auth = await sdk.getAuth(storeId).catch(e => console.log(e))

  // resource body
  let resourceBody = await sdk.apiRequest(storeId, resource + '/' + (resourceId || insertedId) + '.json', 'GET', auth).catch(e => console.log(e))

  // schema
  let schema = await sdk.apiRequest(storeId, resource + '/schema.json', 'GET', auth).catch(e => console.log(e))

  // preenche propriedades que não
  // foram informado no body como
  // uma string vazia para enviar ao mailjet
  let mailjetMailVars = fillSchemaWithFake(resourceBody.response.data, schema.response.data)

  // app data
  let app = await sdk.apiApp(storeId).catch(e => console.log(e))

  // parse
  let application = app.response.data

  // template?
  let templates

  // destinatário params
  let toEmail, toName

  // qual ação?
  // qual resource ?
  switch (action) {
    case 'create':
      // order_confirmation
      if (resource === 'orders' && !subresource) {
        templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'order_confirmation')

        // Se o lojista não tiver
        // configurado o templates
        // não tem e-mail pra enviar
        if (!templates) {
          return end(204)
        }

        let order = resourceBody.response.data
        toName = order.buyers[0].display_name
        toEmail = order.buyers[0].main_email

        // new_costumers
      } else if (resource === 'customers' && !subresource) {
        templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'new_user')
        if (!templates) {
          return end(204)
        }
        let customers = resourceBody.response.data
        toName = customers.name.given_name
        toEmail = customers.main_email
      } else {
        return end(500)
      }
      break
    case 'change':
      if (resource === 'orders') {
        let order = resourceBody.response.data

        // payment_confirmation
        if (!subresource && body.fields.includes('financial_status') && body.fields.includes('status')) {
          if (order.financial_status.current === 'authorized') {
            templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'payment_confirmation')
            // Se o lojista não tiver
            // configurado o templates
            // não tem e-mail pra enviar
            if (!templates) {
              return end(204)
            }
            toName = order.buyers[0].display_name
            toEmail = order.buyers[0].main_email
            // refund_confirmation
          } else if (order.financial_status.current === 'refunded') {
            templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'refund_confirmation')
            // Se o lojista não tiver
            // configurado o templates
            // não tem e-mail pra enviar
            if (!templates) {
              return end(204)
            }
            toName = order.buyers[0].display_name
            toEmail = order.buyers[0].main_email
          }
          // order_invoice
        } else if (subresource === 'shipping_lines' && body.fields.includes('invoices')) {
          templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'order_invoice')
          // Se o lojista não tiver
          // configurado o templates
          // não tem e-mail pra enviar
          if (!templates) {
            return end(204)
          }
          toName = order.buyers[0].display_name
          toEmail = order.buyers[0].main_email

          // shipping_confirmation
        } else if (subresource === 'shipping_lines' && body.fields.includes('status')) {
          if (order.shipping_lines[0].status.current === 'shipped') {
            templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'shipping_confirmation')
            // Se o lojista não tiver
            // configurado o templates
            // não tem e-mail pra enviar
            if (!templates) {
              return end(204)
            }
            toName = order.buyers[0].display_name
            toEmail = order.buyers[0].main_email
            // delivery_confirmation
          } else if (order.shipping_lines[0].status.current === 'delivered') {
            templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'delivery_confirmation')
            // Se o lojista não tiver
            // configurado o templates
            // não tem e-mail pra enviar
            if (!templates) {
              return end(204)
            }
            toName = order.buyers[0].display_name
            toEmail = order.buyers[0].main_email
          }
          // cancellation_confirmation
        } else if (!subresource && body.fields.includes('status')) {
          if (order.status === 'cancelled') {
            templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'cancellation_confirmation')
            // Se o lojista não tiver
            // configurado o templates
            // não tem e-mail pra enviar
            if (!templates) {
              return end(204)
            }
            toName = order.buyers[0].display_name
            toEmail = order.buyers[0].main_email
            // delivery_confirmation
          }
        }
      }
      break
    default:
      logger.error('Action not match')
      return end(500)
  }

  /**
   * @todo
   * to email, verificar quando for buscar da order ou do customer
   */
  // envia e-mail
  let data = {
    'Messages': [
      {
        'From': {
          'Email': application.hidden_data.mailjet_from.email,
          'Name': application.hidden_data.mailjet_from.name
        },
        'To': [
          {
            'Email': toEmail,
            'Name': toName
          }
        ],
        'TemplateErrorDeliver': true,
        'TemplateErrorReporting': {
          'Email': application.hidden_data.mailjet_from.email,
          'Name': application.hidden_data.mailjet_from.name
        },
        'TemplateLanguage': true,
        'TemplateID': templates.id,
        'Variables': mailjetMailVars
      }
    ]
  }

  let options = {
    url: 'https://api.mailjet.com/v3.1/send',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(application.hidden_data.mailjet_key + ':' + application.hidden_data.mailjet_secret).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: data,
    json: true
  }
  rq(options, function (erro, resp, body) {
    if (erro || resp.statusCode >= 400) {
      end(500)
    }
    console.log(JSON.stringify(body, 'undefined', 4))
    end(204)
  })
}
