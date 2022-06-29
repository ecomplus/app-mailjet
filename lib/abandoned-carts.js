'use strict'
const getConfig = require(process.cwd() + '/lib/store-api/get-config')
const moment = require('moment')
const logger = require('console-files')
const sqlite = require('sqlite3').verbose()
const fillSchemaWithFake = require('json-schema-fill')
const axios = require('axios')

const db = new sqlite.Database(process.env.ECOM_AUTH_DB, err => {
  const error = err => {
    // debug and destroy Node process
    logger.error(err)
    process.exit(1)
  }

  if (err) {
    error(err)
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS ecomplus_cart_watch (
        id              INTEGER    PRIMARY KEY AUTOINCREMENT NOT NULL,
        cart_id         STRING     NOT NULL UNIQUE,
        store_id        INTEGER    NOT NULL,
        created_at      DATETIME,
        customers_ids   STRING     NOT NULL,
        send            INTEGER    DEFAULT (0)
      );`, err => {
      if (err) {
        error(err)
      }
    })
  }
})

module.exports = ({ appSdk }) => {
  const task = () => {
    console.log('--> Start checking abandoned carts')
    let query = 'SELECT cart_id, store_id, customers_ids, created_at FROM ecomplus_cart_watch WHERE send = ?'
    db.each(query, [0], (err, rows) => {
      if (!err) {
        const storeId = rows.store_id
        let createdAt = moment(rows.created_at)
        let finalDate = moment().diff(createdAt, 'days')
        // get app configured options
        getConfig({ appSdk, storeId }, true)

          .then(async configObj => {
            if (configObj.mailjet_from &&
              configObj.mailjet_key &&
              configObj.mailjet_secret &&
              configObj.is_abandoned_after_days &&
              finalDate >= configObj.is_abandoned_after_days) {
              let cartId = rows.cart_id
              let url = `carts/${cartId}.json`

              const cart = await appSdk.apiRequest(storeId, url).then(resp => resp.response.data)

              if (cart.available === true && cart.completed === false) {
                // find customers to send email
                const customers = JSON.parse(rows.customers_ids)
                const cartSchema = await appSdk.apiRequest(storeId, 'carts/schema.json')
                const mailjetVars = fillSchemaWithFake(cart, cartSchema)
                const template = configObj.mailjet_templates.find(template => template.trigger === 'abandoned_cart')
                if (template) {
                  for (let i = 0; i < customers.length; i++) {
                    url = `customers/${customers[i]}.json`
                    appSdk.apiRequest(storeId, url)
                      .then(resp => resp.response.data)
                      .then(customer => {
                        // send emailparams
                        const data = {
                          'Messages': [
                            {
                              'From': {
                                'Email': 'noreply@e-com.club',
                                'Name': configObj.mailjet_from.name
                              },
                              'To': [
                                {
                                  'Email': customer.main_email,
                                  'Name': customer.name ? customer.given_name : customer.main_email
                                }
                              ],
                              'TemplateErrorDeliver': true,
                              'TemplateErrorReporting': {
                                'Email': configObj.mailjet_from.email,
                                'Name': configObj.mailjet_from.name
                              },
                              'TemplateLanguage': true,
                              'TemplateID': template.id,
                              'Variables': mailjetVars
                            }
                          ],
                          'SandboxMode': false
                        }

                        return axios({
                          url: 'https://api.mailjet.com/v3.1/send',
                          method: 'post',
                          headers: {
                            'Authorization': 'Basic ' + Buffer.from(configObj.mailjet_key + ':' + configObj.mailjet_secret).toString('base64'),
                            'Content-Type': 'application/json'
                          },
                          data
                        })
                      })
                      .then(() => {
                        logger.log(`[!]: abandonedCart | #${storeId}`)

                        db.run('DELETE FROM ecomplus_cart_watch WHERE cart_id = ? AND store_id = ?', [cartId, storeId], err => {
                          if (err) {
                            logger.error(err)
                          }
                        })
                      })
                  }
                }
              }
            }
          })

          .catch(err => {
            logger.error('DispatchAbandonedCartErr', err)
          })
      } else {
        logger.error('AbandonedCartErr', err)
      }
    })
  }

  // check if you need to create table
  task()
  let interval = 1000 * 60 * 60 * 24
  setInterval(task, interval)
}
