import { prepareSidebarForNextDataLoad } from './sidebar_html_modifiers'

import {
  updateHtmlWalletPortfolio,
  addHtmlWalletPortfolioItemBitCloutPulseLink
} from './wallet_html_modifiers'

import {
  getApiWalletPortfolioItemData,
  getApiCreatorCoinBuyOrSellData
} from './server_requests'

import {
  getStorePublicKey,
  getStoreWalletPortfolio,
  setStoreWalletPortfolio
} from './store'

import {
  mergeDataWalletPortfolioItem,
  mergeDataWalletPortfolioItemShare
} from './data_modifiers'

function updateDataWalletPortfolio() {
  const publicKey = getStorePublicKey()

  getStoreWalletPortfolio().then((portfolio) => {
    portfolio.forEach((item, i) => {
      item.expectedBitCloutReturnedNanos = '-'

      getApiWalletPortfolioItemData(item).then((data) => {
        let newItem = mergeDataWalletPortfolioItem(item, data)
        updateDataWalletPortfolioItem(newItem)
        addHtmlWalletPortfolioItemBitCloutPulseLink(newItem)

        data['ProfilesFound'][0]['UsersThatHODL'].forEach((userThatHODL, i) => {
          if (publicKey === userThatHODL['HODLerPublicKeyBase58Check']) {
            newItem.holderBalanceNanos = userThatHODL['BalanceNanos']

            getApiCreatorCoinBuyOrSellData(newItem).then((data) => {
              newItem = mergeDataWalletPortfolioItemShare(newItem, data)
              updateDataWalletPortfolioItem(newItem)
            })
          }
        })
      })
    })
  })
}

function updateDataWalletPortfolioItem(data) {
  getStoreWalletPortfolio().then((portfolio) => {
    let newPortfolio = []

    portfolio.forEach((item, i) => {
      if (item.username === data.username) {
        newPortfolio.push(data)
      } else {
        newPortfolio.push(item)
      }
    })

    setStoreWalletPortfolio(newPortfolio).then(() =>
      updateHtmlWalletPortfolio()
    )
  })
}

export { updateDataWalletPortfolio }
