const mailjet = require('./mailjet')

let routes = {
  auth: {
    app: (request, response) => mailjet.authenticationApp(request, response)
  },
  webhooks: {
    notifications: (request, response) => {
      mailjet.handle(request.headers['x-store-id'], request.body)
    }
  }
}

module.exports = routes
