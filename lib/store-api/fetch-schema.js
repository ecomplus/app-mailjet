module.exports = (appSdk, storeId) => {
  let url = '/orders/schema.json'
  let method = 'GET'
  return appSdk.apiRequest(storeId, url, method).then(result => result.response.data)
}
