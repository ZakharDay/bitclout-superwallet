import { isAN } from './utilities'
import { updateDataWalletPortfolio } from './actions'
import { getApiWalletPortfolioItemData } from './server_requests'

import {
  getStoreWalletPortfolio,
  getStoreBitCloutPrice,
  setStorePortfolioLength,
  addStorePortfolio
} from './store'

import {
  floatNumberPattern,
  calcFounderRewardPercentage,
  calcAndFormatRealCoinPrice,
  calcAndFormatPortfolioItemPriceInUsd,
  calcAndFormatPortfolioItemPriceInBitClout,
  calcAndFormatPortfolioItemPriceInDeso
} from './calcs_and_formatters'

import {
  clearElementsWithDash,
  addHtmlUserExternalLinks
} from './html_modifiers'

function getHtmlWalletPublicKey() {
  const publicKey = document
    .querySelector('.holdings__pub-key')
    .textContent.replace(/\s/g, '')

  return publicKey
}

function prepareHtmlWalletPortfolio() {
  const walletPortfolioHeaderName = document.querySelector(
    '.row.no-gutters.d-flex.align-items-center.border-bottom.border-color-grey.pl-15px.py-15px .col.mb-0'
  )

  // const walletPortfolioHeaderPrice = document.querySelector(
  //   '.row.no-gutters.d-flex.align-items-center.fc-muted.border-bottom.border-color-grey.p-15px .col-2.d-lg-block.d-none.mb-0'
  // )

  const walletPortfolioHeaderShare = document.querySelector(
    '.row.no-gutters.d-flex.align-items-center.border-bottom.border-color-grey.pl-15px.py-15px .col-4.mb-0'
  )

  const walletPortfolioHeaderInfoIcon = walletPortfolioHeaderShare.childNodes[1]

  walletPortfolioHeaderName.classList.remove('col')
  walletPortfolioHeaderName.classList.add('col-6')

  walletPortfolioHeaderShare.classList.remove('col-4')
  walletPortfolioHeaderShare.classList.add('col-3')

  walletPortfolioHeaderInfoIcon.style.position = 'absolute'
  walletPortfolioHeaderInfoIcon.style.top = '4px'
  walletPortfolioHeaderInfoIcon.style.right = '-20px'
}

function updateHtmlPortfolio() {
  return new Promise(function (resolve, reject) {
    const walletPortfolioHtml = document.querySelector(
      'wallet > .d-flex > .row + div'
    ).childNodes

    setStorePortfolioLength(walletPortfolioHtml.length)

    walletPortfolioHtml.forEach((portfolioItemHtml, i) => {
      if (
        i > 0 &&
        portfolioItemHtml.classList != undefined &&
        portfolioItemHtml.childNodes.length != 0
      ) {
        const row = portfolioItemHtml.childNodes[0].childNodes[0]

        if (
          row &&
          row.classList &&
          row.classList.contains('row') &&
          row.id === ''
        ) {
          updateHtmlPortfolioRow(row)
        }
      }

      if (i + 1 === walletPortfolioHtml.length) {
        resolve()
      }
    })
  })
}

function updateHtmlPortfolioRow(row) {
  const nickname = row.querySelector('.holdings__name').childNodes[0].innerHTML
  row.id = ['user_', nickname].join('')
  row.classList.add('portfolioRow')

  const assetsInBitClout =
    row.childNodes[2].childNodes[0].childNodes[1].innerText

  row.childNodes.forEach((cell, i) => {
    if (i === 0) {
      showAssetsYouOwn(cell, assetsInBitClout)
      updateFirstCell(cell)
    } else if (i === 1) {
      updateSecondCell(cell)
    } else if (i === 2) {
      updateThirdCell(cell)
    }
  })

  getApiWalletPortfolioItemData(nickname).then((data) => {
    const item = data.ProfilesFound[0]
    updateHtmlWalletPortfolioItemNameCell(item)
    addHtmlWalletPortfolioItemUserExternalLinks(item)
  })
}

function updateThirdCell(cell) {
  let assetsInUsd
  const assetsInUsdCell = cell.childNodes[0].childNodes[0]
  const assetsInDesoCell = cell.childNodes[0].childNodes[1]
  assetsInUsdCell.classList.add('assetsInUsdCell')
  assetsInDesoCell.classList.add('assetsInDesoCell')

  if (assetsInUsdCell.innerText.slice(-1) === 'K') {
    assetsInUsd = assetsInUsdCell.innerText.substring(2).slice(0, -1)

    assetsInUsd = parseFloat(assetsInUsd) * 1000
  } else {
    assetsInUsd = assetsInUsdCell.innerText.substring(2).slice(0, -1)

    assetsInUsd = parseFloat(assetsInUsd)
  }

  assetsInDesoCell.innerText = [
    '~',
    calcAndFormatPortfolioItemPriceInDeso(assetsInUsd)
  ].join('')

  cell.classList.remove('col-4')
  cell.classList.add('col-3')
}

