'use strict'
const { ecomAuth } = require('ecomplus-app-sdk')
const logger = require('console-files')
const config = require('../config')
const mj = require('node-mailjet').connect(config.MJ_APIKEY, config.MJ_SECRETKEY)
const sql = require('./sql')

/**
 * @description Verifica se o aplicativo foi completamente configurado.
 */
module.exports.appManager = () => {
  console.log('Setup is running.')
  //
  let query = 'SELECT application_id, authentication_id, setted_up, store_id FROM ecomplus_app_auth WHERE setted_up = ?'
  let index = 0
  //
  sql.db.each(query, [0], (erro, rows) => {
    setTimeout(async () => {
      if (erro) {
        logger.error(erro)
      } else {
        ecomAuth.then(async sdk => {
          const auth = await sdk.getAuth(rows.store_id).catch(e => console.log(e, 'ecomplus_app_sdk'))

          let apiRequest = await sdk.apiRequest(rows.store_id, 'applications/' + rows.application_id, 'GET', null, auth).catch(e => console.log(e, 'ecomplus_api_request'))
          let application = apiRequest.response.data
          console.log(application)
          // tem aplicativo para o id?
          if (application) {
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
              // tem todas?
              // então registro procedure
              let procedure = [
                {
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
              ]
              sdk.configureSetup(procedure, async (err, { storeId }) => {
                if (!err) {
                  // procedure registrado
                  // crio lista default no mailjet
                  let defaultList = await mj.post('contactslist').request({ 'Name': 'Ecomplus' })

                  // busco costumers da x-store-id
                  let apiRequest = sdk.apiRequest(rows.store_id, '/customers.json', 'GET', '', auth).catch(e => console.log(e, 'ecomplus_app_sdk'))

                  // crio array com nome e e-mail dos costumers
                  let costumersList = apiRequest.response.data.result.map(customer => {
                    return {
                      Email: customer.main_email,
                      Name: customer.display_name
                    }
                  })

                  // incluo os contatos na lista default
                  mj.post('contactslist')
                    .id(defaultList.body.Data[0].ID)
                    .action('ManageManyContacts')
                    .request(JSON.stringify({
                      Action: 'addforce',
                      Contacts: costumersList
                    }))
                    .then(() => {
                      // incluiu na list?
                      let data = {
                        list_id: defaultList.body.Data[0].ID,
                        store_id: rows.store_id,
                        setted_up: 1
                      }
                      // atualizo config do mj no db
                      sql.insert(data, 'mailjet_app_settings')
                    })
                    .catch((err) => {
                      logger.error(err.statusCode)
                    })
                } else if (!err.appAuthRemoved) {
                  logger.error(err)
                }
              })
            } else {
              console.log('Não tem propriedades')
            }
          }
        })
        ecomAuth.catch(err => {
          logger.error(err)
          setTimeout(() => {
            // destroy Node process while Store API auth cannot be handled
            process.exit(1)
          }, 1000)
        })
      }
      index++
    }, index * 1000)
  })
}
