
const SQL = require('./sql')
const RQ = require('request')

const register = async (xstoreid) => {
  let app = await SQL.select({ store_id: xstoreid }, 'app_auth').catch(e => console.log(new Error('Erro ao buscar informações relacionadas ao X-Store-id informado | Erro: '), e))
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
  let options = {
    uri: 'https://api.e-com.plus/v1/procedures.json',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-ID': xstoreid,
      'X-Access-Token': app.app_token,
      'X-My-ID': app.authentication_id
    },
    body: params,
    json: true
  }
  return new Promise((resolve, reject) => {
    RQ.post(options, (erro, resp, body) => {
      if (resp.statusCode >= 400) {
        console.log(resp)
        reject(resp.body)
      }
      console.log(body)
      resolve(body)
    })
  })
}

module.exports = {
  register
}
