import './superwallet.scss'
import { getStoreBitCloutPrice, getStoreProfile } from './store'

function injectHtmlCss() {
  const detector = document.querySelector('style#superwallet')

  if (!detector) {
    const css = require(/* webpackMode: "eager" */ '../dist/superwallet.css?raw')
    const style = document.createElement('style')
    style.id = 'superwallet'

    if (style.styleSheet) {
      style.styleSheet.cssText = css
    } else {
      style.appendChild(document.createTextNode(css))
    }

    document.querySelector('head').appendChild(style)
  }
}

function markHtmlBody(marker) {
  const productCssClass = 'SuperWallet'
  let cssClass = 'swPending'
  // console.log(marker)

  if (marker === 'b') {
    cssClass = 'swBrowse'
  } else if (marker === 'u') {
    cssClass = 'swProfile'
  } else if (marker === 'w') {
    cssClass = 'swWallet'
  }

  document.body.classList.remove(
    'SuperWallet',
    'swPending',
    'swBrowse',
    'swProfile',
    'swWallet'
  )

  document.body.classList.add(productCssClass)
  document.body.classList.add(cssClass)
}

function getHtmlBitCloutPrice() {
  const bitCloutPrice = document
    .querySelector(
      '.right-bar-creators__balance-box > .d-flex:first-child > div:last-child'
    )
    .innerText.match(/[^ ]*/i)[0]
    .substring(2)

  return bitCloutPrice
}

function clearElementsWithDash(elements) {
  for (let element of elements) {
    element.innerHTML = '–'
  }
}

function addHtmlUserExternalLinks(element, data) {
  const userExternalLinks = document.createElement('div')
  userExternalLinks.classList.add('userExternalLinks')
  const superWalletIcon = document.createElement('div')
  superWalletIcon.classList.add('superWalletIcon')
  const linksList = document.createElement('div')
  linksList.classList.add('linksList')
  const linkItemPulse = document.createElement('a')
  linkItemPulse.classList.add('linkItem', 'bitCloutPulse')
  const linkItemSignal = document.createElement('a')
  linkItemSignal.classList.add('linkItem', 'signalClout')

  linkItemPulse.href = `https://bitcloutpulse.com/app/profiles/${data.publicKey}`
  linkItemPulse.target = '_blank'
  linkItemPulse.innerText = 'BitCloutPulse'
  linkItemSignal.href = `https://www.signalclout.com/u/${
    data.Username ? data.Username : data.username
  }/metrics`
  linkItemSignal.target = '_blank'
  linkItemSignal.innerText = 'SignalClout'

  userExternalLinks.appendChild(superWalletIcon)
  linksList.appendChild(linkItemPulse)
  linksList.appendChild(linkItemSignal)
  userExternalLinks.appendChild(linksList)
  element.appendChild(userExternalLinks)
}

function addHtmlBitCloutPrice() {
  const detector = document.querySelector('.bitCloutPrice')

  if (!detector) {
    const bitCloutPrice = getStoreBitCloutPrice()

    const yourBitClout = parseFloat(
      document.querySelector(
        '.right-bar-creators__balance-box > div:nth-child(2) > div:nth-child(2) > div:first-child'
      ).innerText
    )

    const yourBitCloutInUsd = (yourBitClout * bitCloutPrice).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      }
    )

    // prettier-ignore
    // const balanceBox = document.querySelector('.right-bar-creators__balance-box')
    // const line = document.createElement('hr')
    // balanceBox.appendChild(line)

    // const priceElement = document.createElement('div')
    // priceElement.classList.add('bitCloutPrice')
    // priceElement.innerText = `Rockets are cool, but $BitClout price is $${bitCloutPrice}, you have ${yourBitCloutInUsd} USD`
    // balanceBox.appendChild(priceElement)

    // const yourBitCloutInUSDElement = document.createElement('div')
    // yourBitCloutInUSDElement.classList.add('bitCloutPriceInUSD')
    // yourBitCloutInUSDElement.innerText = `You have ${
    //   yourBitClout * bitCloutPrice
    // } USD`
    // balanceBox.appendChild(yourBitCloutInUSDElement)

    // const copyrightElement = document.createElement('div')
    // copyrightElement.classList.add('swCopyright')
    // copyrightElement.innerText = '(by SuperWallet)'
    // balanceBox.appendChild(copyrightElement)
  }
}

export {
  injectHtmlCss,
  markHtmlBody,
  getHtmlBitCloutPrice,
  clearElementsWithDash,
  addHtmlUserExternalLinks,
  addHtmlBitCloutPrice
}
