import { isAN } from './utilities'
import { getStoreWalletPortfolio } from './store'
import { updateDataWalletPortfolio } from './actions'

import {
  floatNumberPattern,
  calcFounderRewardPercentage,
  calcAndFormatRealCoinPrice,
  calcAndFormatPortfolioItemPriceInUsd,
  calcAndFormatPortfolioItemPriceInBitClout
} from './calcs_and_formatters'

import {
  clearElementsWithDash,
  addHtmlUserExternalLinks
} from './html_modifiers'

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
          } else if (i === 2) {
            let assetsInUsdCell = cell.childNodes[0].childNodes[0]
            let assetsInBitCloutCell = cell.childNodes[0].childNodes[1]

            assetsYouOwnCell.innerHTML = [
              'YOU OWN',
              assetsInBitCloutCell.innerHTML
            ].join(' ')
          }
        })

        walletPortfolio.push(portfolioItem)
      }
    })
  })

  return walletPortfolio
}

function addHtmlWalletUpdateButton() {
  const walletTopBar = document.getElementsByClassName('global__top-bar')[0]
  const forceWalletUpdateButton = document.createElement('div')

  walletTopBar.classList.add('walletTopBar')
  forceWalletUpdateButton.classList.add('forceWalletUpdateButton')
  forceWalletUpdateButton.innerHTML = 'Update wallet'

  forceWalletUpdateButton.addEventListener('click', () => {
    prepareHtmlWalletForNextDataLoad().then(() => updateDataWalletPortfolio())
  })

  walletTopBar.appendChild(forceWalletUpdateButton)
}

