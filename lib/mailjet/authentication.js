const sql = require('./sql')
const rq = require('request')
const ENTITY = 'app_auth'

class Auth {
  async getAppInfor (app) {
    let find = await sql.select({ application_app_id: app.application.app_id }, ENTITY).catch(e => console.log(e))
    let params = {
      application_id: app.application._id,
      application_app_id: app.application.app_id,
      application_title: app.application.title,
      authentication_id: app.authentication._id,
      authentication_permission: JSON.stringify(app.authentication.permissions),
      x_store_id: app.x_store_id
    }
    if (find) {
      await sql.insert(params, ENTITY).catch(e => console.log(e))
    } else {
      let where = { application_app_id: app.application.app_id }
      await sql.update(params, where, ENTITY).catch(e => console.log(e))
    }
    this.getAppToken(app)
  }

  async getAppToken (app) {
    return rq.post({
      method: 'POST',
      uri: 'https://api.e-com.plus/v1/_callback.json',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-ID': app.x_store_id
      },
      body: { '_id': app.authentication._id },
      json: true
    })
  }

  async setAppToken (app, xstoreid) {
    try {
      console.log(app)
      return await sql.update({ app_token: app.access_token }, { x_store_id: xstoreid, authentication_id: app.my_id }, ENTITY)
    } catch (e) {
      return console.log(e)
    }
  }
}

module.exports = Auth