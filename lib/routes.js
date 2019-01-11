'use strict'
const router = require('express').Router()
const { handle } = require('./mailjet/callback')

router.route('/callback')
  .post(handle)

router.route('/notifications')
  .post()

module.exports = router
