import getCaretCoordinates from 'textarea-caret'
import { updateDataWalletPortfolio } from './actions'
import { mergeDataWalletPortfolioItem } from './data_modifiers'

import {
  injectHtmlCss,
  markHtmlBody,
  getHtmlBitCloutPrice,
  addHtmlUserExternalLinks
} from './html_modifiers'

import {
  addHtmlDropdown,
  hideHtmlDropdown,
  updateHtmlDropdown
} from './browse_html_modifiers'

import {
  getApiWalletPortfolioItemData,
  getChromeStorageWatchedCreatorsData,
  getApiPostMentionData
} from './server_requests'

import {
  setStorePublicKey,
  setStoreBitCloutPrice,
  setStoreWalletPortfolio,
  getStoreMention,
  setStoreMention
} from './store'

import {
  addHtmlProfileFounderRewardPercentage,
  prepareHtmlProfileTabs
} from './profile_html_modifiers'

import {
  getHtmlWalletPublicKey,
  getHtmlWalletPortfolio,
  addHtmlWalletUpdateButton,
  modifyHtmlWalletGridOnFirstLoad,
  prepareHtmlWalletForNextDataLoad
} from './wallet_html_modifiers'

function observeUrlChange() {
  let lastUrl = location.href

  new MutationObserver(() => {
    const url = location.href

    if (url !== lastUrl) {
      lastUrl = url
      onUrlChange()
    }
  }).observe(document, { subtree: true, childList: true })

  function onUrlChange() {
    waitAsyncPageLoad()
  }
}

function waitAsyncPageLoad() {
  const pathname = window.location.pathname
  const urlPart = pathname.substr(1)
  const urlPartFirstLetter = urlPart.charAt(0)
  const urlPartSecondLetter = urlPart.charAt(1)
  const firstLettersAccepted = ['w', 'u', 'b']

  document.addEventListener('click', () => {
    initModalCatcher()
  })

  if (firstLettersAccepted.includes(urlPartFirstLetter)) {
    let detectionElement = document.getElementsByClassName(
      'global__center__inner'
    )

    if (detectionElement != null && detectionElement.length > 0) {
      injectHtmlCss()
      markHtmlBody(urlPartFirstLetter)

      if (urlPartFirstLetter === 'w') {
        initWalletPage()
        initSidebar()
      } else if (urlPartFirstLetter === 'u') {
        const urlLastPart = urlPart.substr(urlPart.lastIndexOf('/') + 1)

        if (urlLastPart != 'buy' && urlLastPart != 'sell') {
          initProfilePage()
        }
      } else if (urlPartFirstLetter === 'b' && urlPartSecondLetter === 'r') {
        initBrowsePage()
      }
    } else {
      setTimeout(() => {
        waitAsyncPageLoad()
      }, 1000)
    }
  }
}

function initModalCatcher() {
  const textarea = document.querySelector('modal-container textarea')
  const button = document.querySelector('modal-container .btn.btn-primary')

  if (textarea && button) {
    textarea.addEventListener('keydown', (e) => {
      if (e.metaKey === true && e.key === 'Enter') {
        button.click()
      }
    })
  }
}

function initWalletPage() {
  const bitCloutPrice = getHtmlBitCloutPrice()
  setStoreBitCloutPrice(bitCloutPrice)

  const publicKey = getHtmlWalletPublicKey()
  setStorePublicKey(publicKey)

  const walletPortfolio = getHtmlWalletPortfolio()

  setStoreWalletPortfolio(walletPortfolio)
    .then(modifyHtmlWalletGridOnFirstLoad)
    .then(prepareHtmlWalletForNextDataLoad)
    .then(updateDataWalletPortfolio)
    .then(addHtmlWalletUpdateButton)
}

