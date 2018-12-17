'use strict'
//
const validateRequest = async (request, response, next) => {
  //
  const logger = require('console-files')
  //
  if (!request.body || !request.headers['x-store-id'] || request.headers['x-store-id'] < 0) {
    logger.log('Erro: Body vazio, X-Store-Id inválido ou não informado.')
    console.log('Erro: Body vazio, X-Store-Id inválido ou não informado.')
    response.status(400)
    response.end()
  }
  //
  const ecomplus = require('./ecomplus')
  //
  let storeId = request.headers['x-store-id']
  let application = await ecomplus.getAppData(storeId).catch(erro => console.log('Erro:'))
  //
  if (!application) {
    logger.log('Aplicativo não instalado na X-Store-Id ' + storeId)
    console.log('Aplicativo não instalado na X-Store-Id ' + storeId)
    response.status(400)
    return response.end()
  }
  //
  application = JSON.parse(application)
  //
  const appKeyIsSetted = () => {
    if (application.hasOwnProperty('hidden_data') && (!application.hidden_data.hasOwnProperty('mailjet_key') || !application.hidden_data.hasOwnProperty('mailjet_secret'))) {
      logger.log('Erro: mailjet_key e mailjet_secret não configurado.')
      console.log('Erro: mailjet_key e mailjet_secret não configurado.')
      return false
    }
    return true
  }
  //
  const templatesIsSetted = () => {
    if (application.hasOwnProperty('hidden_data') && !application.hidden_data.hasOwnProperty('mailjet_templates')) {
      logger.log('Erro: mailjet_templates não configurado.')
      console.log('Erro: mailjet_templates não configurado.')
      return false
    }
    return true
  }
  //
  const fromIsSetted = () => {
    if (application.hasOwnProperty('hidden_data') && !application.hidden_data.hasOwnProperty('mailjet_from')) {
      logger.log('Erro: mailjet_from não configurado.')
      console.log('Erro: mailjet_from não configurado.')
      return false
    }
    return true
  }
  //
  if (!appKeyIsSetted || !templatesIsSetted || !fromIsSetted) {
    response.status(400)
    return response.end()
  }
  //
  console.log('next')
  return next()
}
//
module.exports = {
  validateRequest
}