function updateSecondCell(cell) {
  const coinPriceCell = cell.childNodes[0]
  const coinPrice = coinPriceCell.innerHTML

  cell.style.flexDirection = 'column'
  cell.style.setProperty('align-items', 'flex-end', 'important')
  coinPriceCell.classList.add('coinPriceCell')

  coinPriceCell.classList.remove(
    'd-flex',
    'align-items-center',
    'justify-content-end'
  )

  const coinPriceInDesoCell = document.createElement('div')

  coinPriceInDesoCell.classList.add(
    'text-grey8A',
    'fs-12px',
    'text-right',
    'coinPriceInDesoCell'
  )

  const coinPriceNumber = coinPrice.substring(2).replace(/,/g, '')

  coinPriceInDesoCell.innerHTML = calcAndFormatPortfolioItemPriceInDeso(
    coinPriceNumber
  )

  cell.appendChild(coinPriceInDesoCell)
}

function updateFirstCell(cell) {
  cell.classList.remove('col-lg-5')
  cell.classList.add('col-6')

  cell.childNodes.forEach((aPart, i) => {
    if (aPart.classList.contains('holdings__avatar')) {
      aPart.style.marginBottom = '-8px'
    }

    if (aPart.classList.contains('holdings__name')) {
      aPart.style.height = '44px'
      aPart.style.setProperty('flex-direction', 'column')

      aPart.classList.add(
        'd-none',
        'd-lg-flex',
        'align-items-start',
        'justify-content-end'
      )

      const nameElement = document.createElement('span')
      const nameElementWrapper = aPart.childNodes[0]
      nameElement.classList.add('creatorNameCell')
      nameElement.innerText = nameElementWrapper.innerText
      nameElementWrapper.innerHTML = ''
      nameElementWrapper.appendChild(nameElement)

      for (let node of aPart.childNodes) {
        if (
          node &&
          node.classList &&
          node.classList.contains('mat-tooltip-trigger')
        ) {
          node.classList.remove('ml-1')
          node.classList.add('ml-2')
          node.childNodes[0].classList.remove('align-middle')
          node.childNodes[0].classList.add('align-baseline')
          nameElementWrapper.appendChild(node)
        }
      }
    }
  })
}

function showAssetsYouOwn(sourceCell, content) {
  sourceCell.childNodes.forEach((sourceCellRow, i) => {
    if (sourceCellRow.classList.contains('holdings__name')) {
      const assetsYouOwnCell = document.createElement('div')
      assetsYouOwnCell.innerHTML = ['YOU OWN', content].join(' ')

      assetsYouOwnCell.classList.add(
        'assetsYouOwnCell',
        'text-grey8A',
        'fs-12px'
      )

      sourceCellRow.appendChild(assetsYouOwnCell)
    }
  })
}

function updateHtmlWalletPortfolioItemNameCell(item) {
  let element = document.querySelector(
    `#user_${item.Username} .creatorNameCell`
  )

  if (
    item.CoinEntry != undefined &&
    item.CoinEntry.CreatorBasisPoints != undefined
  ) {
    element.innerText = [item.Username, calcFounderRewardPercentage(item)].join(
      ' '
    )
  }
}

function addHtmlWalletPortfolioItemUserExternalLinks(item) {
  const bitCloutPulseLink = document.querySelector(
    `#user_${item.Username} .bitCloutPulseLink`
  )

  if (bitCloutPulseLink === null) {
    const element = document.getElementById(`user_${item.Username}`)
    addHtmlUserExternalLinks(element, item)
  }
}

//
//
//
//
//

function clearHtmlWalletPortfolioItemCoinPriceCells() {
  let elements = document.getElementsByClassName('coinPriceCell')
  clearElementsWithDash(elements)

  // TODO: refactor

  for (let element of elements) {
    element.classList.remove('up', 'down', 'same')
  }
}

function clearHtmlWalletPortfolioItemShareInUsdCells() {
  const elements = document.getElementsByClassName('assetsInUsdCell')
  clearElementsWithDash(elements)
}

function clearHtmlWalletPortfolioItemShareInBitCloutCells() {
  const elements = document.getElementsByClassName('assetsInBitCloutCell')
  clearElementsWithDash(elements)
}

// function clearHtmlWalletPortfolioTotalCells() {
//   document.querySelector('.totalPriceInUsdCell').innerText = '–'
//   document.querySelector('.totalPriceInBitCloutCell').innerText = '–'
// }

