const sql = require('./sql')
const rq = require('request')
const ENTITY = 'app_auth'

class Ecomplus {
  async getAppInfo (storeId) {
    return sql.select({ store_id: storeId }, ENTITY).catch(e => console.log(e))
  }

  async getAppData (storeId) {
    let app = await this.getAppInfo(storeId).catch(e => console.log(e))
    if (app) {
      return new Promise((resolve, reject) => {
        let options = {
          uri: 'https://api.e-com.plus/v1/applications/' + app.application_id + '.json',
          headers: {
            'Content-Type': 'application/json',
            'X-Store-ID': app.store_id,
            'X-Access-Token': app.app_token,
            'X-My-ID': app.authentication_id
          }
        }
        rq.get(options, (erro, resp, body) => {
          if (resp.statusCode >= 400) {
            reject(new Error(resp.body))
          }
          return resolve(body)
        })
      })
    }
  }

  async getOrderData (storeId, orderId) {
    let app = await this.getAppInfo(storeId).catch(e => console.log(e))
    return new Promise((resolve, reject) => {
      let options = {
        method: 'GET',
        uri: 'https://api.e-com.plus/v1/orders/' + orderId + '.json',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-ID': app.store_id,
          'X-Access-Token': app.app_token,
          'X-My-ID': app.authentication_id
        }
      }
      rq.get(options, (erro, resp, body) => {
        if (resp.statusCode >= 400) {
          reject(resp.body)
        }
        resolve(body)
      })
    })
  }

  async getCustomerData (storeId) {
    return new Promise(async (resolve, reject) => {
      let app = await this.getAppInfo(storeId).catch(e => console.log(e))
      let options = {
        'url': 'https://api.e-com.plus/v1/customers.json',
        headers: {
          'Content-Type': 'application/json',
          'X-Store-ID': app.store_id,
          'X-Access-Token': app.app_token,
          'X-My-ID': app.authentication_id
        }
      }
      rq.get(options, (erro, resp, body) => {
        if (resp.statusCode >= 400) {
          reject(resp.body)
        }
        resolve(body)
      })
    })
  }

  async getCartData (cartId) {
  }
}
module.exports = Ecomplus
