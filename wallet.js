async function getWalletData() {
  let bitCloutPrice = 0
  let publickKey = ''
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

    chrome.storage.local.set({ bitCloutPrice })
    chrome.storage.local.set({ publicKey })

    await updateGridOnFirstLoad(walletItems)
  } else {
    await updateGrid(walletItems)
  }
}

async function updateGrid(walletItems) {
  const floatNumberPattern = /[-+]?[0-9]*\.?[0-9]+/g

  await chrome.storage.local.get('portfolio', ({ portfolio }) => {
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

    chrome.storage.local.set({ portfolio: newPortfolio })
  })
}

function updateGridOnFirstLoad(walletItems) {
  const floatNumberPattern = /[-+]?[0-9]*\.?[0-9]+/g
  let portfolio = []

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

  chrome.storage.local.set({ portfolio: portfolio })
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

function getUsersData() {
  chrome.storage.local.get(
    ['bitCloutPrice', 'publicKey', 'portfolio'],
    ({ bitCloutPrice, publicKey, portfolio }) => {
      let newPortfolio = []

      portfolio.forEach((portfolioItem, i) => {
        getUserData(portfolioItem.username, publicKey)
      })
    }
  )
}

function getUserData(username, publicKey) {
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

  fetch('https://api.bitclout.com/get-profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      updatePortfolioItemData(data)
      // console.log('Success:', data)
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

function updatePortfolioItemData(data) {
  chrome.storage.local.get(
    ['publicKey', 'bitCloutPrice', 'portfolio'],
    ({ publicKey, bitCloutPrice, portfolio }) => {
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

          updateCoinPriceCell(newPortfolioItem, realCoinPrice)
          updateSharePriceCell(newPortfolioItem)
          updateShareCell(newPortfolioItem)
          addGitCloutPulseLink(newPortfolioItem)

          newPortfolio.push(newPortfolioItem)
        } else {
          newPortfolio.push(portfolioItem)
        }
      })

      chrome.storage.local.set({ portfolio: newPortfolio })
    }
  )
}

function updateCoinPriceCell(portfolioItem, realCoinPrice) {
  let element = document.querySelector(
    `#${portfolioItem.username} .coinPriceCell`
  )

  element.innerText = ['$', realCoinPrice].join('')
}

function updateSharePriceCell(portfolioItem) {
  let { portfolioItemPrice } = portfolioItem.holderEntry

  let element = document.querySelector(
    `#${portfolioItem.username} .assetsInUsdCell`
  )

  sharePrice = portfolioItemPrice.toLocaleString(undefined, {
    maximumFractionDigits: 2
  })

  element.innerText = ['$', sharePrice].join('')
}

function updateShareCell(portfolioItem) {
  let element = document.querySelector(
    `#${portfolioItem.username} .assetsInBitCloutCell`
  )

  element.innerText = portfolioItem.holderEntry.portfolioItemShare
}

function calcRealCoinPrice(portfolioItem, bitCloutPrice) {
  return (portfolioItem.coinPriceBitCloutNanos * bitCloutPrice) / 1000000000
}

function calcAndFormatRealCoinPrice(portfolioItem, bitCloutPrice) {
  let realCoinPrice = calcRealCoinPrice(portfolioItem, bitCloutPrice)

  realCoinPrice = realCoinPrice.toLocaleString(undefined, {
    maximumFractionDigits: 2
  })

  return realCoinPrice
}

function calcPortfolioItemShare(userThatHODL) {
  return userThatHODL['BalanceNanos'] / 1000000000
}

function calcPortfolioItemPrice(newPortfolioItem, bitCloutPrice, userThatHODL) {
  return (
    calcPortfolioItemShare(userThatHODL) *
    calcRealCoinPrice(newPortfolioItem, bitCloutPrice)
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

function mergePortfolioItemData(portfolioItem, data, publicKey, bitCloutPrice) {
  let newPortfolioItem = Object.assign({}, portfolioItem)

  newPortfolioItem.publicKey = data['ProfilesFound'][0]['PublicKeyBase58Check']
  newPortfolioItem.isVerified = data['ProfilesFound'][0]['IsVerified']

  newPortfolioItem.coinEntry = {
    creatorBasisPoints:
      data['ProfilesFound'][0]['CoinEntry']['CreatorBasisPoints'],
    bitCloutLockedNanos:
      data['ProfilesFound'][0]['CoinEntry']['BitCloutLockedNanos'],
    coinsInCirculationNanos:
      data['ProfilesFound'][0]['CoinEntry']['CoinsInCirculationNanos'],
    coinWatermarkNanos:
      data['ProfilesFound'][0]['CoinEntry']['CoinWatermarkNanos']
  }

  newPortfolioItem.coinPriceBitCloutNanos =
    data['ProfilesFound'][0]['CoinPriceBitCloutNanos']

  newPortfolioItem.stakeMultipleBasisPoints =
    data['ProfilesFound'][0]['StakeMultipleBasisPoints']

  data['ProfilesFound'][0]['UsersThatHODL'].forEach((userThatHODL, i) => {
    if (publicKey === userThatHODL['HODLerPublicKeyBase58Check']) {
      newPortfolioItem.holderEntry = {
        balanceNanos: userThatHODL['BalanceNanos'],
        portfolioItemShare: calcPortfolioItemShare(userThatHODL),
        portfolioItemPrice: calcPortfolioItemPrice(
          newPortfolioItem,
          bitCloutPrice,
          userThatHODL
        )
      }
    }
  })

  return newPortfolioItem
}

getWalletData()
  .then(() => prepareForNextDataLoad())
  .then(() => getUsersData())
