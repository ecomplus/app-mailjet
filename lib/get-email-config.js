const { listOfActions, convertCustomAction } = require('./trigger-actions')

// Busca o templante do cara, verifica primeiro se existe algum template
// configurado no hidden_data do app, se não, ele busca a configuração default que ta no ./trigger-actions.js
const getTemplante = (status, templanteList) => {
  if (templanteList && templanteList.length) {
    const statusConverted = convertCustomAction(status)
    const templante = templanteList.find(templante => templante.trigger === statusConverted)
    if (templante && templante.id) {
      return {
        id: templante.id,
        isLojistaConfig: true
      }
    }
  }
  return {
    id: listOfActions.find(action => action.action === status).templanteId,
    isLojistaConfig: false
  }
}

const capitalizeKey = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Pega o assunto configurado nas configurações default do app
// TODO: Poder sobescrever o assunto padrão do app 
const getSubject = (configObj, status, number) => {
  const lang = (configObj.lang && configObj.lang === 'Inglês') ? 'en_us' : 'pt_br'
  const action = listOfActions.find(act => act.action === status)
  return action.subject[lang] + ' #' + number
}

/**
 * Este handle monta o objeto que será enviado para api do mailjet,
 * ele busca as configurações do lojista no hidden_data, caso não haja
 * ele usa as configurações defaults que estão no app.
 * @param {Object} configObj configuração do app
 * @param {Object} store objeto com configuração da loja body em v1/stores.json
 * @param {Number} orderNumber numero do pedido
 * @param {String} orderStatus status do pedido
 * @returns Mailjet Object
 */

module.exports = (configObj, store, orderNumber, orderStatus) => {
  let TemplateID = null
  let isLojistaConfig = false
  // primeiro monto a configuração como se o lojista não houvesse nada configurado
  // assim uso o templante configurado no app e tmb os secret e key do mailjet configurado
  // nas variáveis de ambiente do app
  const config = {
    TemplateID: getTemplante(orderStatus).id,
    From: {
      Name: store.name,
      Email: 'noreply@e-com.club'
    },
    mailjet_secret: process.env.MAILJET_SECRET || null,
    mailjet_key: process.env.MAILJET_KEY || null,
    Subject: getSubject(configObj, orderStatus, orderNumber)
  }

  // tento utiliza as configurações do lojista caso ele tenha configurado o necessário
  // templantes, secret e key
  if (configObj.mailjet_templates && configObj.mailjet_key && configObj.mailjet_secret) {
    const templante = getTemplante(orderStatus, configObj.mailjet_templates)
    TemplateID = templante.id
    isLojistaConfig = templante.isLojistaConfig
  }

  // caso o lojista tenha configurado algum templante de email
  // uso o secret e key configurado por ele no app
  if (isLojistaConfig) {
    ;['mailjet_key', 'mailjet_secret'].forEach(key => {
      if (configObj && configObj[key] && TemplateID) {
        config[key] = configObj[key]
      }
    })
  }

  if (configObj.mailjet_from) {
    for (const key in configObj.mailjet_from) {
      if (Object.hasOwnProperty.call(configObj.mailjet_from, key)) {
        config.From[capitalizeKey(key)] = configObj.mailjet_from[key]
      }
    }
  }

  if (TemplateID) {
    config.TemplateID = TemplateID
  }

  return config
}
