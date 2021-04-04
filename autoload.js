// prettier-ignore
const buyOrSellUrl = 'https://api.bitclout.com/buy-or-sell-creator-coin-preview-WVAzTWpGOFFnMlBvWXZhTFA4NjNSZGNW'
const getProfilesUrl = 'https://api.bitclout.com/get-profiles'

const floatNumberPattern = /[-+]?[0-9]*\.?[0-9]+/g
let pageLoaded = false
let pageUpdated = false
let publicKey = ''
let bitCloutPrice = 0
let portfolio = []

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
      // updateSharePriceInUsdCell(newPortfolioItem)
      // updateShareCell(newPortfolioItem)
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

// function updateSharePriceInUsdCell(portfolioItem) {
//   let { portfolioItemPriceInUsd } = portfolioItem.holderEntry
//
//   let element = document.querySelector(
//     `#${portfolioItem.username} .assetsInUsdCell`
//   )
//
//   sharePriceInUsd = portfolioItemPriceInUsd.toLocaleString(undefined, {
//     maximumFractionDigits: 2,
//     minimumFractionDigits: 2
//   })
//
//   element.innerText = ['$', sharePriceInUsd].join('')
// }

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

  addGitCloutPulseLinkToProfile(creatorData)
  addFounderRewardPercentage(creatorData)
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

// function calcPortfolioItemPriceInUsd(
//   newPortfolioItem,
//   bitCloutPrice,
//   userThatHODL
// ) {
//   return (
//     calcPortfolioItemShare(userThatHODL) *
//     calcRealCoinPrice(newPortfolioItem, bitCloutPrice)
//   )
// }

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
  let pathname = window.location.pathname
  let urlPart = pathname.substr(1)
  let urlPartFirstLetter = urlPart.charAt(0)

  if (urlPartFirstLetter === 'w' || urlPartFirstLetter === 'u') {
    let detectionElement = document.getElementsByClassName(
      'global__center__inner'
    )

    if (detectionElement != null && detectionElement.length > 0) {
      if (urlPartFirstLetter === 'w') {
        addForceWalletUpdateButton()
        updateWalletData()
      } else if (urlPartFirstLetter === 'u') {
        let urlLastPart = urlPart.substr(urlPart.lastIndexOf('/') + 1)

        if (urlLastPart != 'buy' && urlLastPart != 'sell') {
          username = pathname.substr(3)
          getCreatorCoinData(username, '', 'profile')
        }
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
