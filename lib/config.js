'use strict'
require('dotenv').config()
module.exports = {
  BD_PATH: process.env.BD_PATH,
  MJ_APIKEY: process.env.MJ_APIKEY,
  MJ_SECRETKEY: process.env.MJ_SECRETKEY
}
