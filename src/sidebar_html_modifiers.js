import { profilePictureUrl } from './data_modifiers'
import { getStorePublicKey, getStoreBitCloutPrice } from './store'
import { mergeDataWalletPortfolioItem } from './data_modifiers'
import { addHtmlUserExternalLinks } from './html_modifiers'

import {
  calcAndFormatRealCoinPrice,
  calcFounderRewardPercentage
} from './calcs_and_formatters'

function modifyHtmlSidebarOnFirstLoad(userListToWatch) {
  const publicKey = getStorePublicKey()
  const bitCloutPrice = getStoreBitCloutPrice()
  const sidebar = document.querySelector('.global__sidebar__inner')
  const balanceBox = document.querySelector('.right-bar-creators__balance-box')
  const walletTrackerWrapper = document.querySelector('.walletTrackerWrapper')

  const wrapper = document.createElement('div')
  wrapper.classList.add('watchListWrapper')
  const header = document.createElement('header')
  header.classList.add('watchListHeader')
  const container = document.createElement('section')
  container.classList.add('watchListContainer')
  const heading = document.createElement('div')
  heading.classList.add('fs-15px', 'text-grey5', 'font-weight-bold', 'mb-15px')
  heading.innerText = 'SuperWallet Watch List'

  header.appendChild(heading)
  // container.appendChild(loader)
  wrapper.appendChild(header)
  wrapper.appendChild(container)

  if (userListToWatch.length != 0) {
    if (!walletTrackerWrapper) {
      // console.log('first')
      sidebar.insertBefore(wrapper, balanceBox.nextSibling)
    } else {
      // console.log('second', walletTrackerWrapper)
      sidebar.insertBefore(wrapper, walletTrackerWrapper.nextSibling)
    }
  }
}

function renderHtmlSidebarUsers(users) {
  users['UserList'].forEach((user, i) => {
    addHtmlSidebarUserItem(user)
  })
}

function addHtmlSidebarUserItem(user) {
  const username = user['ProfileEntryResponse']['Username']
  const publicKey = user['ProfileEntryResponse']['PublicKeyBase58Check']
  const coinEntry = user['ProfileEntryResponse']['CoinEntry']
  const basisPoints = coinEntry['CreatorBasisPoints']
  const coinPriceBitCloutNanos =
    user['ProfileEntryResponse']['CoinPriceBitCloutNanos']
  const container = document.querySelector('.watchListContainer')
  const creatorListItemElement = getHtmlCreatorListItemElement()

  // TODO: refactor
  //
  const bitCloutPrice = getStoreBitCloutPrice()
  let coinPriceInUsd = (coinPriceBitCloutNanos * bitCloutPrice) / 1000000000

  coinPriceInUsd = coinPriceInUsd.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })

  const creatorCoinPrice = coinPriceInUsd
  //
  // END

  // TODO: refactor
  //
  const founderReward = basisPoints / 100 + '%'
  //
  // END

  creatorListItemElement.href = `https://bitclout.com/u/${username}`
  // creatorListItemElement.id = username
  creatorListItemElement.childNodes[0].style.backgroundImage = `url("${profilePictureUrl(
    user['ProfileEntryResponse']['PublicKeyBase58Check']
  )}")`

  creatorListItemElement.childNodes[1].childNodes[0].innerHTML = [
    username,
    founderReward
  ].join(' ')

  creatorListItemElement.childNodes[1].childNodes[1].innerHTML = ''
  creatorListItemElement.childNodes[2].innerText = ['$', creatorCoinPrice].join(
    ''
  )

  addHtmlUserExternalLinks(creatorListItemElement, {
    publicKey: publicKey,
    username: username
  })

  container.appendChild(creatorListItemElement)
}

function getHtmlCreatorListItemElement() {
  const wrapper = document.querySelector('right-bar-creators-leaderboard')

  const sidebarCreatorListItemElement = wrapper.childNodes[1].cloneNode(true)
  sidebarCreatorListItemElement.href = ''
  sidebarCreatorListItemElement.classList.add('creatorListItem')
  sidebarCreatorListItemElement.childNodes[0].style.backgroundImage = ''

  return sidebarCreatorListItemElement
}

export { modifyHtmlSidebarOnFirstLoad, renderHtmlSidebarUsers }
