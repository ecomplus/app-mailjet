'use strict'
const { ecomAuth } = require('ecomplus-app-sdk')
const logger = require('console-files')
const mj = require('node-mailjet')
const sql = require('./sql')
/**
 * @description Verifica se o aplicativo foi completamente configurado.
 */
module.exports.appManager = () => {
  console.log('AppManager is running.')
  //
  let query = 'SELECT application_id, store_id FROM mailjet_app_settings WHERE setted_up = ?'
  let index = 0
  //
  sql.db.each(query, [0], (erro, rows) => {
    setTimeout(async () => {
      if (erro) {
        logger.error(erro)
      } else {
        ecomAuth.then(async sdk => {
          let apiRequest = await sdk.apiRequest(rows.store_id, 'applications/' + rows.application_id, 'GET', null).catch(e => console.log(e, 'ecomplus_api_request'))
          // tem resposta?
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
              // tem todas?
              // então registro procedure
              let procedure = {
                'title': 'Mailjet Notifications',
                'triggers': [
                  {
                    'method': 'POST',
                    'resource': 'orders'
                  },
                  {
                    'method': 'POST',
                    'resource': 'products'
                  },
                  {
                    'method': 'POST',
                    'resource': 'customers'
                  },
                  {
                    'method': 'POST',
                    'resource': 'carts'
                  }
                ],
                'webhooks': [
                  {
                    'api': {
                      'external_api': {
                        'uri': 'https://mailjet.ecomplus.biz/notifications'
                      }
                    },
                    'method': 'POST',
                    'send_body': true
                  }
                ],
                'tag': 'order_actions'
              }
              sdk.apiRequest(rows.store_id, '/procedures.json', 'POST', procedure).then(async () => {
                // procedure registrado
                // crio lista default no mailjet
                let defaultList = await mj.post('contactslist').request({ 'Name': 'Ecomplus' + Math.floor((Math.random() * 99999) + 1) })

                // busco costumers da x-store-id
                let apiRequest = await sdk.apiRequest(rows.store_id, '/customers.json', 'GET', '').catch(e => console.log(e, 'ecomplus_app_sdk'))

                // crio array com nome e e-mail dos costumers
                let costumersList = apiRequest.response.data.result.map(customer => {
                  return {
                    Email: customer.main_email,
                    Name: customer.display_name
                  }
                })

                // set api key
                // e api secret que
                // vieram do hidden_data do app
                mj.connect(application.hidden_data.mailjet_key, application.hidden_data.mailjet_secret)

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
                      setted_up: 1
                    }
                    // atualizo config do mj no db
                    sql.update(data, { store_id: rows.store_id, application_id: rows.application_id }, 'mailjet_app_settings')
                  })
                  .catch((err) => {
                    logger.error(err.statusCode)
                  })
              })
                .catch(e => {
                  console.log(e)
                })
            }
          }
        })
        ecomAuth.catch(err => {
          logger.error(err)
          setTimeout(() => {
            process.exit(1)
          }, 1000)
        })
      }
      index++
    }, index * 1000)
  })
}
