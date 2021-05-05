import { updateDataCreatorWallet } from './actions'
import { buyOrSellUrl } from './urls'

import {
  calcFounderRewardPercentage,
  calcAndFormatPortfolioItemPriceInUsd
} from './calcs_and_formatters'

import {
  getStoreBitCloutPrice,
  getStoreProfilePublicKey,
  getStoreProfile,
  getStoreCreatorWallet
} from './store'

function getHtmlProfilePublicKey() {
  const publicKeyElement = document.querySelector(
    '.creator-profile__ellipsis-restriction'
  )

  const publicKey = publicKeyElement.childNodes[
    publicKeyElement.childNodes.length - 1
  ].textContent.replace(/ /g, '')

  return publicKey
}

function addHtmlProfileFounderRewardPercentage() {
  const profile = getStoreProfile()
  const wrapper = document.createElement('div')
  const percent = document.createElement('div')
  const label = document.createElement('div')
  wrapper.style.whitespace = 'nowrap'
  percent.classList.add('font-weight-bold')
  percent.style.display = 'inline'
  label.classList.add('fc-muted')
  label.style.display = 'inline'
  label.innerText = ' Founder Reward'

  // TODO: Refactor
  percent.innerText = profile.founderReward / 100 + '%'

  wrapper.appendChild(percent)
  wrapper.appendChild(label)

  document
    .querySelector(
      '.global__center__inner .d-flex.flex-column.pl-15px.pr-15px .fs-15px.pt-5px.d-flex.flex-wrap'
    )
    .appendChild(wrapper)
}

function addHtmlProfileUserWatchButton(creatorProfileTopCard) {
  const wrapper = document.querySelector('.creator-profile__top-bar')
  wrapper.style.setProperty('justify-content', 'flex-end')
  wrapper.style.setProperty('align-items', 'center')

  const publicKey = getStoreProfilePublicKey()
  const button = document.createElement('div')
  button.classList.add('watchButton')

  chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
    if (userListToWatch.includes(publicKey)) {
      button.classList.add('muted')
    }

    button.addEventListener('click', (e) => {
      chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
        if (userListToWatch.includes(publicKey)) {
          button.classList.remove('muted')

          let newUserListToWatch = []

          userListToWatch.forEach((userPublicKey, i) => {
            if (userPublicKey === publicKey) {
              chrome.storage.sync.remove(userPublicKey)
            } else {
              newUserListToWatch.push(userPublicKey)
            }
          })

          chrome.storage.sync.set({ userListToWatch: newUserListToWatch })
        } else {
          button.classList.add('muted')

          const newUserListToWatch = [...userListToWatch, publicKey]
          chrome.storage.sync.set({ userListToWatch: newUserListToWatch })
        }
      })
    })

    wrapper.appendChild(button)
  })
}

