import { getStoreBitCloutPrice } from './store'

const floatNumberPattern = /[-+]?[0-9]*\.?[0-9]+/g

function calcRealCoinPrice(item) {
  const bitCloutPrice = getStoreBitCloutPrice()
  return (item.coinPriceBitCloutNanos * bitCloutPrice) / 1000000000
}

function calcAndFormatRealCoinPrice(item) {
  let realCoinPrice = calcRealCoinPrice(item)

  realCoinPrice = realCoinPrice.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })

  return realCoinPrice
}

function calcFounderRewardPercentage(item) {
  return item.CoinEntry.CreatorBasisPoints / 100 + '%'
}

function calcPortfolioItemShare(userThatHODL) {
  return userThatHODL['BalanceNanos'] / 1000000000
}

function calcPortfolioItemPriceInUsd(nanos) {
  const bitCloutPrice = getStoreBitCloutPrice()
  // console.log('bitCloutPrice', bitCloutPrice)
  return (nanos / 1000000000) * bitCloutPrice
}

function calcAndFormatPortfolioItemPriceInUsd(nanos) {
  let sharePriceInUsd = calcPortfolioItemPriceInUsd(nanos)
  // console.log('sharePriceInUsd', sharePriceInUsd)

  sharePriceInUsd = sharePriceInUsd.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })

  return ['$', sharePriceInUsd].join('')
}

function calcAndFormatPortfolioItemPriceInBitClout(nanos) {
  const formatted = (nanos / 1000000000).toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 4
  })

  return [formatted, '$CLOUT'].join(' ')
}

function calcAndFormatPortfolioItemPriceInDeso(usd) {
  const desoPrice = getStoreBitCloutPrice()

  const formatted = (usd / desoPrice).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })

  return [formatted, '$DESO'].join(' ')
}

export {
  floatNumberPattern,
  calcRealCoinPrice,
  calcAndFormatRealCoinPrice,
  calcFounderRewardPercentage,
  calcPortfolioItemShare,
  calcPortfolioItemPriceInUsd,
  calcAndFormatPortfolioItemPriceInUsd,
  calcAndFormatPortfolioItemPriceInBitClout,
  calcAndFormatPortfolioItemPriceInDeso
}
