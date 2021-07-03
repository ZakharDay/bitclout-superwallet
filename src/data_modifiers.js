import { getSingleProfilePicture } from './urls'
import { getStorePublicKey } from './store'
import { getApiCreatorCoinBuyOrSellData } from './server_requests'

function mergeDataWalletPortfolioItem(item, data) {
  const publicKey = getStorePublicKey()
  let newItem = Object.assign({}, item)
  let creator = data['ProfilesFound'][0]
  let coinEntry = creator['CoinEntry']

  // prettier-ignore
  newItem.stakeMultipleBasisPoints = creator['StakeMultipleBasisPoints']
  newItem.publicKey = creator['PublicKeyBase58Check']
  newItem.isVerified = creator['IsVerified']
  newItem.oldCoinPriceBitCloutNanos = item.coinPriceBitCloutNanos
  newItem.coinPriceBitCloutNanos = creator['CoinPriceBitCloutNanos']

  creator['UsersThatHODL'].forEach((userThatHODL, i) => {
    if (userThatHODL['HODLerPublicKeyBase58Check'] === publicKey) {
      newItem.balanceNanos = userThatHODL['BalanceNanos']
    }
  })

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

function prepareDataCreatorWallet(data) {
  return new Promise(function (resolve, reject) {
    const user = data['UserList'][0]
    const profileEntry = user['ProfileEntryResponse']
    let creatorWallet = []
    let profile = {}

    profile = {
      username: profileEntry['Username'],
      profilePic: profilePictureUrl(user['PublicKeyBase58Check']),
      publicKey: user['PublicKeyBase58Check'],
      founderReward: profileEntry['CoinEntry']['CreatorBasisPoints']
    }

    // console.log('Profile', profile)

    user['UsersYouHODL'].forEach((userYouHODL, i) => {
      if (userYouHODL['BalanceNanos'] > 1) {
        const creatorWalletItem = {
          username: userYouHODL['ProfileEntryResponse']['Username'],
          profilePic: profilePictureUrl(
            userYouHODL['CreatorPublicKeyBase58Check']
          ),
          publicKey: userYouHODL['CreatorPublicKeyBase58Check'],
          balanceNanos: userYouHODL['BalanceNanos'],
          coinPriceNanos:
            userYouHODL['ProfileEntryResponse']['CoinPriceBitCloutNanos']
        }

        creatorWallet.push(creatorWalletItem)
      }
    })

    // console.log(creatorWallet)

    creatorWallet.sort((a, b) => (a.balanceNanos > b.balanceNanos ? -1 : 1))

    // console.log(creatorWallet)

    resolve({ profile, creatorWallet })
  })
}

function profilePictureUrl(publicKey) {
  return [getSingleProfilePicture, publicKey].join('')
}

export {
  mergeDataWalletPortfolioItem,
  mergeDataWalletPortfolioItemShare,
  prepareDataCreatorWallet,
  profilePictureUrl
}