function initProfilePage() {
  const pathname = window.location.pathname
  const detectionElement = document.getElementsByClassName('bitCloutPulseLink')
  const creatorProfileTopCard = document.querySelector(
    '.global__center__inner .position-relative'
  )

  if (detectionElement.length == 0 && creatorProfileTopCard != null) {
    const secondDetectionElement = document.getElementsByClassName(
      'bitCloutPulseLink'
    )

    if (secondDetectionElement.length == 0) {
      let item = {}
      item.username = pathname.substr(3)
      getApiWalletPortfolioItemData(item).then((data) => {
        item = mergeDataWalletPortfolioItem(item, data)
        addHtmlUserExternalLinks(item, creatorProfileTopCard)
        addHtmlProfileFounderRewardPercentage(item)
      })

      prepareHtmlProfileTabs()
    }
  } else {
    setTimeout(() => {
      initProfilePage()
    }, 1000)
  }
}

function initSidebar() {
  const detectionElement = document.getElementsByTagName(
    'right-bar-creators-leaderboard'
  )

  if (
    detectionElement.length <= 1 &&
    detectionElement[0].childNodes.length == 1
  ) {
    setTimeout(() => {
      initSidebar()
    }, 1000)
  } else {
    getChromeStorageWatchedCreatorsData()
  }
}

// TODO: Refactor this
function initBrowsePage() {
  const bitCloutPrice = getHtmlBitCloutPrice()
  setStoreBitCloutPrice(bitCloutPrice)
  addHtmlDropdown()

  const textarea = document.querySelector('textarea.feed-create-post__textarea')
  const dropdown = document.createElement('div')

  document.addEventListener(
    'click',
    function (e) {
      if (!e.target.closest('.mentionDropdown')) {
        let mention = getStoreMention()

        if (mention.suggest === true) {
          mention = {
            suggest: false,
            usernamePrefix: '',
            lastInteraction: 0,
            data: {}
          }

          setStoreMention(mention)
          hideHtmlDropdown()
        }
      }
    },
    false
  )

  textarea.addEventListener('keydown', () => {
    const key = event.keyCode
    let mention = getStoreMention()

    if (key == 8 || key == 46) {
      const caretPlace = textarea.selectionEnd - 1
      const value = textarea.value.slice(0, caretPlace)

      const atPlace = value.lastIndexOf('@')
      const spacePlace = value.lastIndexOf(' ')
      const breakPlace = value.lastIndexOf('\n')

      if (atPlace != -1) {
        let usernamePrefix = ''
        if (spacePlace == -1 && breakPlace == -1) {
          usernamePrefix = value.slice(atPlace + 1, caretPlace)
        } else if (
          (spacePlace != -1 && atPlace > spacePlace) ||
          (breakPlace != -1 && atPlace > breakPlace)
        ) {
          usernamePrefix = value.slice(atPlace + 1, caretPlace)
        }

        dropdown.innerHTML = ''

        if (usernamePrefix != '') {
          getApiPostMentionData(usernamePrefix).then((data) => {
            mention = {
              suggest: true,
              usernamePrefix: usernamePrefix,
              lastInteraction: Date.now(),
              data: data
            }

            setStoreMention(mention).then(updateHtmlDropdown)
          })
        } else {
          mention = {
            suggest: false,
            usernamePrefix: '',
            lastInteraction: 0,
            data: {}
          }

          setStoreMention(mention).then(hideHtmlDropdown)
        }
      }
    } else if (key == 27) {
      mention = {
        suggest: false,
        usernamePrefix: '',
        lastInteraction: 0,
        data: {}
      }

      setStoreMention(mention).then(hideHtmlDropdown)
    }
  })

  textarea.addEventListener('input', () => {
    let mention = getStoreMention()
    const caretPlace = textarea.selectionEnd
    const value = textarea.value.slice(0, caretPlace)
    const atPlace = value.lastIndexOf('@')
    const spacePlace = value.lastIndexOf(' ')
    const breakPlace = value.lastIndexOf('\n')

    if (atPlace != -1) {
      let usernamePrefix = ''
      if (spacePlace == -1 && breakPlace == -1) {
        usernamePrefix = value.slice(atPlace + 1, caretPlace)
      } else if (
        (spacePlace != -1 && atPlace > spacePlace) ||
        (breakPlace != -1 && atPlace > breakPlace)
      ) {
        usernamePrefix = value.slice(atPlace + 1, caretPlace)
      }

      dropdown.innerHTML = ''

      if (usernamePrefix != '') {
        getApiPostMentionData(usernamePrefix).then((data) => {
          mention = {
            suggest: true,
            usernamePrefix: usernamePrefix,
            lastInteraction: Date.now(),
            data: data
          }

          setStoreMention(mention).then(updateHtmlDropdown)
        })
      } else {
        mention = {
          suggest: false,
          usernamePrefix: '',
          lastInteraction: 0,
          data: {}
        }

        setStoreMention(mention).then(hideHtmlDropdown)
      }
    }
  })
}
//
//
//
//
//
//
//
function getLast() {
  fetch('https://api.bitclout.com/api/v1')
    .then((response) => response.json())
    .then((data) => {
      console.log('getLast', data)
    })
}

