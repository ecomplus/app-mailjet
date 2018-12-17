'use strict'
const rq = require('request')
const sql = require('./sql')
const ENTITY = 'ecomplus_app_auth'

let api = {
  // order+orderId -> order/orderId
  // subresource+subresourceId
  get: async (app, resource, subresource = '') => {
    return requestApi('GET', resource + subresource, '', app)
  },
  post: async (app, body, resource, subresource = '') => {
    return requestApi('POST', resource + subresource, body, app)
  },
  path: async (app, body, resource, subresource = '') => {
    return requestApi('PATCH', resource + subresource, body, app)
  }
}

const getAppInfo = async storeId => {
  return sql.select({ store_id: storeId }, ENTITY).catch(erro => erro)
}

const getCustomerData = async storeId => {
  let app = await getAppInfo(storeId).catch(e => console.log(e))
  if (app) {
    return api.get(app, 'customers.json')
  }
}

const getAppData = async storeId => {
  let app = await getAppInfo(storeId)
  if (app) {
    return api.get(app, 'applications/', app.application_id)
  }
}

const getOrderData = async (storeId, orderId) => {
  let app = await getAppInfo(storeId).catch(e => console.log(e))
  if (app) {
    return api.get(app, 'orders/', orderId)
  }
}

const getCartData = async cartId => {
}

const requestApi = (method, url, body = '', app) => {
  let path = 'https://api.e-com.plus/v1/' + url
  let options = {
    method: method,
    uri: path,
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Id': app.store_id,
      'X-Access-Token': app.app_token,
      'X-My-ID': app.authentication_id
    }
  }

  if (method !== 'GET') {
    options.body = body
    options.json = true
  }

  return new Promise((resolve, reject) => {
    rq(options, (e, response, body) => {
      if (response.statusCode >= 400) {
        reject(new Error('Failed E-com.plus API Request.\n' + response.body))
      }
      resolve(body)
    })
  })
}

module.exports = {
  api,
  getAppInfo,
  getAppData,
  getCartData,
  getCustomerData,
  getOrderData
}
