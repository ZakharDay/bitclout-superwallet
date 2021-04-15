import { getStorePublicKey } from './store'
import { getApiCreatorCoinBuyOrSellData } from './server_requests'

function mergeDataWalletPortfolioItem(item, data) {
  let newItem = Object.assign({}, item)
  let creator = data['ProfilesFound'][0]
  let coinEntry = creator['CoinEntry']

  // prettier-ignore
  newItem.stakeMultipleBasisPoints = creator['StakeMultipleBasisPoints']
  newItem.publicKey = creator['PublicKeyBase58Check']
  newItem.isVerified = creator['IsVerified']
  newItem.coinPriceBitCloutNanos = creator['CoinPriceBitCloutNanos']

  newItem.coinEntry = {
    creatorBasisPoints: coinEntry['CreatorBasisPoints'],
    bitCloutLockedNanos: coinEntry['BitCloutLockedNanos'],
    coinsInCirculationNanos: coinEntry['CoinsInCirculationNanos'],
    coinWatermarkNanos: coinEntry['CoinWatermarkNanos']
  }

  return newItem
}

function mergeDataWalletPortfolioItemShare(item, data) {
  let newItem = Object.assign({}, item)
  newItem.expectedBitCloutReturnedNanos = data['ExpectedBitCloutReturnedNanos']

  return newItem
}

export { mergeDataWalletPortfolioItem, mergeDataWalletPortfolioItemShare }