function getTransaction(publicKey) {
  const requestData = {
    PublicKeyBase58Check: publicKey
    // IsMempool: true
  }

  fetch('https://api.bitclout.com/api/v1/transaction-info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success getTransaction:', data)

      let creatorCoinTransactions = []

      data['Transactions'].forEach((transaction, i) => {
        if (transaction['TransactionType'] === 'CREATOR_COIN') {
          creatorCoinTransactions.push(transaction)
        }
      })

      console.log('creatorCoinTransactions', creatorCoinTransactions)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function getBlock(hashHex) {
  const data = {
    FullBlock: true,
    HashHex: hashHex
  }

  fetch('https://api.bitclout.com/api/v1/block', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success getBlock:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function getProfile(creatorPublicKey, balanceNanos) {
  const publicKey = getStorePublicKey()
  const bitCloutPrice = getStoreBitCloutPrice()

  const data = {
    AddGlobalFeedBool: false,
    Description: '',
    FetchUsersThatHODL: true,
    ModerationType: '',
    NumToFetch: 1,
    OrderBy: 'newest_last_post',
    PublicKeyBase58Check: creatorPublicKey,
    ReaderPublicKeyBase58Check: publicKey,
    Username: '',
    UsernamePrefix: ''
  }

  fetch('https://api.bitclout.com/get-profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(
        data['ProfilesFound'][0]['Username'],
        calcAndFormatPortfolioItemPriceInBitClout(balanceNanos),
        calcAndFormatPortfolioItemPriceInUsd(balanceNanos)
      )
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function getUsers(publicKeys) {
  const data = {
    PublicKeysBase58Check: publicKeys
  }

  fetch('https://api.bitclout.com/get-users-stateless', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success getUsers:', data)

      // data['userData']['userList'][0]['UsersYouHODL'].forEach(
      //   (userYouHODL, i) => {
      //     getProfile(
      //       userYouHODL['CreatorPublicKeyBase58Check'],
      //       userYouHODL['BalanceNanos']
      //     )
      //   }
      // )
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}
//
//
//
//
const publicKeysYo = [
  'BC1YLfwaYiDWz2kwre6eyRTH2Jstnhtd9RZxFSASxXMohk1xQJ422k9',
  'BC1YLhHwbyr2Z5HVz52yeKjU11nTFQM2b6FGc4ok6Jyzzp3s14ovwvo',
  'BC1YLgMPPCLcWbWc9pCay3nH2y92ajv796sQahNz3LopMmUqi3Ta4wc',
  'BC1YLgBTK3JHAWbZakS5adCrabCik5jL2HBTTrSUkfbPYdaTicFwTcX'
]

getUsers(publicKeysYo)
//
//
//

observeUrlChange()
waitAsyncPageLoad()
