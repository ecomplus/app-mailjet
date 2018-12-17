'use strict'
const router = require('express').Router()
const authentication = require('./mailjet/authentication')
const mailjet = require('./mailjet/mailjet')
const middlewares = require('./mailjet/middleware')

router.route('/callback')
  .post(authentication.setEcomAuth)

router.route('/notifications')
  .post(middlewares.validateRequest, mailjet.handle)

module.exports = router
