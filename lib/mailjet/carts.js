'use strict'
const sql = require('./sql')
const { ecomAuth } = require('ecomplus-app-sdk')
const logger = require('console-files')
const fillSchemaWithFake = require('json-schema-fill')
const rq = require('request')
const moment = require('moment')

module.exports.register = async (cartId, storeId) => {
  const sdk = await ecomAuth.then().catch(e => logger.error(e))
  let cartBody = await sdk.apiRequest(storeId, 'carts/' + cartId + '.json', 'GET').catch(e => console.log(e))
  cartBody = cartBody.response.data

  if (cartBody && cartBody.customers && cartBody.available === true && cartBody.completed === false) {

    let customers = JSON.stringify(cartBody.customers)
    let data = {
      cart_id: cartId,
      store_id: storeId,
      created_at: new Date().toISOString(),
      customers_ids: customers
    }
    sql.insert(data, 'ecomplus_cart_watch')
      .catch(e => console.log(e))
  }
}

const isAbandoned = () => {
  let query = 'SELECT cart_id, store_id, customers_ids, created_at FROM ecomplus_cart_watch WHERE send = ?'
  let index = 0

  sql.db.each(query, [0], (erro, rows) => {
    setTimeout(async () => {
      if (erro) {
        logger.error(erro)
      } else {
        ecomAuth.then(async sdk => {
          let auth = await sdk.getAuth(rows.store_id)
          let apiRequest = await sdk.apiRequest(rows.store_id, 'applications/' + auth.row.application_id, 'GET', auth).catch(e => console.log(e, 'ecomplus_api_request'))

          if (apiRequest) {
            let application = apiRequest.response.data
            let abadonedInDays = application.data.is_abandoned || 3

            // verifico a diferente entre as datas
            // de criação e atual
            let createdAt = moment(rows.created_at)
            let finalDate = moment().diff(createdAt, 'days')

            if (finalDate >= abadonedInDays) {
              // resource body
              let resourceBody = await sdk.apiRequest(rows.store_id, 'carts/' + rows.cart_id + '.json', 'GET', auth).catch(e => console.log(e))

              let schema = await sdk.apiRequest(rows.store_id, 'carts/schema.json', 'GET', auth).catch(e => console.log(e))

              let mailjetMailVars = fillSchemaWithFake(resourceBody.response.data, schema.response.data)

              let templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'adandoned_cart')

              if (templates) {
                let customers = JSON.parse(rows.customers_ids)

                for (let i = 0; i < customers.length; i++) {
                  setTimeout(async () => {
                    // resource body
                    let customerBody = await sdk.apiRequest(rows.store_id, 'customers/' + customers[i] + '.json', 'GET', auth).catch(e => console.log(e))
                    customerBody = customerBody.response.data
                    let toName = customerBody.name.given_name
                    let toEmail = customerBody.main_email

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
                      }
                      console.log('Ok.')
                      // atualiza banco settando send to 1
                      let data = {
                        send: 1
                      }
                      let where = {
                        cart_id: rows.cart_id,
                        store_id: rows.store_id
                      }
                      sql.update(data, where, 'ecomplus_cart_watch')
                        .catch(e => console.log(e))
                    })
                  }, 1000 * i)
                }
              }
            }
          }
        })
      }
      index++
    }, index * 1000)
  })
}

setInterval(isAbandoned, 2 * 60 * 1000)
