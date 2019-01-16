'use strict'
const router = require('express').Router()
const { handle } = require('./mailjet/callback')
const { handleNotification } = require('./mailjet/notifications')
const { appIsSettedUp, logRequest } = require('./middleware')

router.route('/callback')
  .post(logRequest, handle)

router.route('/notifications')
  .post(logRequest, appIsSettedUp, handleNotification)

module.exports = router
