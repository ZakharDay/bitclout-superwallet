// prettier-ignore
const buyOrSellUrl = 'https://api.bitclout.com/buy-or-sell-creator-coin-preview-WVAzTWpGOFFnMlBvWXZhTFA4NjNSZGNW'
const getProfilesUrl = 'https://api.bitclout.com/get-profiles'
const getFollowsStateless = 'https://api.bitclout.com/get-follows-stateless'

const floatNumberPattern = /[-+]?[0-9]*\.?[0-9]+/g
let pageLoaded = false
let pageUpdated = false
let publicKey = ''
let bitCloutPrice = 0
let portfolio = []
let sidebarCreatorListItemElement

async function getWalletData() {
  let loadingDetectionElement = document.querySelector('.coinPriceCell')

  let walletItems = document.querySelector(
    '.global__center__width .global__mobile-scrollable-section > .fs-15px:not(.container)'
  ).childNodes

  if (loadingDetectionElement == null) {
    bitCloutPrice = document
      .querySelector('.right-bar-creators__balance-box .d-flex div:last-child')
      .innerHTML.match(/[^ ]*/i)[0]
      .substring(2)

    publicKey = document
      .querySelector(
        '.global__center__width .global__mobile-scrollable-section > .container'
      )
      .childNodes[1].childNodes[1].textContent.replace(/\s/g, '')

    await updateGridOnFirstLoad(walletItems)
  } else {
    await updateGrid(walletItems)
  }
}

function updateGridOnFirstLoad(walletItems) {
  walletItems.forEach((walletItem, i) => {
    let portfolioItem = {}
    let rows = walletItem.childNodes

    rows.forEach((row, i) => {
      if (row.classList && row.classList.contains('row')) {
        row.childNodes.forEach((cell, i) => {
          if (i === 0) {
            cell.childNodes.forEach((aPart, i) => {
              if (aPart.classList.contains('holdings__name')) {
                portfolioItem.username = aPart.childNodes[0].innerHTML
                row.id = portfolioItem.username
                row.classList.add('portfolioRow')
              }
            })
          } else if (i === 1) {
            let coinPriceCell = cell.childNodes[0]
            let coinPrice = coinPriceCell.innerHTML

            portfolioItem.oldCoinPrice = coinPrice.match(floatNumberPattern)[0]

            cell.style.flexDirection = 'column'
            cell.style.setProperty('align-items', 'flex-end', 'important')

            coinPriceCell.classList.remove(
              'd-flex',
              'align-items-center',
              'justify-content-end'
            )

            coinPriceCell.classList.add('coinPriceCell')

            let oldCoinPriceCell = document.createElement('div')

            oldCoinPriceCell.classList.add(
              'text-grey8A',
              'fs-12px',
              'text-right',
              'oldCoinPriceCell'
            )

            oldCoinPriceCell.innerHTML = coinPrice
            cell.appendChild(oldCoinPriceCell)
          } else if (i === 2) {
            let assetsInUsdCell = cell.childNodes[0].childNodes[0]
            let assetsInBitCloutCell = cell.childNodes[0].childNodes[1]

            portfolioItem.assetsInUsd = assetsInUsdCell.innerHTML.match(
              floatNumberPattern
            )[0]

            portfolioItem.assetsInBitClout = assetsInBitCloutCell.innerHTML.match(
              floatNumberPattern
            )[0]

            assetsInUsdCell.classList.add('assetsInUsdCell')
            assetsInBitCloutCell.classList.add('assetsInBitCloutCell')
          }
        })

        portfolio.push(portfolioItem)
      }
    })
  })
}

