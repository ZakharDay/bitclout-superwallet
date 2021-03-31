let color = '#002200'

chrome.storage.onChanged.addListener(function (changes, namespace) {
  console.log('Storage changed')
})

// Initialize button with user's preferred color
let firstButton = document.getElementById('firstButton')

// When the button is clicked, inject setPageBackgroundColor into current page
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

// The body of this function will be executed as a content script inside the
// current page
function getWalletData() {
  let walletData = {}
  let portfolio = []

  let floatNumberPattern = /[-+]?[0-9]*\.?[0-9]+/g

  let bitCloutPriceWrapper = document.querySelector(
    '.right-bar-creators__balance-box .d-flex div:last-child'
  )

  walletData.bitCloutPrice = bitCloutPriceWrapper.innerHTML
    .match(/[^ ]*/i)[0]
    .substring(2)

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

  chrome.storage.local.set({ walletData })
  chrome.storage.local.set({ portfolio })
}

function checkWalletData() {
  chrome.storage.local.get('walletData', ({ walletData }) => {
    console.log('Value currently is', walletData)
  })

  chrome.storage.local.get('portfolio', ({ portfolio }) => {
    console.log('Value currently is', portfolio)
  })
}

// The body of this function will be executed as a content script inside the
// current page
// function setPageBackgroundColor() {
//   console.log('test')
//   chrome.storage.sync.get('color', ({ color }) => {
//     document.body.style.backgroundColor = color
//   })
// }
