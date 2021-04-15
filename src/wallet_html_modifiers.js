import {
  floatNumberPattern,
  calcFounderRewardPercentage,
  calcAndFormatRealCoinPrice,
  calcAndFormatPortfolioItemPriceInUsd
} from './calcs_and_formatters'

import { getStoreWalletPortfolio } from './store'
import { clearElementsWithDash } from './html_modifiers'
import { updateDataWalletPortfolio } from './actions'

function getHtmlWalletPublicKey() {
  const publicKey = document
    .querySelector(
      '.global__center__width .global__mobile-scrollable-section > .container'
    )
    .childNodes[1].childNodes[1].textContent.replace(/\s/g, '')

  return publicKey
}

function getHtmlWalletPortfolio() {
  const walletPortfolioHtml = document.querySelector(
    '.global__center__width .global__mobile-scrollable-section > .fs-15px:not(.container)'
  ).childNodes

  let walletPortfolio = []

  walletPortfolioHtml.forEach((portfolioItemHtml, i) => {
    let portfolioItem = {}
    let rows = portfolioItemHtml.childNodes

    rows.forEach((row, i) => {
      if (row.classList && row.classList.contains('row')) {
        let assetsYouOwnCell = document.createElement('div')

        row.childNodes.forEach((cell, i) => {
          if (i === 0) {
            cell.childNodes.forEach((aPart, i) => {
              if (aPart.classList.contains('holdings__name')) {
                assetsYouOwnCell.classList.add(
                  'assetsYouOwnCell',
                  'text-grey8A',
                  'fs-12px'
                )

                aPart.appendChild(assetsYouOwnCell)
                portfolioItem.username = aPart.childNodes[0].innerHTML
              }
            })
          } else if (i === 1) {
            let coinPriceCell = cell.childNodes[0]
            let coinPrice = coinPriceCell.innerHTML
            portfolioItem.oldCoinPrice = coinPrice
          } else if (i === 2) {
            let assetsInUsdCell = cell.childNodes[0].childNodes[0]
            let assetsInBitCloutCell = cell.childNodes[0].childNodes[1]

            assetsYouOwnCell.innerHTML = [
              'YOU OWN',
              assetsInBitCloutCell.innerHTML
            ].join(' ')

            portfolioItem.assetsInUsd = assetsInUsdCell.innerHTML.match(
              floatNumberPattern
            )[0]

            portfolioItem.assetsInBitClout = assetsInBitCloutCell.innerHTML.match(
              floatNumberPattern
            )[0]
          }
        })

        walletPortfolio.push(portfolioItem)
      }
    })
  })

  return walletPortfolio
}

function addHtmlWalletUpdateButton() {
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
    prepareHtmlWalletForNextDataLoad().then(() => updateDataWalletPortfolio())
  })

  topBar.appendChild(forceWalletUpdateButton)
}

