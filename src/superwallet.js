import getCaretCoordinates from 'textarea-caret'

import { updateDataWalletPortfolio } from './actions'
import { getHtmlBitCloutPrice } from './html_modifiers'
import { addStupidFixForNotificationsFeed } from './notifications_html_modifiers'
import { mergeDataWalletPortfolioItem } from './data_modifiers'

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
  addHtmlProfileBitCloutPulseLink,
  addHtmlProfileFounderRewardPercentage
} from './profile_html_modifiers'

import {
  getHtmlWalletPublicKey,
  getHtmlWalletPortfolio,
  addHtmlWalletUpdateButton,
  modifyHtmlWalletGridOnFirstLoad,
  prepareHtmlWalletForNextDataLoad,
  addHtmlWalletPortfolioBitCloutPulseLinks
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
  const firstLettersAccepted = ['w', 'u', 'n', 'b']

  if (firstLettersAccepted.includes(urlPartFirstLetter)) {
    let detectionElement = document.getElementsByClassName(
      'global__center__inner'
    )

    if (detectionElement != null && detectionElement.length > 0) {
      if (urlPartFirstLetter === 'w') {
        initWalletPage()
        initSidebar()
      } else if (urlPartFirstLetter === 'u') {
        const urlLastPart = urlPart.substr(urlPart.lastIndexOf('/') + 1)

        if (urlLastPart != 'buy' && urlLastPart != 'sell') {
          initProfilePage()
        }
      } else if (urlPartFirstLetter === 'n') {
        initNotificationsPage()
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
        addHtmlProfileBitCloutPulseLink(item, creatorProfileTopCard)
        addHtmlProfileFounderRewardPercentage(item)
      })
    }
  } else {
    setTimeout(() => {
      initProfilePage()
    }, 1000)
  }
}

function initNotificationsPage() {
  addStupidFixForNotificationsFeed()
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

observeUrlChange()
waitAsyncPageLoad()
