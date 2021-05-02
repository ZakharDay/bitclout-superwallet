import { getApiSidebarCreatorCoinData } from './server_requests'
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
  heading.innerText = 'Your Watch List'

  header.appendChild(heading)
  // container.appendChild(loader)
  wrapper.appendChild(header)
  wrapper.appendChild(container)

  if (!walletTrackerWrapper) {
    // console.log('first')
    sidebar.insertBefore(wrapper, balanceBox.nextSibling)
  } else {
    // console.log('second', walletTrackerWrapper)
    sidebar.insertBefore(wrapper, walletTrackerWrapper.nextSibling)
  }

  userListToWatch.forEach((userListToWatchItem, i) => {
    getApiSidebarCreatorCoinData(userListToWatchItem, i)
  })
}

function updateHtmlSidebar(data, order) {
  const creator = data['ProfilesFound'][0]
  const username = creator['Username']
  const coinEntry = creator['CoinEntry']
  const container = document.querySelector('.watchListContainer')
  const creatorListItemElement = getHtmlCreatorListItemElement()
  const sidebarItem = mergeDataWalletPortfolioItem({}, data)
  const creatorCoinPrice = calcAndFormatRealCoinPrice(sidebarItem)

  creatorListItemElement.href = `https://bitclout.com/u/${username}`
  // creatorListItemElement.id = username
  creatorListItemElement.style.order = `${order}`
  creatorListItemElement.childNodes[0].style.backgroundImage = `url("${creator['ProfilePic']}")`

  creatorListItemElement.childNodes[1].childNodes[0].innerHTML = [
    username,
    calcFounderRewardPercentage(sidebarItem)
  ].join(' ')

  creatorListItemElement.childNodes[1].childNodes[1].innerHTML = ''
  creatorListItemElement.childNodes[2].innerText = ['$', creatorCoinPrice].join(
    ''
  )

  addHtmlUserExternalLinks(data, creatorListItemElement)
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

export { modifyHtmlSidebarOnFirstLoad, updateHtmlSidebar }
