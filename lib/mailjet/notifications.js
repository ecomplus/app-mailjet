'use strict'
require('dotenv').config()
const mj = require('node-mailjet')
const { ecomAuth } = require('ecomplus-app-sdk')
const { fillSchemaWithFake } = require('json-schema-fill')
const logger = require('console-files')

/**
 * @description Verifica se o trigger precisa ser processado
 */
module.exports.handleNotification = (request, response) => {
  // trigger body
  let { body } = request

  // store_id
  let storeId = request.headers['x-store-id']

  // resource do trigger
  // resourceId 
  // action realizada
  let { resource, resource_id, action, method } = body

  // method post?
  // entao inserted_id
  let inserted_id = (method === 'POST') ? body.inserted_id : resource_id

  // subresource?
  let subresource = body.subresource || ''
  let subresourceId = body.subresource_id || ''

  // response status code
  let statusCode

  // resources válidos
  switch (resource) {
    case 'products':
    case 'orders':
    case 'carts':
    case 'customers':
      statusCode = notifications(storeId, action, method, body, resource, inserted_id, subresource, subresourceId)
      break
    default:
      statusCode = 204
      break
  }

  response.status(statusCode)
  return response.end()
}

/**
 * @description Processa trigger recebido e envia e-mail transacional
 * @param {Number} storeId Headers X-Store-Id
 * @param {String} action ação que ocorreu no trigger change or create
 * @param {String} method http verb
 * @param {Object} body trigger body
 * @param {String} resource ECP api resource
 * @param {String} resourceId ECP api resource_id
 * @param {String} subresource ECPM api subresource
 * @param {String} subresourceId ECPM api subresource_id
 * @returns {Number} http status code 204 ou 500
 */
const notifications = async (storeId, action, method, body, resource, resourceId, subresource, subresourceId) => {
  // sdk
  const sdk = await ecomAuth.then().catch(e => logger.error(e))

  if (!sdk) {
    return 500
  }

  // app auth
  let auth = await sdk.getAuth(storeId).catch(e => console.log(e))

  // resource body
  let resourceBody = await sdk.apiRequest(storeId, resource + '/' + resourceId + '.json', 'GET', auth).catch(e => console.log(e))

  // schema
  let schema = await sdk.apiRequest(storeId, resource + '/schema.json', 'GET', auth).catch(e => console.log(e))

  // preenche propriedades que não
  // foram informado no body como
  // uma string vazia para enviar ao mailjet
  let mailjetMailVars = fillSchemaWithFake(resourceBody, schema)

  // app data
  let app = await sdk.apiApp(storeId).catch(e => console.log(e))
  // parse
  let application = app.response.data

  // template?
  let templates
  let subject

  // qual ação?
  // qual resource ?
  switch (action) {
    case 'create':
      // order_confirmation
      if (resource === 'orders') {
        templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'order_confirmation')
        subject = 'Order Confirmation'
      } else if (resource === 'customers') {
        templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'new_user')
        subject = 'New Customer'
      } else {
        return 500
      }
      break
    case 'change':
      if (resource === 'orders') {

      }
      break
    default:
      logger.error('Action not match')
      return 500
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
            'Email': resourceBody.buyers[0].main_email,
            'Name': resourceBody.buyers[0].display_name
          }
        ],
        'TemplateID': templates.id,
        'TemplateLanguage': true,
        'Variables': mailjetMailVars,
        'Subject': subject,
        'TemplateErrorDeliver': true,
        'TemplateErrorReporting': {
          'Email': application.hidden_data.mailjet_from.email,
          'Name': application.hidden_data.mailjet_from.name
        }
      }
    ]
  }

  // set api key
  // e api secret que
  // vieram do hidden_data do app
  mj.connect(application.hidden_data.mailjet_key, application.hidden_data.mailjet_secret)

  // processa o e-mail
  const request = mj
    .post('send', { 'version': 'v3.1' })
    .request(data)
  request
    .then((result) => {
      console.log(JSON.stringify(result.body, 'undefined', 4))
      return 204
    })
    .catch((err) => {
      console.log(err)
      return 500
    })
}
