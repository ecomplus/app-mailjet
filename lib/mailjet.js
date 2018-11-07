const Authentication = require('./mailjet/authentication')

module.exports = {
  authenticationApp: (request, response) => {
    let auth = new Authentication()
    if (!request.body.access_token) {
      auth.getAppInfor(request.body)
    } else {
      auth.setAppToken(request.body, request.headers['x-store-id'])
    }
  }
}
