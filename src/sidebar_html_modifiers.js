import { getApiSidebarCreatorCoinData } from './server_requests'
import { getStorePublicKey, getStoreBitCloutPrice } from './store'
import { mergeDataWalletPortfolioItem } from './data_modifiers'

import {
  calcAndFormatRealCoinPrice,
  calcFounderRewardPercentage
} from './calcs_and_formatters'

function modifyHtmlSidebarOnFirstLoad(creatorList) {
  const publicKey = getStorePublicKey()
  const bitCloutPrice = getStoreBitCloutPrice()

  let heading = document.querySelector(
    '.global__sidebar__inner .fs-15px.text-grey5.font-weight-bold.mb-15px'
  )

  let wrapper = document.getElementsByTagName(
    'right-bar-creators-leaderboard'
  )[0]

  let headingClone = heading.cloneNode(true)
  headingClone.innerHTML = 'Creators'

  let wrapperClone = wrapper.cloneNode(true)
  wrapperClone.classList.add('sidebarCreatorList')
  wrapperClone.style.marginBottom = '20px'
  wrapperClone.innerHTML = ''

  heading.parentNode.insertBefore(headingClone, heading)
  heading.parentNode.insertBefore(wrapperClone, heading)

  creatorList.forEach((creatorListItem, i) => {
    getApiSidebarCreatorCoinData(creatorListItem, i)
  })
}

function updateHtmlSidebar(data, order) {
  let creator = data['ProfilesFound'][0]
  let username = creator['Username']
  let coinEntry = creator['CoinEntry']
  let wrapper = document.getElementsByClassName('sidebarCreatorList')[0]
  let creatorListItemElement = getHtmlCreatorListItemElement()
  let sidebarItem = mergeDataWalletPortfolioItem({}, data)
  let creatorCoinPrice = calcAndFormatRealCoinPrice(sidebarItem)

  wrapper.style.display = 'flex'
  wrapper.style.margin = '0 0 20px'
  wrapper.style.setProperty('flex-direction', 'column')
  creatorListItemElement.href = `https://bitclout.com/u/${username}`
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

  wrapper.appendChild(creatorListItemElement)
}

function getHtmlCreatorListItemElement() {
  let wrapper = document.getElementsByTagName(
    'right-bar-creators-leaderboard'
  )[1]

  let sidebarCreatorListItemElement = wrapper.childNodes[1].cloneNode(true)
  sidebarCreatorListItemElement.href = ''
  sidebarCreatorListItemElement.classList.add('creatorListItem')
  sidebarCreatorListItemElement.childNodes[0].style.backgroundImage = ''

  return sidebarCreatorListItemElement
}

export { modifyHtmlSidebarOnFirstLoad, updateHtmlSidebar }
