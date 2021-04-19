import { updateDataWalletPortfolio } from './actions'
import { getHtmlBitCloutPrice } from './html_modifiers'
import { addStupidFixForNotificationsFeed } from './notifications_html_modifiers'
import { mergeDataWalletPortfolioItem } from './data_modifiers'

import {
  getApiWalletPortfolioItemData,
  getChromeStorageWatchedCreatorsData
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
  const textarea = document.querySelector('textarea.feed-create-post__textarea')
  const wrapper = textarea.parentElement
  const dropdown = document.createElement('div')
  dropdown.classList.add('mentionDropdown')
  dropdown.style.width = '100px'
  dropdown.style.height = '100px'
  dropdown.style.backgroundColor = 'white'
  dropdown.style.boxShadow = '0 0 5px #999999'
  dropdown.style.display = 'none'
  dropdown.style.position = 'absolute'
  dropdown.style.top = '-10000px'
  dropdown.style.left = '-10000px'
  wrapper.style.position = 'relative'
  wrapper.appendChild(dropdown)

  textarea.addEventListener('input', () => {
    const value = textarea.value
    const lastCharacter = textarea.value.substr(textarea.value.length - 1)

    if (lastCharacter === '@') {
      console.log('at')
      const startPosition = textarea.selectionStart
      const endPosition = textarea.selectionEnd
      const textareaRect = textarea.getBoundingClientRect()
      const lineHeight = 27
      const offsetTop = 5
      const offsetLeft = 5
      const lineWidth = 46
      const charWidth = 11
      let line = 1
      let topPixels = offsetTop
      let leftPixels = offsetLeft

      // offset top 5px
      // offset left 5px
      // 46 chars // 27 px height
      // 46

      dropdown.style.display = 'block'

      if (startPosition <= lineWidth) {
        topPixels += lineHeight
        leftPixels += startPosition * charWidth
      } else if (startPosition > lineWidth && startPosition <= lineWidth * 2) {
        topPixels += lineHeight * 2
        leftPixels += (startPosition - lineWidth) * charWidth
      } else if (
        startPosition > lineWidth * 2 &&
        startPosition <= lineWidth * 3
      ) {
        topPixels += lineHeight * 3
        leftPixels += (startPosition - lineWidth * 2) * charWidth
      }

      dropdown.style.top = `${topPixels}px`
      dropdown.style.left = `${leftPixels}px`

      // Check if you've selected text
      if (startPosition == endPosition) {
        // prettier-ignore
        console.log('The position of the cursor is (' + startPosition + '/' + textarea.value.length + ')')
      } else {
        // prettier-ignore
        console.log('Selected text from (' + startPosition + ' to ' + endPosition + ' of ' + textarea.value.length + ')')
      }
    } else if (lastCharacter === ' ') {
      console.log('space')
    } else if (lastCharacter === '\n') {
      console.log('break')
    }

    console.log(textarea.value.substr(textarea.value.length - 1))
  })
}

observeUrlChange()
waitAsyncPageLoad()
