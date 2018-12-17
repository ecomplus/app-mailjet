'use strict'
const sql = require('./sql')
const rq = require('request')

const setEcomAuth = (request, response) => {
  if (!request.body.access_token) {
    setAppInfor(request.body)
      .then(() => {
        response.status(200)
        return response.end()
      })
      .catch(e => {
        console.log(e)
        response.status(400)
        return response.end()
      })
  }
  //
  setAppToken(request.body, request.headers['x-store-id'])
    .then(() => {
      response.status(200)
      return response.end()
    })
    .catch(e => {
      console.log(e)
      response.status(400)
      return response.end()
    })
}

const setAppInfor = async (app) => {
  let find = await sql.select({ store_id: app.store_id }, 'ecomplus_app_auth').catch(e => console.log(e))
  let params = {
    application_id: app.application._id,
    application_app_id: app.application.app_id,
    application_title: app.application.title,
    authentication_id: app.authentication._id,
    authentication_permission: JSON.stringify(app.authentication.permissions),
    store_id: app.store_id
  }
  if (!find) {
    //
    sql.insert(params, 'ecomplus_app_auth').catch(e => console.log(e))
    //
  } else {
    let where = { store_id: app.store_id }
    sql.update(params, where, 'ecomplus_app_auth').catch(e => console.log(e))
  }
  //
  getAppToken(app)
}

const getAppToken = async (app) => {
  return rq.post({
    method: 'POST',
    uri: 'https://api.e-com.plus/v1/_callback.json',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-ID': app.store_id
    },
    body: { '_id': app.authentication._id },
    json: true
  })
}

const setAppToken = async (app, xstoreid) => {
  return sql.update({ app_token: app.access_token }, { store_id: xstoreid, authentication_id: app.my_id }, 'ecomplus_app_auth')
    .catch(e => console.log(e))
}

module.exports = {
  setEcomAuth
}
