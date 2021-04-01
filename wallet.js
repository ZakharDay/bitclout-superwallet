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
      row.getElementsByClassName('oldCoinPriceCell')[0].innerText = coinPrice
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
    ['bitCloutPrice', 'portfolio'],
    ({ bitCloutPrice, portfolio }) => {
      let newPortfolio = []

      portfolio.forEach((portfolioItem, i) => {
        if (portfolioItem.username === data['ProfilesFound'][0]['Username']) {
          let newPortfolioItem = Object.assign({}, portfolioItem)

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

          let realCoinPrice =
            (newPortfolioItem.coinPriceBitCloutNanos * bitCloutPrice) /
            1000000000

          realCoinPrice = realCoinPrice.toLocaleString(undefined, {
            maximumFractionDigits: 2
          })

          let coinPriceCell = document.querySelector(
            `#${newPortfolioItem.username} .coinPriceCell`
          )

          coinPriceCell.innerText = ['$', realCoinPrice].join('')
          newPortfolio.push(newPortfolioItem)
        } else {
          newPortfolio.push(portfolioItem)
        }
      })

      chrome.storage.local.set({ portfolio: newPortfolio })
    }
  )
}

getWalletData()
  .then(() => prepareForNextDataLoad())
  .then(() => getUsersData())