async function updateGrid(walletItems) {
  let newPortfolio = [...portfolio]

  walletItems.forEach((walletItem, i) => {
    let rows = walletItem.childNodes

    rows.forEach((row, i) => {
      let username = ''

      if (row.classList && row.classList.contains('row')) {
        row.childNodes.forEach((cell, i) => {
          if (i === 0) {
            cell.childNodes.forEach((aPart, i) => {
              if (aPart.classList.contains('holdings__name')) {
                username = aPart.childNodes[0].innerHTML
              }
            })
          } else if (i === 1) {
            let coinPriceCell = cell.childNodes[0]
            let oldCoinPriceCell = cell.childNodes[1]
            let coinPrice = coinPriceCell.innerHTML

            oldCoinPriceCell.innerHTML = coinPrice

            newPortfolio.map((portfolioItem, i) => {
              if (portfolioItem.username === username) {
                portfolioItem.oldCoinPrice = coinPrice.match(
                  floatNumberPattern
                )[0]

                return portfolioItem
              }
            })
          }
        })
      }
    })
  })

  portfolio = newPortfolio
}

function prepareForNextDataLoad() {
  let portfolioRows = document.getElementsByClassName('portfolioRow')

  if (portfolioRows && portfolioRows.length > 0) {
    for (let row of portfolioRows) {
      let coinPrice = row.getElementsByClassName('coinPriceCell')[0].innerText
      // row.style.setProperty('align-items', 'center')

      row.style.position = 'relative'
      row.style.paddingTop = '20px'

      row.getElementsByClassName('oldCoinPriceCell')[0].innerText = coinPrice

      row.getElementsByClassName(
        'holdings__creator-coin-total'
      )[0].style.paddingTop = '0'
    }
  }
}

function getCreatorsData() {
  let newPortfolio = []

  portfolio.forEach((portfolioItem, i) => {
    getCreatorCoinData(portfolioItem.username, publicKey, 'wallet')
  })
}

