'use strict'
const { ecomAuth } = require('ecomplus-app-sdk')
const logger = require('console-files')

module.exports.appIsSettedUp = (request, response, next) => {
  // tem x-store-id?
  const storeId = request.headers['x-store-id']

  if (storeId) {
    ecomAuth.then(async sdk => {
      let auth = await sdk.getAuth(storeId)
      let apiRequest = await sdk.apiRequest(storeId, 'applications/' + auth.row.application_id, 'GET', auth).catch(e => console.log(e, 'ecomplus_api_request'))

      if (apiRequest) {
        let application = apiRequest.response.data
        // se houver app
        // verifico se aplicativo tem
        // propriedades obrigatórias
        // configuradas
        if (application &&
          application.hasOwnProperty('hidden_data') &&
          application.hidden_data.hasOwnProperty('mailjet_templates') &&
          application.hidden_data.hasOwnProperty('mailjet_key') &&
          application.hidden_data.hasOwnProperty('mailjet_secret') &&
          application.hidden_data.hasOwnProperty('mailjet_from')) {
          console.log('Valido porra.')
          return next()
        } else {
          response.status(400)
          return response.send({ erros: { message: 'Properties required not setted up on application.' } })
        }
      } else {
        response.status(400)
        return response.send({ erros: { message: 'Application not found.' } })
      }
    })
  } else {
    response.status(400)
    return response.send({ erros: { message: 'X-Store-id is required.' } })
  }
}

module.exports.logRequest = (request, response, next) => {
  let req = {
    'headers': request.headers,
    'method': request.method,
    'params': request.params,
    'query': request.query,
    'route': request.route.path,
    'url': request.url,
    'body': request.body
  }
  logger.log(JSON.stringify(req))
  return next()
}
