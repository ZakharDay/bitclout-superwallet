import getCaretCoordinates from 'textarea-caret'
import { updateDataWalletPortfolio } from './actions'

import {
  mergeDataWalletPortfolioItem,
  prepareDataCreatorWallet
} from './data_modifiers'

import {
  injectHtmlCss,
  markHtmlBody,
  getHtmlBitCloutPrice,
  addHtmlUserExternalLinks,
  addHtmlBitCloutPrice
} from './html_modifiers'

import {
  addHtmlDropdown,
  hideHtmlDropdown,
  updateHtmlDropdown
} from './browse_html_modifiers'

import {
  getApiBitCloutPrice,
  getApiWalletPortfolioItemData,
  getChromeStorageWatchedCreatorsData,
  getApiPostMentionData,
  getApiUsersData
} from './server_requests'

import {
  setStorePublicKey,
  setStoreBitCloutPrice,
  setStoreWalletPortfolio,
  getStoreMention,
  setStoreMention,
  setStoreProfilePublicKey,
  setStoreCreatorWallet,
  getStoreProfile,
  setStoreProfile
} from './store'

import {
  getHtmlProfilePublicKey,
  addHtmlProfileFounderRewardPercentage,
  prepareHtmlProfileTabs,
  addHtmlProfileUserWatchButton
} from './profile_html_modifiers'

import {
  getHtmlWalletPublicKey,
  getHtmlWalletPortfolio,
  addHtmlWalletUpdateButton,
  modifyHtmlWalletGridOnFirstLoad,
  prepareHtmlWalletForNextDataLoad
} from './wallet_html_modifiers'

import {
  modifyHtmlSidebarOnFirstLoad,
  renderHtmlSidebarUsers
} from './sidebar_html_modifiers'

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
  const firstLettersAccepted = ['w', 'u', 'b', 'n', 's', 'b']
  const mainDetector = document.querySelector('.global__center__inner')
  const profileDetector = document.querySelector('.creator-profile__top-bar')

  document.addEventListener('click', () => {
    initModalCatcher()
  })

  if (firstLettersAccepted.includes(urlPartFirstLetter)) {
    if (document.head && document.body && mainDetector) {
      injectHtmlCss()
      markHtmlBody(urlPartFirstLetter)

      if (urlPartFirstLetter === 'w' && mainDetector) {
        initWalletPage()
        initSidebar()
      } else if (urlPartFirstLetter === 'u' && profileDetector) {
        const urlLastPart = urlPart.substr(urlPart.lastIndexOf('/') + 1)

        if (urlLastPart != 'buy' && urlLastPart != 'sell') {
          initProfilePage()
        }
      } else if (
        urlPartFirstLetter === 'b' &&
        urlPartSecondLetter === 'r' &&
        mainDetector
      ) {
        initBrowsePage()
      } else if (
        urlPartFirstLetter === 'n' ||
        urlPartFirstLetter === 's' ||
        urlPartFirstLetter === 'b'
      ) {
        getApiBitCloutPrice().then((bitCloutPrice) => {
          setStoreBitCloutPrice(bitCloutPrice)
          addHtmlBitCloutPrice()
        })
      } else {
        markHtmlBody('')

        setTimeout(() => {
          waitAsyncPageLoad()
        }, 100)
      }
    } else {
      setTimeout(() => {
        waitAsyncPageLoad()
      }, 100)
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
  getApiBitCloutPrice().then((bitCloutPrice) => {
    setStoreBitCloutPrice(bitCloutPrice)

    // Temporary
    addHtmlBitCloutPrice()
    // Temporary

    const publicKey = getHtmlWalletPublicKey()
    setStorePublicKey(publicKey)

    const walletPortfolio = getHtmlWalletPortfolio()

    setStoreWalletPortfolio(walletPortfolio)
      .then(modifyHtmlWalletGridOnFirstLoad)
      .then(prepareHtmlWalletForNextDataLoad)
      .then(updateDataWalletPortfolio)
      .then(addHtmlWalletUpdateButton)
  })
}

function initProfilePage() {
  getApiBitCloutPrice().then((bitCloutPrice) => {
    setStoreBitCloutPrice(bitCloutPrice)

    addHtmlBitCloutPrice()

    const publicKey = getHtmlProfilePublicKey()
    setStoreProfilePublicKey(publicKey)

    const creatorProfileTopCard = document.querySelector(
      '.creator-profile__top-bar'
    )

    getApiUsersData([publicKey])
      .then((data) => prepareDataCreatorWallet(data))
      .then((data) =>
        Promise.all([
          setStoreCreatorWallet(data.creatorWallet),
          setStoreProfile(data.profile)
        ])
      )
      .then(() => {
        const profile = getStoreProfile()
        addHtmlUserExternalLinks(creatorProfileTopCard, profile)
        // addHtmlProfileFounderRewardPercentage()
        addHtmlProfileUserWatchButton(creatorProfileTopCard)
        prepareHtmlProfileTabs()
      })
  })
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
    modifyHtmlSidebarOnFirstLoad()
    getChromeStorageWatchedCreatorsData()
      .then((userListToWatch) => getApiUsersData(userListToWatch))
      .then((data) => renderHtmlSidebarUsers(data))
  }
}

// TODO: Refactor this
function initBrowsePage() {
  getApiBitCloutPrice().then((bitCloutPrice) => {
    setStoreBitCloutPrice(bitCloutPrice)

    addHtmlBitCloutPrice()

    addHtmlDropdown()

    const textarea = document.querySelector(
      'textarea.feed-create-post__textarea'
    )
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
  })
}

observeUrlChange()
waitAsyncPageLoad()