function getCreatorCoinData(username, publicKey, context) {
  const parser = new DOMParser()

  const data = {
    AddGlobalFeedBool: false,
    Description: '',
    FetchUsersThatHODL: true,
    ModerationType: '',
    NumToFetch: 1,
    OrderBy: 'newest_last_post',
    PublicKeyBase58Check: '',
    ReaderPublicKeyBase58Check: publicKey,
    Username: username,
    UsernamePrefix: ''
  }

  clearCoinPriceCells()
  clearSharePriceInUsdCells()
  clearSharePriceInBitCloutCells()

  fetch(getProfilesUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      if (context === 'wallet') {
        updatePortfolioItemData(data)
      } else if (context === 'profile') {
        updateProfile(data)
      }
      // console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function getSidebarCreatorCoinData(username, publicKey, order) {
  const parser = new DOMParser()

  const data = {
    AddGlobalFeedBool: false,
    Description: '',
    FetchUsersThatHODL: true,
    ModerationType: '',
    NumToFetch: 1,
    OrderBy: 'newest_last_post',
    PublicKeyBase58Check: '',
    ReaderPublicKeyBase58Check: publicKey,
    Username: username,
    UsernamePrefix: ''
  }

  fetch(getProfilesUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      updateSidebar(data, order)
      // console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function getCreatorCoinBuyOrSellData(creatorData) {
  const parser = new DOMParser()

  const data = {
    BitCloutToAddNanos: 0,
    BitCloutToSellNanos: 0,
    Broadcast: false,
    CreatorCoinToSellNanos: creatorData.holderBalanceNanos,
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
      updateSharePriceInUsdCell(creatorData.username, data)
      updateSharePriceInBitCloutCell(creatorData.username, data)
      // console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

let following = []
let counter = 1

function getCreatorFollowing(nextPublicKey) {
  const parser = new DOMParser()

  // const data = {
  //   AddGlobalFeedBool: false,
  //   Description: '',
  //   FetchUsersThatHODL: true,
  //   ModerationType: '',
  //   NumToFetch: 1,
  //   OrderBy: 'newest_last_post',
  //   PublicKeyBase58Check: '',
  //   ReaderPublicKeyBase58Check: '',
  //   Username: 'alisher/followers',
  //   UsernamePrefix: ''
  // }

  // How to get all BitClout users
  // const data = {
  //   AddGlobalFeedBool: false,
  //   Description: null,
  //   FetchUsersThatHODL: false,
  //   ModerationType: 'leaderboard',
  //   NumToFetch: 1000000000,
  //   OrderBy: 'influencer_coin_price',
  //   PublicKeyBase58Check: null,
  //   ReaderPublicKeyBase58Check:
  //     'BC1YLgeXsafJ8vYcXurRMLy5UcYGbLtjnoXZZWZLuXJqbDVQqXAE6mf',
  //   Username: null,
  //   UsernamePrefix: null
  // }

  // PublicKeyBase58Check: "BC1YLjFkqyQXWE63NXyHFgiYn1QYG4V64kVQY9sTcBop2eVjhkAwGn8"
  // PublicKeyBase58Check: "BC1YLgjVzPgGGB7Lk5Lj1Rpjs8oZ9qUbR3D6aqSmhmCBYj3zVTUV4Dt"
  // PublicKeyBase58Check: "BC1YLhFt7Ky6i5Ss3N66tGMnCKbCkqFNB3WsRmgjH45Y1tkuiYWsZim"
  // PublicKeyBase58Check: "BC1YLj3wnLb9Wizoz1YKNUKhXcAfvMZwwVzYDn9MtEZ1EftEhBjGGpk"
  // PublicKeyBase58Check: "BC1YLgXzhUL4aZQhbB42zbFhQMoZV3gwXrbKXBu57bLaCSQn5MPAHLc"
  // PublicKeyBase58Check: "BC1YLgik3qTQfkn51dtbFuey7McxU1AgDQ1AAWnikA5rxL3aLCf98rF"
  // PublicKeyBase58Check: "BC1YLhVsxyDjJG3rQhFDUaCEdqiyaCwYmVDc5iEUUEN3QiH2eDq2d9k"
  // PublicKeyBase58Check: "BC1YLjGsc25NSHF87ejYtN4ht7X2o5bYLeybFkkcegYc6nDhHwv6mZg"

  // True/false is changing followers/following
  // const data = {
  //   PublicKeyBase58Check: nextPublicKey,
  //   getEntriesFollowingPublicKey: false,
  //   username: 'zakharday'
  // }

  // const data = {
  //   PublicKeysBase58Check: [
  //     'BC1YLgeXsafJ8vYcXurRMLy5UcYGbLtjnoXZZWZLuXJqbDVQqXAE6mf'
  //   ]
  // }

  const data = {
    FetchStartIndex: -1,
    NumToFetch: 100,
    PublicKeyBase58Check:
      'BC1YLgTwjbHjy8rLPWZHX53JMmreo5u3sxX5BvdASugUyUaMZdo51oh'
  }

  let getUsersStateless = 'https://api.bitclout.com/get-users-stateless'
  let getNotifications = 'https://api.bitclout.com/get-notifications'

  fetch(getNotifications, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'content-length': 87
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data)
      renderNotifications(data)
      // following.push(data['ProfilesFound'])
      // console.log(following)

      // if (data['NextPublicKey'] != '' && counter < 10) {
      //   getCreatorFollowing(data['NextPublicKey'])
      //   counter = counter + 1
      // }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function renderNotifications(data) {
  const wrapper = document.getElementsByClassName('global__center__inner')[0]
  const notifications = data['Notifications']
  const profiles = data['ProfilesByPublicKey']
  const posts = data['PostsByHash']

  console.log(notifications, profiles, posts)

  notifications.forEach((notification, i) => {
    const metadata = notification['Metadata']
    const userPublicKey = metadata['TransactorPublicKeyBase58Check']
    const type = metadata['TxnType']
    let div = document.createElement('div')

    if (type === 'FOLLOW') {
      Object.keys(profiles).forEach((key, i) => {
        if (key === userPublicKey) {
          div.innerHTML = `<a href='https://bitclout.com/u/${profiles[key]['Username']}'>${profiles[key]['Username']}</a> followed you`
        }
      })
    } else if (type === 'LIKE') {
      const postHash = metadata['LikeTxindexMetadata']['PostHashHex']
      let post = {}

      Object.keys(posts).forEach((key, i) => {
        if (key === postHash) {
          post = posts[key]
        }
      })

      Object.keys(profiles).forEach((key, i) => {
        if (key === userPublicKey) {
          div.innerHTML = `<a href='https://bitclout.com/u/${
            profiles[key]['PublicKeyBase58Check']
          }'>${profiles[key]['Username']}</a> liked your post "${post[
            'Body'
          ].slice(0, 50)}"`
        }
      })
    } else if (type === 'SUBMIT_POST') {
      const postHash =
        metadata['SubmitPostTxindexMetadata']['PostHashBeingModifiedHex']
      const parentPostHash =
        metadata['SubmitPostTxindexMetadata']['ParentPostHashHex']
      let post = {}
      let parentPost = {}

      Object.keys(posts).forEach((key, i) => {
        if (key === postHash) {
          post = posts[key]
        } else if (key === parentPostHash) {
          parentPost = posts[key]
        }
      })

      Object.keys(profiles).forEach((key, i) => {
        if (key === userPublicKey) {
          let postElement = document.createElement('a')
          postElement.href = `https://bitclout.com/posts/${post['PostHashHex']}`
          postElement.innerText = post['Body'].slice(0, 50)

          let postAuthorLink = document.createElement('a')
          postAuthorLink.href = `https://bitclout.com/u/${profiles[key]['Username']}`
          postAuthorLink.innerText = `@${profiles[key]['Username']} just posted the post`

          div.appendChild(postAuthorLink)
          div.appendChild(postElement)
        }
      })
    } else if (type === 'CREATOR_COIN') {
      const operationType =
        metadata['CreatorCoinTxindexMetadata']['OperationType']
      const quantity =
        metadata['CreatorCoinTxindexMetadata']['BitCloutToSellNanos']

      Object.keys(profiles).forEach((key, i) => {
        if (key === userPublicKey) {
          div.innerHTML = `<a href='https://bitclout.com/u/${profiles[key]['PublicKeyBase58Check']}'>${profiles[key]['Username']}</a> bought ~${quantity} worth of your creator coin`
        }
      })
    }

    wrapper.appendChild(div)
  })
}

// PublicKeyBase58Check: ""
// getEntriesFollowingPublicKey: false
// username: "zakharday"
//
// AddGlobalFeedBool: false
// Description: null
// FetchUsersThatHODL: false
// ModerationType: "leaderboard"
// NumToFetch: 10
// OrderBy: "influencer_coin_price"
// PublicKeyBase58Check: null
// ReaderPublicKeyBase58Check: "BC1YLgeXsafJ8vYcXurRMLy5UcYGbLtjnoXZZWZLuXJqbDVQqXAE6mf"
// Username: null
// UsernamePrefix: null

function clearCoinPriceCells() {
  let coinPriceCells = document.getElementsByClassName('coinPriceCell')

  for (let coinPriceCell of coinPriceCells) {
    coinPriceCell.innerHTML = '–'
  }
}

function clearSharePriceInUsdCells() {
  let elements = document.getElementsByClassName('assetsInUsdCell')

  for (let element of elements) {
    element.innerHTML = '–'
  }
}

function clearSharePriceInBitCloutCells() {
  let elements = document.getElementsByClassName('assetsInBitCloutCell')

  for (let element of elements) {
    element.innerHTML = '–'
  }
}

function updatePortfolioItemData(data) {
  let newPortfolio = []

  portfolio.forEach((portfolioItem, i) => {
    if (portfolioItem.username === data['ProfilesFound'][0]['Username']) {
      let newPortfolioItem = mergePortfolioItemData(
        portfolioItem,
        data,
        publicKey,
        bitCloutPrice
      )

      let realCoinPrice = calcAndFormatRealCoinPrice(
        newPortfolioItem,
        bitCloutPrice
      )

      updateNameCell(newPortfolioItem)
      updateCoinPriceCell(newPortfolioItem, realCoinPrice)
      addGitCloutPulseLink(newPortfolioItem)

      newPortfolio.push(newPortfolioItem)
    } else {
      newPortfolio.push(portfolioItem)
    }
  })

  portfolio = newPortfolio
}

function updateCoinPriceCell(portfolioItem, realCoinPrice) {
  let element = document.querySelector(
    `#${portfolioItem.username} .coinPriceCell`
  )

  element.innerText = ['$', realCoinPrice].join('')
}

function updateSharePriceInUsdCell(username, buyAndSellData) {
  let element = document.querySelector(`#${username} .assetsInUsdCell`)
  element.innerText = calcAndFormatPortfolioItemPriceInUsd(buyAndSellData)
}

function updateSharePriceInBitCloutCell(username, buyAndSellData) {
  let element = document.querySelector(`#${username} .assetsInBitCloutCell`)
  let sharePriceInBitClout = buyAndSellData['ExpectedBitCloutReturnedNanos']

  element.innerText = [sharePriceInBitClout / 1000000000, 'BC'].join(' ')
}

function updateShareCell(portfolioItem) {
  let element = document.querySelector(
    `#${portfolioItem.username} .assetsInBitCloutCell`
  )

  element.innerText = portfolioItem.holderEntry.portfolioItemShare
}

function updateNameCell(portfolioItem) {
  let element = document.querySelector(
    `#${portfolioItem.username} .holdings__name span:first-child`
  )

  element.innerText = [
    portfolioItem.username,
    calcFounderRewardPercentage(portfolioItem)
  ].join(' ')
}

function addFounderRewardPercentage(creatorData) {
  let wrapper = document.createElement('div')
  wrapper.style.whitespace = 'nowrap'

  let percent = document.createElement('div')
  percent.classList.add('font-weight-bold')
  percent.style.display = 'inline'
  percent.innerText = calcFounderRewardPercentage(creatorData)

  let label = document.createElement('div')
  label.classList.add('fc-muted')
  label.style.display = 'inline'
  label.innerText = ' Founder Reward'

  wrapper.appendChild(percent)
  wrapper.appendChild(label)

  document
    .querySelector(
      '.global__center__inner .d-flex.flex-column.pl-15px.pr-15px .fs-15px.pt-5px.d-flex.flex-wrap'
    )
    .appendChild(wrapper)
}

function updateProfile(data) {
  let creatorData = mergePortfolioItemData({}, data, publicKey, bitCloutPrice)
  let detectionElement = document.getElementsByClassName('gitCloutPulseLink')

  if (detectionElement.length == 0) {
    addGitCloutPulseLinkToProfile(creatorData)
    addFounderRewardPercentage(creatorData)
  }
}

function updateSidebar(data, order) {
  let creator = data['ProfilesFound'][0]
  let username = creator['Username']
  let coinEntry = creator['CoinEntry']
  let wrapper = document.getElementsByClassName('sidebarCreatorList')[0]
  let creatorListItemElement = sidebarCreatorListItemElement.cloneNode(true)
  let sidebarItem = mergePortfolioItemData({}, data, publicKey, bitCloutPrice)
  let creatorCoinPrice = calcAndFormatRealCoinPrice(sidebarItem, bitCloutPrice)

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

function calcRealCoinPrice(portfolioItem, bitCloutPrice) {
  return (portfolioItem.coinPriceBitCloutNanos * bitCloutPrice) / 1000000000
}

function calcAndFormatRealCoinPrice(portfolioItem, bitCloutPrice) {
  let realCoinPrice = calcRealCoinPrice(portfolioItem, bitCloutPrice)

  realCoinPrice = realCoinPrice.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })

  return realCoinPrice
}

function calcFounderRewardPercentage(portfolioItem) {
  return portfolioItem.coinEntry.creatorBasisPoints / 100 + '%'
}

function calcPortfolioItemShare(userThatHODL) {
  return userThatHODL['BalanceNanos'] / 1000000000
}

function calcAndFormatPortfolioItemPriceInUsd(buyAndSellData) {
  let sharePriceInUsd = calcPortfolioItemPriceInUsd(buyAndSellData)

  sharePriceInUsd = sharePriceInUsd.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })

  return ['$', sharePriceInUsd].join('')
}

function calcPortfolioItemPriceInUsd(buyAndSellData) {
  return (
    (buyAndSellData['ExpectedBitCloutReturnedNanos'] / 1000000000) *
    bitCloutPrice
  )
}

function addGitCloutPulseLink(portfolioItem) {
  let gitCloutPulseLink = document.querySelector(
    `#${portfolioItem.username} .gitCloutPulseLink`
  )

  if (gitCloutPulseLink === null) {
    let portfolioRow = document.getElementById(`${portfolioItem.username}`)

    gitCloutPulseLink = document.createElement('a')
    gitCloutPulseLink.href = `https://www.bitcloutpulse.com/profiles/${portfolioItem.publicKey}`
    gitCloutPulseLink.classList.add('gitCloutPulseLink')

    gitCloutPulseLink.style.backgroundColor = '#005bff'
    gitCloutPulseLink.style.borderRadius = '10px'
    gitCloutPulseLink.style.borderWidth = '1px'
    gitCloutPulseLink.style.borderColor = 'white'
    gitCloutPulseLink.style.borderStyle = 'solid'
    gitCloutPulseLink.style.position = 'absolute'
    gitCloutPulseLink.style.top = '16px'
    gitCloutPulseLink.style.left = '38px'
    gitCloutPulseLink.style.width = '16px'
    gitCloutPulseLink.style.height = '16px'
    gitCloutPulseLink.style.lineHeight = '16px'
    gitCloutPulseLink.style.marginRight = '10px'
    gitCloutPulseLink.style.fontSize = '10px'
    gitCloutPulseLink.style.textAlign = 'center'
    gitCloutPulseLink.style.color = 'white'
    gitCloutPulseLink.target = '_blank'
    gitCloutPulseLink.innerText = 'P'

    portfolioRow.appendChild(gitCloutPulseLink)
  }
}

function addGitCloutPulseLinkToProfile(creatorData) {
  let creatorProfileTopCard = document.querySelector(
    '.global__center__inner .position-relative'
  )

  if (creatorProfileTopCard != null) {
    gitCloutPulseLink = document.createElement('a')
    gitCloutPulseLink.href = `https://www.bitcloutpulse.com/profiles/${creatorData.publicKey}`
    gitCloutPulseLink.classList.add('gitCloutPulseLink')

    gitCloutPulseLink.style.backgroundColor = '#005bff'
    gitCloutPulseLink.style.borderRadius = '12px'
    gitCloutPulseLink.style.position = 'absolute'
    gitCloutPulseLink.style.top = '96px'
    gitCloutPulseLink.style.left = '110px'
    gitCloutPulseLink.style.width = '24px'
    gitCloutPulseLink.style.height = '24px'
    gitCloutPulseLink.style.lineHeight = '24px'
    gitCloutPulseLink.style.fontSize = '16px'
    gitCloutPulseLink.style.textAlign = 'center'
    gitCloutPulseLink.style.color = 'white'
    gitCloutPulseLink.target = '_blank'
    gitCloutPulseLink.innerText = 'P'

    creatorProfileTopCard.appendChild(gitCloutPulseLink)
  } else {
    waitAsyncPageLoad()
  }
}

function mergePortfolioItemData(portfolioItem, data, publicKey, bitCloutPrice) {
  let newPortfolioItem = Object.assign({}, portfolioItem)
  let creator = data['ProfilesFound'][0]
  let coinEntry = creator['CoinEntry']

  // prettier-ignore
  newPortfolioItem.stakeMultipleBasisPoints = creator['StakeMultipleBasisPoints']
  newPortfolioItem.publicKey = creator['PublicKeyBase58Check']
  newPortfolioItem.isVerified = creator['IsVerified']
  newPortfolioItem.coinPriceBitCloutNanos = creator['CoinPriceBitCloutNanos']

  newPortfolioItem.coinEntry = {
    creatorBasisPoints: coinEntry['CreatorBasisPoints'],
    bitCloutLockedNanos: coinEntry['BitCloutLockedNanos'],
    coinsInCirculationNanos: coinEntry['CoinsInCirculationNanos'],
    coinWatermarkNanos: coinEntry['CoinWatermarkNanos']
  }

  data['ProfilesFound'][0]['UsersThatHODL'].forEach((userThatHODL, i) => {
    if (publicKey === userThatHODL['HODLerPublicKeyBase58Check']) {
      newPortfolioItem.holderBalanceNanos = userThatHODL['BalanceNanos']

      getCreatorCoinBuyOrSellData(newPortfolioItem)
    }
  })

  return newPortfolioItem
}

function trackCreators(creatorList) {
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

  sidebarCreatorListItemElement = wrapperClone.childNodes[0]
  sidebarCreatorListItemElement.href = ''
  sidebarCreatorListItemElement.classList.add('creatorListItem')
  sidebarCreatorListItemElement.childNodes[0].style.backgroundImage = ''

  wrapperClone.innerHTML = ''

  heading.parentNode.insertBefore(headingClone, heading)
  heading.parentNode.insertBefore(wrapperClone, heading)

  creatorList.forEach((creatorListItem, i) => {
    getSidebarCreatorCoinData(creatorListItem, publicKey, i)
  })
}

function autoTrackCreators() {
  let detectionElement = document.getElementsByTagName(
    'right-bar-creators-leaderboard'
  )

  if (
    detectionElement != null &&
    detectionElement.length > 0 &&
    detectionElement[0].childNodes.length > 1
  ) {
    chrome.storage.sync.get('creatorList', ({ creatorList }) => {
      console.log(creatorList, creatorList.length)

      if (creatorList.length > 0 && creatorList[0] != '') {
        trackCreators(creatorList)
      }
    })
  } else {
    setTimeout(() => {
      autoTrackCreators()
    }, 1000)
  }
}

function updateWalletData() {
  getWalletData()
    .then(() => prepareForNextDataLoad())
    .then(() => getCreatorsData())
}

function addForceWalletUpdateButton() {
  let topBar = document.getElementsByClassName('global__top-bar')[0]
  let forceWalletUpdateButton = document.createElement('div')

  topBar.style.setProperty('justify-content', 'space-between')

  forceWalletUpdateButton.classList.add('forceWalletUpdateButton')
  forceWalletUpdateButton.innerHTML = 'Update wallet'
  forceWalletUpdateButton.style.width = '180px'
  forceWalletUpdateButton.style.height = '40px'
  forceWalletUpdateButton.style.marginRight = '15px'
  forceWalletUpdateButton.style.backgroundColor = '#005bff'
  forceWalletUpdateButton.style.borderRadius = '5px'
  forceWalletUpdateButton.style.textAlign = 'center'
  forceWalletUpdateButton.style.lineHeight = '40px'
  forceWalletUpdateButton.style.color = 'white'
  forceWalletUpdateButton.style.cursor = 'pointer'

  forceWalletUpdateButton.addEventListener('click', () => {
    updateWalletData()
  })

  topBar.appendChild(forceWalletUpdateButton)
}

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
  const firstLettersAccepted = ['w', 'u', 'n']

  if (firstLettersAccepted.includes(urlPartFirstLetter)) {
    let detectionElement = document.getElementsByClassName(
      'global__center__inner'
    )

    if (detectionElement != null && detectionElement.length > 0) {
      if (urlPartFirstLetter === 'w') {
        addForceWalletUpdateButton()
        updateWalletData()
        autoTrackCreators()
      } else if (urlPartFirstLetter === 'u') {
        let urlLastPart = urlPart.substr(urlPart.lastIndexOf('/') + 1)

        if (urlLastPart != 'buy' && urlLastPart != 'sell') {
          username = pathname.substr(3)
          getCreatorCoinData(username, '', 'profile')
        }
      } else if (urlPartFirstLetter === 'n') {
        // getCreatorFollowing('')
        const wrapper = document.getElementsByClassName(
          'global__center__inner'
        )[0]

        // wrapper.style.paddingBottom = '100px'

        let div = document.createElement('div')
        div.style.height = '100px'
        wrapper.appendChild(div)
      }
    } else {
      setTimeout(() => {
        waitAsyncPageLoad()
      }, 1000)
    }
  }
}

observeUrlChange()
waitAsyncPageLoad()