function modifyHtmlWalletGridOnFirstLoad() {
  const walletPortfolioHtml = document.querySelector(
    '.global__center__width .global__mobile-scrollable-section > .fs-15px:not(.container)'
  ).childNodes

  const cellsWithPadding = document.getElementsByClassName(
    'holdings__creator-coin-total'
  )

  for (let cell of cellsWithPadding) {
    cell.style.paddingTop = 0
  }

  getStoreWalletPortfolio().then((portfolio) => {
    walletPortfolioHtml.forEach((portfolioItemHtml, i) => {
      let rows = portfolioItemHtml.childNodes

      rows.forEach((row, i) => {
        if (row.classList && row.classList.contains('row')) {
          row.style.position = 'relative'
          row.style.paddingTop = '20px'

          row.childNodes.forEach((cell, i) => {
            if (i === 0) {
              cell.classList.remove('col')
              cell.classList.add('col-5')

              cell.childNodes.forEach((aPart, i) => {
                if (aPart.classList.contains('holdings__name')) {
                  row.id = aPart.childNodes[0].innerHTML
                  row.classList.add('portfolioRow')
                }
              })
            } else if (i === 1) {
              let coinPriceCell = cell.childNodes[0]
              let coinPrice = coinPriceCell.innerHTML

              cell.style.flexDirection = 'column'
              cell.style.setProperty('align-items', 'flex-end', 'important')
              coinPriceCell.classList.add('coinPriceCell')

              coinPriceCell.classList.remove(
                'd-flex',
                'align-items-center',
                'justify-content-end'
              )

              let oldCoinPriceCell = document.createElement('div')

              oldCoinPriceCell.classList.add(
                'text-grey8A',
                'fs-12px',
                'text-right',
                'oldCoinPriceCell'
              )

              oldCoinPriceCell.style.textDecoration = 'line-through'
              oldCoinPriceCell.innerHTML = coinPrice
              cell.appendChild(oldCoinPriceCell)
            } else if (i === 2) {
              let assetsInUsdCell = cell.childNodes[0].childNodes[0]
              let assetsInBitCloutCell = cell.childNodes[0].childNodes[1]

              cell.classList.remove('col-4')
              cell.classList.add('col-3')
              assetsInUsdCell.classList.add('assetsInUsdCell')
              assetsInBitCloutCell.classList.add('assetsInBitCloutCell')
              assetsInBitCloutCell.style.paddingTop = '0'
            }
          })
        }
      })
    })
  })
}

function prepareHtmlWalletForNextDataLoad() {
  return new Promise(function (resolve, reject) {
    moveHtmlWalletPortfolioOldCoinPrice().then(() => {
      clearHtmlWalletPortfolioItemCoinPriceCells()
      clearHtmlWalletPortfolioItemShareInUsdCells()
      clearHtmlWalletPortfolioItemShareInBitCloutCells()

      resolve()
    })
  })
}

function moveHtmlWalletPortfolioOldCoinPrice() {
  return new Promise(function (resolve, reject) {
    let portfolioRows = document.getElementsByClassName('portfolioRow')

    if (portfolioRows && portfolioRows.length > 0) {
      for (let row of portfolioRows) {
        // prettier-ignore
        const coinPrice = row.getElementsByClassName('coinPriceCell')[0].innerText
        row.getElementsByClassName('oldCoinPriceCell')[0].innerText = coinPrice
      }
    }

    resolve()
  })
}

function updateHtmlWalletPortfolioItemNameCell(item) {
  let element = document.querySelector(
    `#${item.username} .holdings__name span:first-child`
  )

  if (
    item.coinEntry != undefined &&
    item.coinEntry.creatorBasisPoints != undefined
  ) {
    element.innerText = [item.username, calcFounderRewardPercentage(item)].join(
      ' '
    )
  }
}

function addHtmlWalletPortfolioBitCloutPulseLinks() {
  getStoreWalletPortfolio().then((portfolio) => {
    portfolio.forEach((item, i) => {
      addHtmlWalletPortfolioItemBitCloutPulseLink(item)
    })
  })
}

function addHtmlWalletPortfolioItemBitCloutPulseLink(item) {
  let bitCloutPulseLink = document.querySelector(
    `#${item.username} .bitCloutPulseLink`
  )

  if (bitCloutPulseLink === null) {
    let portfolioRow = document.getElementById(`${item.username}`)

    bitCloutPulseLink = document.createElement('a')
    bitCloutPulseLink.href = `https://www.bitcloutpulse.com/profiles/${item.publicKey}`
    bitCloutPulseLink.classList.add('bitCloutPulseLink')

    bitCloutPulseLink.style.backgroundColor = '#005bff'
    bitCloutPulseLink.style.borderRadius = '10px'
    bitCloutPulseLink.style.borderWidth = '1px'
    bitCloutPulseLink.style.borderColor = 'white'
    bitCloutPulseLink.style.borderStyle = 'solid'
    bitCloutPulseLink.style.position = 'absolute'
    bitCloutPulseLink.style.top = '16px'
    bitCloutPulseLink.style.left = '38px'
    bitCloutPulseLink.style.width = '16px'
    bitCloutPulseLink.style.height = '16px'
    bitCloutPulseLink.style.lineHeight = '16px'
    bitCloutPulseLink.style.marginRight = '10px'
    bitCloutPulseLink.style.fontSize = '10px'
    bitCloutPulseLink.style.textAlign = 'center'
    bitCloutPulseLink.style.color = 'white'
    bitCloutPulseLink.target = '_blank'
    bitCloutPulseLink.innerText = 'P'

    portfolioRow.appendChild(bitCloutPulseLink)
  }
}