function modifyHtmlWalletGridOnFirstLoad() {
  const totalPriceWrapper = document.querySelector(
    '.d-flex.align-items-center.justify-content-between.fs-18px.p-15px.holdings__divider.border-bottom.border-color-grey > div.fs-14px'
  )

  const walletPortfolioHeaderName = document.querySelector(
    '.row.no-gutters.d-flex.align-items-center.fc-muted.border-bottom.border-color-grey.pl-15px.py-15px .col.mb-0'
  )

  // const walletPortfolioHeaderPrice = document.querySelector(
  //   '.row.no-gutters.d-flex.align-items-center.fc-muted.border-bottom.border-color-grey.p-15px .col-2.d-lg-block.d-none.mb-0'
  // )

  const walletPortfolioHeaderShare = document.querySelector(
    '.row.no-gutters.d-flex.align-items-center.fc-muted.border-bottom.border-color-grey.pl-15px.py-15px .col-4.mb-0'
  )

  const walletPortfolioHeaderInfoIcon = walletPortfolioHeaderShare.childNodes[1]

  // const walletPortfolioHeaderEmpty = document.querySelector(
  //   '.row.no-gutters.d-flex.align-items-center.fc-muted.border-bottom.border-color-grey.p-15px .col-2.d-lg-block.d-none.mb-0:last-child'
  // )

  const walletPortfolioHtml = document.querySelector(
    '.global__center__width .global__mobile-scrollable-section > .fs-15px:not(.container)'
  ).childNodes

  const cellsWithPadding = document.getElementsByClassName(
    'holdings__creator-coin-total'
  )

  for (let cell of cellsWithPadding) {
    cell.style.paddingTop = 0
  }

  totalPriceWrapper.classList.add('totalPriceWrapper')
  totalPriceWrapper.innerHTML = ''

  const totalPriceInUsdCell = document.createElement('div')
  totalPriceInUsdCell.innerText = '–'

  totalPriceInUsdCell.classList.add(
    'totalPriceInUsdCell',
    'font-weight-bold',
    'text-right'
  )

  const totalPriceInBitCloutCell = document.createElement('div')
  totalPriceInBitCloutCell.innerText = '–'

  totalPriceInBitCloutCell.classList.add(
    'totalPriceInBitCloutCell',
    'fs-12px',
    'text-right'
  )

  totalPriceWrapper.appendChild(totalPriceInUsdCell)
  totalPriceWrapper.appendChild(totalPriceInBitCloutCell)

  walletPortfolioHeaderName.classList.remove('col')
  walletPortfolioHeaderName.classList.add('col-6')

  walletPortfolioHeaderShare.classList.remove('col-4')
  walletPortfolioHeaderShare.classList.add('col-3')

  walletPortfolioHeaderInfoIcon.style.position = 'absolute'
  walletPortfolioHeaderInfoIcon.style.top = '4px'
  walletPortfolioHeaderInfoIcon.style.right = '-20px'

  getStoreWalletPortfolio().then((portfolio) => {
    walletPortfolioHtml.forEach((portfolioItemHtml, i) => {
      let rows = portfolioItemHtml.childNodes

      rows.forEach((row, i) => {
        if (row.classList && row.classList.contains('row')) {
          row.style.position = 'relative'
          row.style.paddingTop = '20px'

          row.childNodes.forEach((cell, i) => {
            if (i === 0) {
              cell.classList.remove('col-lg-5')
              cell.classList.add('col-6')

              cell.childNodes.forEach((aPart, i) => {
                if (aPart.classList.contains('holdings__avatar')) {
                  aPart.style.marginBottom = '-8px'
                }

                if (aPart.classList.contains('holdings__name')) {
                  row.id = ['user_', aPart.childNodes[0].innerHTML].join('')
                  row.classList.add('portfolioRow')

                  aPart.style.height = '44px'
                  aPart.style.setProperty('flex-direction', 'column')

                  aPart.classList.add(
                    'd-none',
                    'd-lg-flex',
                    'align-items-start',
                    'justify-content-end'
                  )

                  let nameElement = document.createElement('span')
                  let nameElementWrapper = aPart.childNodes[0]
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
              let assetsInUsdCell = document.createElement('div')
              assetsInUsdCell.classList.add('assetsInUsdCell')

              let assetsInBitCloutCell = document.createElement('div')

              assetsInBitCloutCell.classList.add(
                'text-grey8A',
                'fs-12px',
                'text-right',
                'assetsInBitCloutCell'
              )

              cell.innerHTML = ''
              cell.classList.remove('col-4')
              cell.classList.add('col-3')
              cell.style.setProperty('flex-direction', 'column')
              cell.classList.remove('align-items-center')
              cell.classList.add('align-items-end')

              cell.appendChild(assetsInUsdCell)
              cell.appendChild(assetsInBitCloutCell)
            } else if (i === 3) {
              // cell.childNodes[1].remove()
              // cell.style.setProperty('flex-direction', 'column')
              // cell.classList.remove('align-items-center')
              // cell.classList.add('align-items-end')
              // cell.appendChild(cell.childNodes[0])
              // cell.childNodes[0].style.color = 'black'
              // cell.childNodes[1].classList.add('fs-12px')
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
      clearHtmlWalletPortfolioTotalCells()

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
    `#user_${item.username} .creatorNameCell`
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

function addHtmlWalletPortfolioItemUserExternalLinks(item) {
  const bitCloutPulseLink = document.querySelector(
    `#user_${item.username} .bitCloutPulseLink`
  )

  if (bitCloutPulseLink === null) {
    const element = document.getElementById(`user_${item.username}`)
    addHtmlUserExternalLinks(element, item)
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

function clearHtmlWalletPortfolioTotalCells() {
  document.querySelector('.totalPriceInUsdCell').innerText = '–'
  document.querySelector('.totalPriceInBitCloutCell').innerText = '–'
}

function updateHtmlWalletPortfolioItemCoinPriceCell(item) {
  const realCoinPrice = calcAndFormatRealCoinPrice(item)
  let element = document.querySelector(`#user_${item.username} .coinPriceCell`)

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
        updateHtmlWalletPortfolioItemCoinPriceCell(item)
        updateHtmlWalletPortfolioItemShareInUsdCell(item)
        updateHtmlWalletPortfolioItemShareInBitCloutCell(item)
        updateHtmlWalletPortfolioTotalPriceInUsdCell()
        updateHtmlWalletPortfolioTotalPriceInBitCloutCell()
      }
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
  addHtmlWalletPortfolioItemUserExternalLinks
}
