import getCaretCoordinates from 'textarea-caret'

import { updateDataWalletPortfolio } from './actions'
import { getHtmlBitCloutPrice } from './html_modifiers'
import { addStupidFixForNotificationsFeed } from './notifications_html_modifiers'
import { mergeDataWalletPortfolioItem } from './data_modifiers'
import { updateHtmlDropdown } from './browse_html_modifiers'

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

  // prepare hover style
  const css =
    '.mentionDropdownItem:hover { background-color: #E6F0FF; cursor: pointer; }'
  const style = document.createElement('style')

  if (style.styleSheet) {
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }

  document.getElementsByTagName('head')[0].appendChild(style)

  // prepare dropdown element
  const textarea = document.querySelector('textarea.feed-create-post__textarea')
  const wrapper = textarea.parentElement
  const dropdown = document.createElement('div')
  dropdown.classList.add('mentionDropdown')
  dropdown.style.width = '260px'
  dropdown.style.padding = '10px 0'
  dropdown.style.backgroundColor = 'white'
  dropdown.style.boxShadow = '0 0 5px rgba(0,0,0,0.15)'
  dropdown.style.borderRadius = '10px'
  dropdown.style.display = 'none'
  dropdown.style.position = 'absolute'
  dropdown.style.top = '-10000px'
  dropdown.style.left = '-10000px'
  dropdown.style.zIndex = '999999999999999'
  wrapper.style.position = 'relative'
  wrapper.appendChild(dropdown)

  textarea.addEventListener('keydown', () => {
    const key = event.keyCode

    if (key == 8 || key == 46) {
      let mention = getStoreMention()

      if (mention.suggest === true) {
        const caretPlace = textarea.selectionEnd
        const caret = getCaretCoordinates(textarea, caretPlace)
        const value = textarea.value.slice(0, caretPlace)
        const atPlace = value.lastIndexOf('@')
        const usernamePrefix = value.slice(atPlace + 1, caretPlace)
        console.log('USERNAME PREFIX', usernamePrefix)

        mention = {
          suggest: true,
          usernamePrefix: usernamePrefix,
          lastInteraction: Date.now()
        }

        setStoreMention(mention)

        getApiPostMentionData(usernamePrefix).then((data) => {
          dropdown.innerHTML = ''
          updateHtmlDropdown(data)
          dropdown.style.display = 'block'
          dropdown.style.top = `${caret.top + caret.height + 11}px`
          dropdown.style.left = `${caret.left - 11}px`
        })
      }
    }
  })

  document.addEventListener('click', () => {
    let mention = getStoreMention()

    if (mention.suggest === true) {
      mention = {
        suggest: false,
        usernamePrefix: '',
        lastInteraction: 0
      }

      setStoreMention(mention)

      dropdown.innerHTML = ''
      dropdown.style.display = 'none'
      dropdown.style.top = '-10000px'
      dropdown.style.left = '-10000px'
    } else {
    }
  })

  textarea.addEventListener('input', () => {
    const value = textarea.value
    const lastCharacter = textarea.value.substr(textarea.value.length - 1)
    let mention = getStoreMention()

    if (lastCharacter === '@') {
      mention = {
        suggest: true,
        usernamePrefix: '',
        lastInteraction: 0
      }

      setStoreMention(mention)
    } else if (lastCharacter === ' ' || lastCharacter === '\n') {
      mention = {
        suggest: false,
        usernamePrefix: '',
        lastInteraction: 0
      }

      setStoreMention(mention)

      dropdown.innerHTML = ''
      dropdown.style.display = 'none'
      dropdown.style.top = '-10000px'
      dropdown.style.left = '-10000px'
    } else if (mention.suggest === true && lastCharacter != '@') {
      const caret = getCaretCoordinates(textarea, textarea.selectionEnd)
      const usernamePrefix = [mention.usernamePrefix, lastCharacter].join('')

      mention = {
        suggest: true,
        usernamePrefix: usernamePrefix,
        lastInteraction: Date.now()
      }

      setStoreMention(mention)
      dropdown.innerHTML = ''
      dropdown.style.display = 'none'
      dropdown.style.top = '-10000px'
      dropdown.style.left = '-10000px'
      // dropdown.innerText = usernamePrefix

      // prettier-ignore
      console.log('(top, left, height) = (%s, %s, %s)', caret.top, caret.left, caret.height)

      getApiPostMentionData(usernamePrefix).then((data) => {
        dropdown.innerHTML = ''
        updateHtmlDropdown(data)
        dropdown.style.display = 'block'
        dropdown.style.top = `${caret.top + caret.height + 11}px`
        dropdown.style.left = `${caret.left - 11}px`
      })
    }

    console.log(textarea.value.substr(textarea.value.length - 1))
  })
}

observeUrlChange()
waitAsyncPageLoad()
