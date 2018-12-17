const config = require('../config')
const mj = require('node-mailjet').connect(config.MJ_APIKEY, config.MJ_SECRETKEY)
const logger = require('console-files')
const Authentication = require('./authentication')
const ecomplus = require('./ecomplus')
const SQL = require('./sql')
const webhook = require('./webhook')
// old
const authenticationApp = (request, response) => {
  let auth = new Authentication()
  let body = request.body
  if (!body.access_token) {
    auth.getAppInfor(body).then(r => response.end())
  } else {
    auth.setAppToken(body, request.headers['x-store-id']).then(r => response.end())
    registerCostumers(request.headers['x-store-id'])
  }
}
// ok
const registerCostumers = async storeId => {
  //
  let list = await setListDefault(storeId).catch(erro => {
    logger.error('Erro ao registrar uma lista padrão para a X-Store-Id informado \n\tStack: Regiter Costumers \n\tErro: ' + erro)
  })
  //
  if (list) {
    //
    let customers = await ecomplus.getCustomerData(storeId)
    //
    if (customers) {
      //
      customers = JSON.parse(customers)
      //
      let listOfCustomers = customers.result.map(customer => {
        return {
          Email: customer.main_email,
          Name: customer.display_name
        }
      })
      //
      mj
        .post('contactslist')
        .id(list.body.Data[0].ID)
        .action('ManageManyContacts')
        .request(JSON.stringify({
          Action: 'addforce',
          Contacts: listOfCustomers
        }))
        .catch((err) => {
          console.log(err.statusCode)
        })
    }
    webhook.register(storeId)
    //
    saveListDefault(list.body.Data[0].ID, storeId)
  }
}

// ok
const setListDefault = async storeId => {
  return mj
    .post('contactslist')
    .request({
      'Name': 'Ecomplus'
    })
}

// ok
const saveListDefault = async (list, storeId) => {
  SQL.insert({ default_list_id: list, store_id: storeId }, 'mailjet_app')
}

const handle = (request, response) => {
  //
  if (!request.body || !request.headers['x-store-id'] || request.headers['x-store-id'] < 0) {
    logger.log('Erro: Body vazio, X-Store-Id inválido ou não informado.')
    response.status(400)
    response.end()
  }
  //
  let trigger = request.body
  let storeId = request.headers['x-store-id']
  //
  switch (trigger.resource) {
    case 'orders':
      send.orders(storeId, trigger)
      break
    case 'customers':
      send.customers(storeId, trigger)
      break
    case 'carts':
      send.carts(storeId, trigger)
      break
    default: break
  }
}

let send = {
  orders: async (storeId, trigger) => {
    //
    let application = await ecomplus.getAppData(storeId)
    application = JSON.parse(application)

    let order = await ecomplus.getOrderData(storeId, trigger.inserted_id)
    let templates

    order = JSON.parse(order)
    if (trigger.action === 'create') {
      templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'order_confirmation')
    } else if (trigger.action === 'change') {
      if (trigger.subresource === 'shipping_lines') {
        let field = trigger.fields.find(f => {
          if (f === 'status') {
            return f
          }
        })
        if (field) {
          let templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'shipping_confirmation')
        }
      } else if (trigger.subresource === 'transactions') {
        let field = trigger.fields.find(f => {
          if (f === 'status') {
            return f
          }
        })
        if (field) {
          let templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'payment_confirmation')
        }
      }
    } else if (trigger.action === 'any') {
    }
    let orderParse
    let data = {
      'Messages': [
        {
          'From': {
            'Email': application.hidden_data.mailjet_from.email,
            'Name': application.hidden_data.mailjet_from.name
          },
          'To': [
            {
              'Email': order.buyers[0].main_email,
              'Name': order.buyers[0].display_name
            }
          ],
          'TemplateID': templates.id,
          'TemplateLanguage': true,
          'Variables': orderParse,
          'Subject': 'Order Confirmation',
          'TemplateErrorDeliver': true,
          'TemplateErrorReporting': {
            'Email': application.hidden_data.mailjet_from.email,
            'Name': application.hidden_data.mailjet_from.name
          }
        }
      ]
    }
    mailjetSend(application, data)
  },
  customers: (trigger) => {
  },
  carts: (trigger) => {
  }
}

const mailjetSend = (app, data) => {
  const request = mj
    .post('send', { 'version': 'v3.1' })
    .request(data)
  request
    .then((result) => {
      console.log(JSON.stringify(result.body, 'undefined', 4))
    })
    .catch((err) => {
      console.log(err)
    })
}

let parse = {
  order: (order, schema) => {
    let newOrder = schema.properties.map(prop => {
      if (order.hasOwnProperty(prop)) {
      }
    })
    return newOrder
  }
}

module.exports = {
  authenticationApp,
  handle
}
