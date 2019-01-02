'use strict'
const rq = require('request')
const jsf = require('json-schema-faker')
const fs = require('fs')
const ecomplus = require('../ecomplus')
const schemaPath = 'https://api.e-com.plus/v1/orders/schema.json?x_store_id=1002'
/**
 *
 * @param {*} trigger 
 */
const confirmation = async (trigger) => {
  let schema = await getSchema().catch(e => console.log(e))
  let order = await ecomplus.getOrderData(1002, '5bd09ae40d303b4fdb142349')

  if (order) {
    order = JSON.parse(order)
    let data = {}
    for (const key in schema.properties) {
      if (order.hasOwnProperty(key)) {
        data[key] = order[key]
      } else {
        switch (schema.properties[key].type) {
          case 'string':
            data[key] = ''
            break
          case 'boolean':
            data[key] = false
            break
          case 'array':
            data[key] = []
            break
          case 'object':
            data[key] = {}
            break
          default: break
        }
      }
    }
    return data
  }
}
/**
 * 
 */
const getSchema = async () => {
  return new Promise((resolve, reject) => {
    rq.get({ uri: schemaPath }, (erro, resp, body) => {
      if (resp.statusCode >= 400) {
        reject(resp.body)
      }
      resolve(JSON.parse(body))
    })
  })
}

confirmation()
module.exports = {
  confirmation
}
