const config = require('./config')
const mailjet = require('node-mailjet').connect(config.MJ_APIKEY, config.MJ_SECRETKEY)
const Authentication = require('./mailjet/authentication')
const Ecomplus = require('./mailjet/ecomplus')
const SQL = require('./mailjet/sql')
const wh = require('./mailjet/webhook')

let authenticationApp = (request, response) => {
  let auth = new Authentication()
  let body = request.body
  if (!body.access_token) {
    auth.getAppInfor(body).then(r => response.end())
  } else {
    auth.setAppToken(body, request.headers['x-store-id']).then(r => response.end())
    sentCostumers(request.headers['x-store-id'])
  }
}

let sentCostumers = async (storeId) => {
  setListDefault(storeId)
    .then(async resp => {
      let customers = await getEcomCostumers(storeId)
      saveListDefault(resp.body.Data[0].ID, storeId)
      wh.register(storeId)
      mailjet
        .post('contactslist')
        .id(resp.body.Data[0].ID)
        .action('ManageManyContacts')
        .request(JSON.stringify({
          Action: 'addforce',
          Contacts: customers
        }))
        .then((result) => {
          console.log(result.body)
        })
        .catch((err) => {
          console.log(err.statusCode)
        })
    })
    .catch(e => {
      console.log(e)
    })
}

let getEcomCostumers = async (storeId) => {
  let ecom = new Ecomplus()
  let customers = await ecom.getCustomerData(storeId)
  customers = JSON.parse(customers)
  let resp = customers.result.map(customer => {
    return {
      Email: customer.main_email,
      Name: customer.display_name
    }
  })
  return resp
}

let setListDefault = async (storeId) => {
  return mailjet
    .post('contactslist')
    .request({
      'Name': 'My Customers'
    })
}

let saveListDefault = async (list, storeId) => {
  SQL.insert({ default_list_id: list, store_id: storeId }, 'app_mailjet')
}

let handle = (storeId, trigger) => {
  console.log(trigger.resource)
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
    const ecomplus = new Ecomplus()
    let application = await ecomplus.getAppData(storeId)
    let order = await ecomplus.getOrderData(storeId, trigger.inserted_id)
    application = JSON.parse(application)
    order = JSON.parse(order)
    if (trigger.action === 'create') {
      let templates = application.hidden_data.mailjet_templates.find(template => template.trigger === 'order_confirmation')
      console.log(templates)
      if (templates) {
        let data = {
          'Messages': [
            {
              'From': {
                'Email': 'talissonf@gmail.com',
                'Name': 'Teste'
              },
              'To': [
                {
                  'Email': 'talissonf@me.com', // order.buyers[0].main_email,
                  'Name': order.buyers[0].display_name
                }
              ],
              'TemplateID': templates.id,
              'TemplateLanguage': true,
              'Variables': {
                'name': 'Cu',
                'status_link': 'adasdsad',
                'number': '212312312312',
                'shipping_lines': [
                  {
                    'delivery_time': {
                      'days': 1
                    }
                  }
                ],
                'items': [
                  {
                    'name': 'Cu',
                    'price': 1212,
                    'quantity': 1,
                    'final_price': 1212323,
                    'picture': {
                      'big': {
                        'url': 'sjdiuasjidjaosdijasijdijasoijdi'
                      }
                    }
                  }
                ],
                'currency_symbol': 'sadasdas',
                'amount': {
                  'subtotal': 123123123,
                  'freight': 'asdasda',
                  'discount': 'asdsad',
                  'total': 'adsadsadsa'
                },
                'var1': 'asdasdasd',
                'var2': 'dasdasdas'
              },
              'Subject': 'Order Confirmation',
              'TemplateErrorDeliver': true,
              'TemplateErrorReporting': {
                'Name': 'Talisson',
                'Email': 'talissonf@gmail.com'
              }
            }
          ]
        }
        mailjetSend(application, data)
      }
    } else if (trigger.action === 'change') {

    }
  },
  customers: (trigger) => {

  },
  carts: (trigger) => {

  }
}

const mailjetSend = (app, data) => {
  //const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)
  const request = mailjet
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


module.exports = {
  authenticationApp,
  handle
}