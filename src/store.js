let publicKey = ''
let profilePublicKey = ''
let bitCloutPrice = 0
let walletPortfolio = []
let creatorWallet = []
let profile = {}
let portfolioLength = 0
let portfolio = []

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
    // console.log('PORTFOLIO', walletPortfolio)
    resolve(walletPortfolio)
  })
}

function setStoreWalletPortfolio(newWalletPortfolio) {
  return new Promise(function (resolve, reject) {
    walletPortfolio = newWalletPortfolio
    resolve()
  })
}

function getStorePortfolioLength() {
  return portfolioLength
}

function setStorePortfolioLength(newPortfolioLength) {
  return new Promise(function (resolve, reject) {
    portfolioLength = newPortfolioLength
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

function getStoreProfilePublicKey() {
  return profilePublicKey
}

function setStoreProfilePublicKey(newProfilePublicKey) {
  profilePublicKey = newProfilePublicKey
}

function getStoreProfile() {
  return profile
}

function setStoreProfile(newProfile) {
  return new Promise(function (resolve, reject) {
    profile = newProfile
    resolve()
  })
}

function getStoreCreatorWallet() {
  return creatorWallet
}

function setStoreCreatorWallet(newCreatorWallet) {
  return new Promise(function (resolve, reject) {
    creatorWallet = newCreatorWallet
    resolve()
  })
}

function addStorePortfolio(item) {
  portfolio.push(item)
}

export {
  getStorePublicKey,
  setStorePublicKey,
  getStoreBitCloutPrice,
  setStoreBitCloutPrice,
  getStoreWalletPortfolio,
  setStoreWalletPortfolio,
  getStoreMention,
  setStoreMention,
  getStoreProfilePublicKey,
  setStoreProfilePublicKey,
  getStoreProfile,
  setStoreProfile,
  getStoreCreatorWallet,
  setStoreCreatorWallet,
  getStorePortfolioLength,
  setStorePortfolioLength,
  addStorePortfolio
}
