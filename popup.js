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
    function: checkWalletData
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
            portfolioItem.link = cell.href

            cell.childNodes.forEach((aPart, i) => {
              if (aPart.classList.contains('holdings__name')) {
                portfolioItem.name = aPart.childNodes[0].innerHTML
              }
            })
          } else if (i === 1) {
            portfolioItem.coinPrice = cell.childNodes[0].innerHTML.match(
              floatNumberPattern
            )[0]
          } else if (i === 2) {
            portfolioItem.assetsInUsd = cell.childNodes[0].childNodes[0].innerHTML.match(
              floatNumberPattern
            )[0]

            portfolioItem.assetsInBitClout = cell.childNodes[0].childNodes[1].innerHTML.match(
              floatNumberPattern
            )[0]
          }

          portfolio.push(portfolioItem)
        })
      }
    })
  })

  chrome.storage.local.set({ bitCloutPrice })
  chrome.storage.local.set({ publicKey })
  chrome.storage.local.set({ portfolio })
}

function checkWalletData() {
  const parser = new DOMParser()

  chrome.storage.local.get(
    ['bitCloutPrice', 'publicKey', 'portfolio'],
    ({ bitCloutPrice, publicKey, portfolio }) => {
      console.log(bitCloutPrice, publicKey, portfolio)

      const data = {
        AddGlobalFeedBool: false,
        Description: '',
        FetchUsersThatHODL: true,
        ModerationType: '',
        NumToFetch: 1,
        OrderBy: 'newest_last_post',
        PublicKeyBase58Check: '',
        ReaderPublicKeyBase58Check: publicKey,
        Username: isername,
        UsernamePrefix: ''
      }

      fetch('https://api.bitclout.com/get-profiles', {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data)
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
  )

  // chrome.storage.local.get('publicKey', ({ publicKey }) => {
  //   console.log('Value currently is', publicKey)
  // })
  //
  // chrome.storage.local.get('portfolio', ({ portfolio }) => {
  //   console.log('Value currently is', portfolio)
  // })

  // fetch('https://bitclout.com/u/angelasimmons')
  //   .then((response) => response.text())
  //   .then((data) => console.log(data))
}

function stripResponseData(response) {
  let stripedData = {
    username: response['Username'],
    isVerified: response['IsVerified'],
    coinEntry: {
      creatorBasisPoints: response['CoinEntry']['CreatorBasisPoints'],
      bitCloutLockedNanos: response['CoinEntry']['BitCloutLockedNanos'],
      coinsInCirculationNanos: response['CoinEntry']['CoinsInCirculationNanos'],
      coinWatermarkNanos: response['CoinEntry']['CoinWatermarkNanos']
    },
    coinPriceBitCloutNanos: response['CoinPriceBitCloutNanos'],
    stakeMultipleBasisPoints: response['StakeMultipleBasisPoints']
  }

  return stripedData
}
