import {
  buyOrSellUrl,
  getProfilesUrl,
  getFollowsStateless,
  getUsersUrl
} from './urls'

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

        if (process.env.NODE_ENV === 'development') {
          console.log('DEV Success:', data)
        }
      })
      .catch((error) => {
        // resolve(error)
        if (process.env.NODE_ENV === 'development') {
          console.error('DEV Error:', error)
        }
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

        // if (process.env.NODE_ENV === 'development') {
        //   console.log('Success:', data)
        // }
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  })
}

function getChromeStorageWatchedCreatorsData() {
  chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
    if (userListToWatch.length > 0 && userListToWatch[0] != '') {
      chrome.storage.sync.get((items) => {
        let users = []

        Object.keys(items).forEach((key, i) => {
          if (userListToWatch.includes(key)) {
            users.push(items[key])
          }
        })

        modifyHtmlSidebarOnFirstLoad(users)
      })
    }
  })
}

function getApiSidebarCreatorCoinData(userListToWatchItem, order) {
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
    Username: userListToWatchItem.username,
    UsernamePrefix: ''
  }

  // console.log('Request', userListToWatchItem, data)

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

      if (process.env.NODE_ENV === 'development') {
        console.log('DEV Success:', data)
      }
    })
    .catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('DEV Error:', error)
      }
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

function getApiUsersData(publicKeys) {
  return new Promise(function (resolve, reject) {
    const data = {
      PublicKeysBase58Check: publicKeys
    }

    // console.log('publicKeys', publicKeys)

    fetch(getUsersUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log('Success getUsers:', data)
        resolve(data)
      })
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('DEV Error:', error)
        }
      })
  })
}

export {
  getApiWalletPortfolioItemData,
  getApiCreatorCoinBuyOrSellData,
  getChromeStorageWatchedCreatorsData,
  getApiSidebarCreatorCoinData,
  getApiPostMentionData,
  getApiUsersData
}