function clearHtmlWalletPortfolioItemCoinPriceCells() {
  let elements = document.getElementsByClassName('coinPriceCell')
  clearElementsWithDash(elements)
}

function clearHtmlWalletPortfolioItemShareInUsdCells() {
  const elements = document.getElementsByClassName('assetsInUsdCell')
  clearElementsWithDash(elements)
}

function clearHtmlWalletPortfolioItemShareInBitCloutCells() {
  const elements = document.getElementsByClassName('assetsInBitCloutCell')
  clearElementsWithDash(elements)
}

function updateHtmlWalletPortfolioItemCoinPriceCell(item) {
  const realCoinPrice = calcAndFormatRealCoinPrice(item)
  let element = document.querySelector(`#${item.username} .coinPriceCell`)

  if (isNaN(realCoinPrice) && realCoinPrice.length <= 3) {
    element.innerText = '–'
  } else {
    element.innerText = ['$', realCoinPrice].join('')
  }
}

function updateHtmlWalletPortfolioItemShareInUsdCell(item) {
  const shareInNanos = item.expectedBitCloutReturnedNanos
  let element = document.querySelector(`#${item.username} .assetsInUsdCell`)

  if (isNaN(shareInNanos)) {
    element.innerText = '–'
  } else {
    element.innerText = calcAndFormatPortfolioItemPriceInUsd(shareInNanos)
  }
}

function updateHtmlWalletPortfolioItemShareInBitCloutCell(item) {
  const share = item.expectedBitCloutReturnedNanos

  let element = document.querySelector(
    `#${item.username} .assetsInBitCloutCell`
  )

  if (isNaN(share)) {
    element.innerText = '–'
  } else {
    const formattedShare = (share / 1000000000).toLocaleString(undefined, {
      maximumFractionDigits: 4,
      minimumFractionDigits: 4
    })

    element.innerText = [formattedShare, 'BC'].join(' ')
  }
}

function updateHtmlWalletPortfolio() {
  getStoreWalletPortfolio().then((portfolio) => {
    portfolio.forEach((item, i) => {
      updateHtmlWalletPortfolioItemNameCell(item)
      updateHtmlWalletPortfolioItemCoinPriceCell(item)
      updateHtmlWalletPortfolioItemShareInUsdCell(item)
      updateHtmlWalletPortfolioItemShareInBitCloutCell(item)
    })
  })
}

export {
  getHtmlWalletPublicKey,
  getHtmlWalletPortfolio,
  addHtmlWalletUpdateButton,
  modifyHtmlWalletGridOnFirstLoad,
  prepareHtmlWalletForNextDataLoad,
  clearHtmlWalletPortfolioItemCoinPriceCells,
  clearHtmlWalletPortfolioItemShareInUsdCells,
  clearHtmlWalletPortfolioItemShareInBitCloutCells,
  updateHtmlWalletPortfolioItemCoinPriceCell,
  updateHtmlWalletPortfolioItemShareInUsdCell,
  updateHtmlWalletPortfolioItemShareInBitCloutCell,
  updateHtmlWalletPortfolioItemNameCell,
  updateHtmlWalletPortfolio,
  addHtmlWalletPortfolioBitCloutPulseLinks,
  addHtmlWalletPortfolioItemBitCloutPulseLink
}
