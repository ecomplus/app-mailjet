const mailjet = require('./mailjet')

let routes = {
  auth: {
    app: (request, response) => mailjet.authenticationApp(request, response)
  }
}

module.exports = routes
