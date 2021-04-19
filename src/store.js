let publicKey = ''
let bitCloutPrice = 0
let walletPortfolio = []

let mention = {
  suggest: false,
  usernamePrefix: '',
  lastInteraction: 0
}

function getStorePublicKey() {
  return publicKey
}

function setStorePublicKey(newPublicKey) {
  publicKey = newPublicKey
}

function getStoreBitCloutPrice() {
  return bitCloutPrice
}

function setStoreBitCloutPrice(newBitCloutPrice) {
  bitCloutPrice = newBitCloutPrice
}

function getStoreWalletPortfolio() {
  return new Promise(function (resolve, reject) {
    resolve(walletPortfolio)
  })
}

function setStoreWalletPortfolio(newWalletPortfolio) {
  return new Promise(function (resolve, reject) {
    walletPortfolio = newWalletPortfolio
    resolve()
  })
}

function getStoreMention() {
  return mention
}

function setStoreMention(newMention) {
  return new Promise(function (resolve, reject) {
    mention = newMention
    resolve()
  })
}

export {
  getStorePublicKey,
  setStorePublicKey,
  getStoreBitCloutPrice,
  setStoreBitCloutPrice,
  getStoreWalletPortfolio,
  setStoreWalletPortfolio,
  getStoreMention,
  setStoreMention
}