function prepareHtmlProfileTabs() {
  const profileWrapper = document.querySelector(
    'creator-profile-details > .flex-grow-1'
  )

  const profileTabsWrapper = document.querySelector('tab-selector > div.d-flex')
  profileTabsWrapper.classList.add('profileTabsWrapper')

  const postsTab = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:first-child'
  )

  const postsTabText = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:first-child > div.d-flex:first-child'
  )

  const postsTabLine = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:first-child > div:last-child'
  )

  const coinTab = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(2)'
  )

  const coinTabText = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(2) > div.d-flex:first-child'
  )

  const coinTabLine = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(2) > div:last-child'
  )

  const diamondsTab = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(3)'
  )

  const diamondsTabText = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(3) > div.d-flex:first-child'
  )

  const diamondsTabLine = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(3) > div:last-child'
  )

  const walletTab = document.createElement('div')
  const walletTabText = document.createElement('div')
  const walletTabLine = document.createElement('div')
  // prettier-ignore
  walletTab.classList.add('walletTab', 'd-flex', 'flex-column', 'align-items-center', 'h-100', 'pl-15px', 'pr-15px')
  // prettier-ignore
  walletTabText.classList.add('d-flex', 'h-100', 'align-items-center', 'fs-15px', 'fc-muted')
  walletTabText.innerText = 'Creator Wallet'
  walletTabLine.classList.add('walletTabLine', 'tab-underline-inactive')
  walletTabLine.style.width = '50px'

  postsTab.addEventListener('click', () => {
    const walletTabContainer = document.querySelector('.walletTabContainer')

    if (walletTabContainer) {
      walletTabContainer.remove()
    }

    walletTab.classList.remove('active')
    walletTabText.classList.remove('fc-default')
    walletTabText.classList.add('fc-muted')
    walletTabLine.classList.remove('tab-underline-active')
    walletTabLine.classList.add('tab-underline-inactive')
  })

  coinTab.addEventListener('click', () => {
    const walletTabContainer = document.querySelector('.walletTabContainer')

    if (walletTabContainer) {
      walletTabContainer.remove()
    }

    walletTab.classList.remove('active')
    walletTabText.classList.remove('fc-default')
    walletTabText.classList.add('fc-muted')
    walletTabLine.classList.remove('tab-underline-active')
    walletTabLine.classList.add('tab-underline-inactive')
  })

  diamondsTab.addEventListener('click', () => {
    const walletTabContainer = document.querySelector('.walletTabContainer')

    if (walletTabContainer) {
      walletTabContainer.remove()
    }

    walletTab.classList.remove('active')
    walletTabText.classList.remove('fc-default')
    walletTabText.classList.add('fc-muted')
    walletTabLine.classList.remove('tab-underline-active')
    walletTabLine.classList.add('tab-underline-inactive')
  })

  walletTab.addEventListener('click', () => {
    const postsTabContainer = document.querySelector(
      'creator-profile-details > .flex-grow-1 > div:last-child'
    )
    const coinTabContainer = document.querySelector(
      'creator-profile-details > .flex-grow-1 > div:last-child'
    )

    const walletTabContainer = document.createElement('div')
    // prettier-ignore
    walletTabContainer.classList.add('walletTabContainer', 'loading', 'w-100', 'd-flex', 'flex-column')
    walletTabContainer.innerText = 'Preloading data...'

    walletTab.classList.add('active')
    walletTabText.classList.add('fc-default')
    walletTabText.classList.remove('fc-muted')
    walletTabLine.classList.remove('tab-underline-inactive')
    walletTabLine.classList.add('tab-underline-active')

    postsTabText.classList.remove('fc-default')
    postsTabText.classList.add('fc-muted')
    postsTabLine.classList.remove('tab-underline-active')
    postsTabLine.classList.add('tab-underline-inactive')

    coinTabText.classList.remove('fc-default')
    coinTabText.classList.add('fc-muted')
    coinTabLine.classList.remove('tab-underline-active')
    coinTabLine.classList.add('tab-underline-inactive')

    diamondsTabText.classList.remove('fc-default')
    diamondsTabText.classList.add('fc-muted')
    diamondsTabLine.classList.remove('tab-underline-active')
    diamondsTabLine.classList.add('tab-underline-inactive')

    if (postsTabContainer) {
      postsTabContainer.remove()
    } else if (coinTabContainer) {
      coinTabContainer.remove()
    }

    let url = new URL(window.location)
    url.search = '?tab=creator-wallet'
    window.history.pushState('', '', url)
    profileWrapper.appendChild(walletTabContainer)

    updateDataCreatorWallet()
  })

  walletTab.appendChild(walletTabText)
  walletTab.appendChild(walletTabLine)
  profileTabsWrapper.appendChild(walletTab)
}

function updateHtmlProfileCreatorWallet(data) {
  const container = document.querySelector('.walletTabContainer')
  container.classList.remove('loading')
  container.innerHTML = ''

  addHtmlProfileCreatorWalletHeader(container)
    .then(() => addHtmlProfileCreatorWalletGridHeader(container))
    .then(() => addHtmlProfileCreatorWalletItems(container))
}

