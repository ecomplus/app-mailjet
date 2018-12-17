'use strict'
const rq = require('request')
const logger = require('console-files')
const sql = require('./sql')

const register = async storeId => {
  //
  let app = await sql.select({ store_id: storeId }, 'ecomplus_app_auth')
    .catch(erro => {
      logger.error('Erro ao buscar informações relacionadas ao X-Store-Id informado \n\tStack: Register Webhooks \n\tErro: ' + erro)
    })
  //
  let params = {
    title: 'Mailjet notifications',
    triggers: [
      {
        resource: 'products'
      },
      {
        resource: 'customers'
      },
      {
        resource: 'carts'
      },
      {
        resource: 'orders'
      }
    ],
    webhooks: [
      {
        api: {
          external_api: {
            uri: 'https://mailjet.ecomplus.biz/notifications'
          }
        },
        method: 'POST'
      }
    ],
    tag: 'mailjet'
  }
  //
  let options = {
    uri: 'https://api.e-com.plus/v1/procedures.json',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-ID': storeId,
      'X-Access-Token': app.app_token,
      'X-My-ID': app.authentication_id
    },
    body: params,
    json: true
  }
  return new Promise((resolve, reject) => {
    rq.post(options, (erro, resp, body) => {
      if (resp.statusCode >= 400) {
        logger.error('Erro ao registrar o procedure. \n\tStack: Register Webhooks \n\tErro: ' + resp.body)
        reject(resp.body)
      }
      resolve(body)
    })
  })
}

module.exports = {
  register
}
