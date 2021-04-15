import { floatNumberPattern } from './calcs_and_formatters'
import { updateWalletData } from './actions'
// import { waitAsyncPageLoad } from './autoload'
import { mergePortfolioItemData } from './data_modifiers'
import { getSidebarCreatorCoinData } from './server_requests'

import {
  calcAndFormatRealCoinPrice,
  calcAndFormatPortfolioItemPriceInUsd,
  calcFounderRewardPercentage
} from './calcs_and_formatters'

function getHtmlBitCloutPrice() {
  const bitCloutPrice = document
    .querySelector('.right-bar-creators__balance-box .d-flex div:last-child')
    .innerHTML.match(/[^ ]*/i)[0]
    .substring(2)

  return bitCloutPrice
}

function clearElementsWithDash(elements) {
  for (let element of elements) {
    element.innerHTML = '–'
  }
}

export { getHtmlBitCloutPrice, clearElementsWithDash }