function addHtmlProfileCreatorWalletHeader(container) {
  return new Promise((resolve, reject) => {
    const profile = getStoreProfile()
    const header = document.createElement('div')
    header.classList.add('walletTabHeader')
    header.innerHTML = `Coins held by ${profile.username}`
    container.appendChild(header)
    resolve()
  })
}

function addHtmlProfileCreatorWalletGridHeader(container) {
  return new Promise((resolve, reject) => {
    const header = document.createElement('div')
    const userName = document.createElement('div')
    const coinPrice = document.createElement('div')
    const marketValue = document.createElement('div')

    header.classList.add('walletTabGridHeader')
    userName.classList.add('userName')
    coinPrice.classList.add('coinPrice')
    marketValue.classList.add('marketValue')

    userName.innerText = 'Username'
    coinPrice.innerText = 'Coin Price'
    marketValue.innerText = 'Market Value'

    header.appendChild(userName)
    header.appendChild(coinPrice)
    header.appendChild(marketValue)
    container.appendChild(header)

    resolve()
  })
}

function addHtmlProfileCreatorWalletItems(container) {
  const creatorWalletItems = getStoreCreatorWallet()
  creatorWalletItems.forEach((item, i) => {
    addHtmlProfileCreatorWalletItem(container, item)
  })
}

function addHtmlProfileCreatorWalletItem(container, item) {
  const bitCloutPrice = getStoreBitCloutPrice()
  const walletItem = document.createElement('div')
  const userCell = document.createElement('a')
  const userPic = document.createElement('div')
  const userName = document.createElement('div')
  const coinPrice = document.createElement('div')
  const marketValue = document.createElement('div')

  walletItem.classList.add('walletItem')
  userCell.classList.add('userCell')
  userPic.classList.add('userPic')
  userName.classList.add('userName')
  coinPrice.classList.add('coinPrice')
  marketValue.classList.add('marketValue')

  userCell.href = `https://bitclout.com/u/${item.username}`
  userPic.style.backgroundImage = `url(${item.profilePic})`
  userName.innerText = item.username

  // refactor
  let coinPriceText = (item.coinPriceNanos * bitCloutPrice) / 1000000000

  coinPriceText = coinPriceText.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })

  coinPrice.innerText = ['$', coinPriceText].join('')

  // marketValue.innerText = calcAndFormatPortfolioItemPriceInUsd(
  // item.balanceNanos
  // )

  // marketValue.innerText = (item.balanceNanos / 1000000000) * bitCloutPrice

  userCell.appendChild(userPic)
  userCell.appendChild(userName)
  walletItem.appendChild(userCell)
  walletItem.appendChild(coinPrice)
  // walletItem.appendChild(marketValue)
  container.appendChild(walletItem)

  getApiCreatorCoinBuyOrSellDataTest(item).then((data) => {
    marketValue.innerText = calcAndFormatPortfolioItemPriceInUsd(
      data['ExpectedBitCloutReturnedNanos']
    )
    walletItem.appendChild(marketValue)
  })
}

function getApiCreatorCoinBuyOrSellDataTest(creatorData) {
  const publicKey = getStoreProfilePublicKey()

  // console.log('Creator data', creatorData)

  return new Promise(function (resolve, reject) {
    const data = {
      BitCloutToAddNanos: 0,
      BitCloutToSellNanos: 0,
      Broadcast: false,
      CreatorCoinToSellNanos: creatorData.balanceNanos,
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

    // console.log('Request:', data)

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

        if (process.env.NODE_ENV === 'development') {
          console.log('DEV Success:', data)
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('DEV Error:', error)
        }
      })
  })
}

export {
  getHtmlProfilePublicKey,
  addHtmlProfileFounderRewardPercentage,
  addHtmlProfileUserWatchButton,
  prepareHtmlProfileTabs,
  updateHtmlProfileCreatorWallet
}
