import './superwallet.scss'

function injectHtmlCss() {
  const css = require(/* webpackMode: "eager" */ '../dist/superwallet.css?raw')
  const style = document.createElement('style')

  if (style.styleSheet) {
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }

  document.getElementsByTagName('head')[0].appendChild(style)
}

function markHtmlBody(marker) {
  let cssClass = 'superwallet'
  console.log(marker)

  if (marker === 'b') {
    cssClass = 'swBrowse'
  } else if (marker === 'u') {
    cssClass = 'swProfile'
  } else if (marker === 'w') {
    cssClass = 'swWallet'
  }

  document.body.classList.remove('swBrowse', 'swProfile', 'swWallet')
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

function addHtmlUserExternalLinks(data, element) {
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

  linkItemPulse.href = `https://www.bitcloutpulse.com/profiles/${data.publicKey}`
  linkItemPulse.target = '_blank'
  linkItemPulse.innerText = 'BitCloutPulse'
  linkItemSignal.href = `https://www.signalclout.com/profile-analyzer?search=${data.username}&history=true`
  linkItemSignal.target = '_blank'
  linkItemSignal.innerText = 'SignalClout'

  userExternalLinks.appendChild(superWalletIcon)
  linksList.appendChild(linkItemPulse)
  linksList.appendChild(linkItemSignal)
  userExternalLinks.appendChild(linksList)
  element.appendChild(userExternalLinks)
}

export {
  injectHtmlCss,
  markHtmlBody,
  getHtmlBitCloutPrice,
  clearElementsWithDash,
  addHtmlUserExternalLinks
}