function updateHtmlWalletPortfolioItemCoinPriceCell(item) {
  const realCoinPrice = calcAndFormatRealCoinPrice(item)
  let element = document.querySelector(`#user_${item.username} .coinPriceCell`)

  // console.log('used', item)
  element.classList.remove('up', 'down', 'same')

  if (item.oldCoinPriceBitCloutNanos > item.coinPriceBitCloutNanos) {
    element.classList.add('down')
  } else if (item.oldCoinPriceBitCloutNanos < item.coinPriceBitCloutNanos) {
    element.classList.add('up')
  } else {
    element.classList.add('same')
  }

  if (isAN(parseInt(realCoinPrice))) {
    element.innerText = ['$', realCoinPrice].join('')
  } else {
    element.innerText = '–'
  }
}

function updateHtmlWalletPortfolioItemShareInUsdCell(item) {
  const shareInNanos = item.expectedBitCloutReturnedNanos
  let element = document.querySelector(
    `#user_${item.username} .assetsInUsdCell`
  )

  if (isNaN(shareInNanos) || shareInNanos == undefined) {
    element.innerText = '–'
  } else {
    element.innerText = calcAndFormatPortfolioItemPriceInUsd(shareInNanos)
  }
}

function updateHtmlWalletPortfolioItemShareInBitCloutCell(item) {
  const share = item.expectedBitCloutReturnedNanos

  let element = document.querySelector(
    `#user_${item.username} .assetsInBitCloutCell`
  )

  if (isNaN(share) || share == undefined) {
    element.innerText = '–'
  } else {
    const formattedShare = calcAndFormatPortfolioItemPriceInBitClout(share)
    element.innerText = formattedShare
  }
}

function updateHtmlWalletPortfolioTotalPriceInUsdCell() {
  getStoreWalletPortfolio().then((portfolio) => {
    let expectedTotalBitCloutReturnedNanos = 0

    portfolio.forEach((item, i) => {
      if (isAN(item.expectedBitCloutReturnedNanos)) {
        expectedTotalBitCloutReturnedNanos += item.expectedBitCloutReturnedNanos
      }
    })

    const total = calcAndFormatRealCoinPrice({
      coinPriceBitCloutNanos: expectedTotalBitCloutReturnedNanos
    })

    const element = document.querySelector('.totalPriceInUsdCell')

    if (isAN(parseInt(total))) {
      element.innerText = ['TOTAL ', '$', total].join('')
    } else {
      element.innerText = '–'
    }
  })
}

function updateHtmlWalletPortfolioTotalPriceInBitCloutCell() {
  getStoreWalletPortfolio().then((portfolio) => {
    let expectedTotalBitCloutReturnedNanos = 0

    portfolio.forEach((item, i) => {
      if (isAN(item.expectedBitCloutReturnedNanos)) {
        expectedTotalBitCloutReturnedNanos += item.expectedBitCloutReturnedNanos
      }
    })

    const element = document.querySelector('.totalPriceInBitCloutCell')
    const formated = calcAndFormatPortfolioItemPriceInBitClout(
      expectedTotalBitCloutReturnedNanos
    )

    if (isAN(parseInt(formated))) {
      element.innerText = formated
    } else {
      element.innerText = '–'
    }
  })
}

function removeHtmlWalletPortfolioItem(item) {
  let element = document.getElementById(`user_${item.username}`)
  element.style.display = 'none'
}

function updateHtmlWalletPortfolio() {
  getStoreWalletPortfolio().then((portfolio) => {
    portfolio.forEach((item, i) => {
      if (item.balanceNanos <= 1) {
        removeHtmlWalletPortfolioItem(item)
      } else {
        updateHtmlWalletPortfolioItemNameCell(item)
        // updateHtmlWalletPortfolioItemCoinPriceCell(item)
        // updateHtmlWalletPortfolioItemShareInUsdCell(item)
        // updateHtmlWalletPortfolioItemShareInBitCloutCell(item)
        // updateHtmlWalletPortfolioTotalPriceInUsdCell()
        // updateHtmlWalletPortfolioTotalPriceInBitCloutCell()
      }
    })
  })
}

export {
  getHtmlWalletPublicKey,
  prepareHtmlWalletPortfolio,
  updateHtmlPortfolio,
  // getHtmlWalletPortfolio,
  // addHtmlWalletUpdateButton,
  // modifyHtmlWalletGridOnFirstLoad,
  // prepareHtmlWalletForNextDataLoad,
  clearHtmlWalletPortfolioItemCoinPriceCells,
  clearHtmlWalletPortfolioItemShareInUsdCells,
  clearHtmlWalletPortfolioItemShareInBitCloutCells,
  updateHtmlWalletPortfolioItemCoinPriceCell,
  updateHtmlWalletPortfolioItemShareInUsdCell,
  updateHtmlWalletPortfolioItemShareInBitCloutCell,
  updateHtmlWalletPortfolioItemNameCell,
  updateHtmlWalletPortfolio,
  addHtmlWalletPortfolioItemUserExternalLinks
}
