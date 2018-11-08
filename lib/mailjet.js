const Authentication = require('./mailjet/authentication')

module.exports = {
  authenticationApp: (request, response) => {
    let auth = new Authentication()
    let body = request.body
    if (!body.access_token) {
      auth.getAppInfor(body).then(r => response.end())
    } else {
      auth.setAppToken(body, request.headers['x-store-id']).then(r => response.end())
    }
  }
}
