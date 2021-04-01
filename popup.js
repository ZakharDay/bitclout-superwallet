let color = '#002200'

chrome.storage.onChanged.addListener(function (changes, namespace) {
  console.log('Storage changed')
})

let firstButton = document.getElementById('firstButton')

firstButton.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getWalletData
  })
})

secondButton.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getUsersData
  })
})

function getWalletData() {
  let bitCloutPrice = 0
  let publickKey = ''
  let portfolio = []

  let floatNumberPattern = /[-+]?[0-9]*\.?[0-9]+/g

  bitCloutPrice = document
    .querySelector('.right-bar-creators__balance-box .d-flex div:last-child')
    .innerHTML.match(/[^ ]*/i)[0]
    .substring(2)

  publicKey = document
    .querySelector(
      '.global__center__width .global__mobile-scrollable-section > .container'
    )
    .childNodes[1].childNodes[1].textContent.replace(/\s/g, '')

  let walletItems = document.querySelector(
    '.global__center__width .global__mobile-scrollable-section > .fs-15px:not(.container)'
  ).childNodes

  walletItems.forEach((walletItem, i) => {
    let portfolioItem = {}
    let rows = walletItem.childNodes

    rows.forEach((row, i) => {
      if (row.classList && row.classList.contains('row')) {
        row.childNodes.forEach((cell, i) => {
          if (i === 0) {
            // portfolioItem.link = cell.href

            cell.childNodes.forEach((aPart, i) => {
              if (aPart.classList.contains('holdings__name')) {
                portfolioItem.username = aPart.childNodes[0].innerHTML
                row.id = portfolioItem.username
              }
            })
          } else if (i === 1) {
            let coinPriceCell = cell.childNodes[0]

            portfolioItem.coinPrice = coinPriceCell.innerHTML.match(
              floatNumberPattern
            )[0]

            coinPriceCell.classList.add('coinPriceCell')
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

  chrome.storage.local.set({ bitCloutPrice })
  chrome.storage.local.set({ publicKey })
  chrome.storage.local.set({ portfolio })
}

function getUsersData() {
  let newPortfolio = []

  chrome.storage.local.get(
    ['bitCloutPrice', 'publicKey', 'portfolio'],
    ({ bitCloutPrice, publicKey, portfolio }) => {
      console.log(portfolio.length, portfolio)

      portfolio.forEach((user, i) => {
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
          Username: user.username,
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
            user.isVerified = data['ProfilesFound'][0]['IsVerified']
            user.coinEntry = {}

            user.coinEntry.creatorBasisPoints =
              data['ProfilesFound'][0]['CoinEntry']['CreatorBasisPoints']

            user.coinEntry.bitCloutLockedNanos =
              data['ProfilesFound'][0]['CoinEntry']['BitCloutLockedNanos']

            user.coinEntry.coinsInCirculationNanos =
              data['ProfilesFound'][0]['CoinEntry']['CoinsInCirculationNanos']

            user.coinEntry.coinWatermarkNanos =
              data['ProfilesFound'][0]['CoinEntry']['CoinWatermarkNanos']

            user.coinPriceBitCloutNanos =
              data['ProfilesFound'][0]['CoinPriceBitCloutNanos']

            user.stakeMultipleBasisPoints =
              data['ProfilesFound'][0]['StakeMultipleBasisPoints']

            let realCoinPrice =
              (user.coinPriceBitCloutNanos * bitCloutPrice) / 1000000000

            realCoinPrice = realCoinPrice.toLocaleString()

            let coinPriceCell = document.querySelector(
              `#${user.username} .coinPriceCell`
            )

            coinPriceCell.innerText = ['$', realCoinPrice].join('')

            newPortfolio.push(user)

            console.log('Success:', data)
          })
          .catch((error) => {
            console.error('Error:', error)
          })
      })
    }
  )
}

// function getUserData(username) {
//   const parser = new DOMParser()
//
//   chrome.storage.local.get(
//     ['bitCloutPrice', 'publicKey', 'portfolio'],
//     ({ bitCloutPrice, publicKey, portfolio }) => {
//       let userData = {}
//
//       const data = {
//         AddGlobalFeedBool: false,
//         Description: '',
//         FetchUsersThatHODL: true,
//         ModerationType: '',
//         NumToFetch: 1,
//         OrderBy: 'newest_last_post',
//         PublicKeyBase58Check: '',
//         ReaderPublicKeyBase58Check: publicKey,
//         Username: username,
//         UsernamePrefix: ''
//       }
//
//       fetch('https://api.bitclout.com/get-profiles', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//       })
//         .then((response) => response.json())
//         .then((data) => {
//           userData = stripResponseData(data)
//           console.log('Success:', data)
//         })
//         .catch((error) => {
//           console.error('Error:', error)
//         })
//     }
//   )
// }

// function stripResponseData(response) {
//   let stripedData = {
//     isVerified: response['IsVerified'],
//     coinEntry: {
//       creatorBasisPoints: response['CoinEntry']['CreatorBasisPoints'],
//       bitCloutLockedNanos: response['CoinEntry']['BitCloutLockedNanos'],
//       coinsInCirculationNanos: response['CoinEntry']['CoinsInCirculationNanos'],
//       coinWatermarkNanos: response['CoinEntry']['CoinWatermarkNanos']
//     },
//     coinPriceBitCloutNanos: response['CoinPriceBitCloutNanos'],
//     stakeMultipleBasisPoints: response['StakeMultipleBasisPoints']
//   }
//
//   return stripedData
// }
