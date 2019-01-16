'use strict'
const { ecomAuth } = require('ecomplus-app-sdk')
const logger = require('console-files')
const sql = require('./sql')

/**
 * @description trata callbacks
 */
module.exports.handle = (request, response) => {
  ecomAuth.then(sdk => {
    let storeId = parseInt(request.headers['x-store-id'], 10)
    let body = request.body
    sdk.handleCallback(storeId, body).then(({ isNew, authenticationId }) => {
      // is new?
      if (isNew) {
        // registra no db
        let setup = {
          store_id: storeId,
          authentication_id: authenticationId,
          application_id: body.application._id
        }
        sql.insert(setup, 'mailjet_app_settings')
      }
      // just respond first
      response.status(204)
      return response.end()
    })
      .catch(err => {
        if (typeof err.code === 'string' && !err.code.startsWith('SQLITE_CONSTRAINT')) {
          // debug SQLite errors
          logger.error(err)
        }
        response.status(500)
        return response.send({ erro: 'mailjet_callback_erro', message: err.message })
      })
  })
    .catch(e => {
      logger.error('Erro with ecomplus-app-sdk' + e)
      response.status(400)
      return response.end()
    })
}
