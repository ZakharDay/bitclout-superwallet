import { buyOrSellUrl, getProfilesUrl, getFollowsStateless } from './urls'

import {
  clearCoinPriceCells,
  clearSharePriceInUsdCells,
  clearSharePriceInBitCloutCells,
  updateProfile,
  updateSharePriceInUsdCell,
  updateSharePriceInBitCloutCell,
  updateSidebar
} from './html_modifiers'

import {
  modifyHtmlSidebarOnFirstLoad,
  updateHtmlSidebar
} from './sidebar_html_modifiers'

import { updateHtmlDropdown } from './browse_html_modifiers'
import { getStorePublicKey } from './store'
import { updateWalletPortfolioItemData } from './actions'

function getApiWalletPortfolioItemData(item) {
  return new Promise(function (resolve, reject) {
    const publicKey = getStorePublicKey()

    const data = {
      AddGlobalFeedBool: false,
      Description: '',
      FetchUsersThatHODL: true,
      ModerationType: '',
      NumToFetch: 1,
      OrderBy: 'newest_last_post',
      PublicKeyBase58Check: '',
      ReaderPublicKeyBase58Check: publicKey,
      Username: item.username,
      UsernamePrefix: ''
    }

    fetch(getProfilesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data)
      })
      .catch((error) => {
        resolve(error)
        console.error('Error:', error)
      })
  })
}

function getApiCreatorCoinBuyOrSellData(creatorData) {
  const publicKey = getStorePublicKey()

  return new Promise(function (resolve, reject) {
    const data = {
      BitCloutToAddNanos: 0,
      BitCloutToSellNanos: 0,
      Broadcast: false,
      CreatorCoinToSellNanos: creatorData.holderBalanceNanos,
      CreatorPublicKeyBase58Check: creatorData.publicKey,
      MinBitCloutExpectedNanos: 0,
      MinCreatorCoinExpectedNanos: 0,
      MinFeeRateNanosPerKB: 1000,
      OperationType: 'sell',
      SeedInfo: null,
      Sign: false,
      UpdaterPublicKeyBase58Check: publicKey,
      Validate: false
    }

    fetch(buyOrSellUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data)
        // console.log('Success:', data)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  })
}

function getChromeStorageWatchedCreatorsData() {
  chrome.storage.sync.get('creatorList', ({ creatorList }) => {
    if (creatorList.length > 0 && creatorList[0] != '') {
      modifyHtmlSidebarOnFirstLoad(creatorList)
    }
  })
}

function getApiSidebarCreatorCoinData(username, order) {
  const publicKey = getStorePublicKey()

  const data = {
    AddGlobalFeedBool: false,
    Description: '',
    FetchUsersThatHODL: true,
    ModerationType: '',
    NumToFetch: 1,
    OrderBy: 'newest_last_post',
    PublicKeyBase58Check: '',
    ReaderPublicKeyBase58Check: publicKey,
    Username: username,
    UsernamePrefix: ''
  }

  fetch(getProfilesUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      updateHtmlSidebar(data, order)
      // console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function getApiPostMentionData(prefix) {
  const publicKey = getStorePublicKey()

  const data = {
    AddGlobalFeedBool: false,
    Description: '',
    FetchUsersThatHODL: false,
    ModerationType: '',
    NumToFetch: 6,
    OrderBy: '',
    PublicKeyBase58Check: '',
    ReaderPublicKeyBase58Check: publicKey,
    Username: '',
    UsernamePrefix: prefix
  }

  return new Promise(function (resolve, reject) {
    fetch(getProfilesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data)
        // console.log('Success:', data)
      })
      .catch((error) => {
        resolve()
        console.error('Error:', error)
      })
  })
}

export {
  getApiWalletPortfolioItemData,
  getApiCreatorCoinBuyOrSellData,
  getChromeStorageWatchedCreatorsData,
  getApiSidebarCreatorCoinData,
  getApiPostMentionData
}
