import getCaretCoordinates from 'textarea-caret'

import { calcAndFormatPortfolioItemPriceInUsd } from './calcs_and_formatters'
import { getStoreMention } from './store'

function addHtmlDropdown() {
  const css = `.mentionDropdownItem:hover {
    background-color: #E6F0FF; cursor: pointer;
  }`

  const style = document.createElement('style')

  if (style.styleSheet) {
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }

  document.getElementsByTagName('head')[0].appendChild(style)

  const textarea = document.querySelector('textarea.feed-create-post__textarea')
  const wrapper = textarea.parentElement
  const dropdown = document.createElement('div')
  dropdown.classList.add('mentionDropdown')
  dropdown.style.width = '260px'
  dropdown.style.padding = '10px 0'
  dropdown.style.backgroundColor = 'white'
  dropdown.style.boxShadow = '0 0 5px rgba(0,0,0,0.15)'
  dropdown.style.borderRadius = '10px'
  dropdown.style.display = 'none'
  dropdown.style.position = 'absolute'
  dropdown.style.top = '-10000px'
  dropdown.style.left = '-10000px'
  dropdown.style.zIndex = '999999999999999'
  wrapper.style.position = 'relative'
  wrapper.appendChild(dropdown)
}

function hideHtmlDropdown() {
  const dropdown = document.getElementsByClassName('mentionDropdown')[0]
  dropdown.innerHTML = ''
  dropdown.style.display = 'none'
  dropdown.style.top = '-10000px'
  dropdown.style.left = '-10000px'
}

function updateHtmlDropdown() {
  const data = getStoreMention().data
  const textarea = document.querySelector('textarea.feed-create-post__textarea')
  const caret = getCaretCoordinates(textarea, textarea.selectionEnd)
  const dropdown = document.getElementsByClassName('mentionDropdown')[0]
  dropdown.innerHTML = ''
  dropdown.style.display = 'block'
  dropdown.style.top = `${caret.top + caret.height + 11}px`
  dropdown.style.left = `${caret.left - 11}px`

  data['ProfilesFound'].forEach((profile, i) => {
    let userpic = document.createElement('div')
    userpic.style.width = '28px'
    userpic.style.height = '28px'
    userpic.style.marginRight = '15px'
    userpic.style.backgroundImage = `url(${profile['ProfilePic']})`
    userpic.style.backgroundPosition = 'center'
    userpic.style.backgroundSize = 'cover'
    userpic.style.borderRadius = '3px'

    let userDataWrapper = document.createElement('div')

    let username = document.createElement('div')
    username.innerText = profile['Username']
    username.style.lineHeight = '1.5'
    username.style.fontWeight = '400'
    username.style.fontSize = '15px'
    username.style.color = '#222'

    let usercoin = document.createElement('div')
    usercoin.innerText = calcAndFormatPortfolioItemPriceInUsd(
      profile['CoinPriceBitCloutNanos']
    )
    usercoin.style.lineHeight = '1.5'
    usercoin.style.fontWeight = '400'
    usercoin.style.fontSize = '12px'
    usercoin.style.color = '#8a8a8a'

    userDataWrapper.appendChild(username)
    userDataWrapper.appendChild(usercoin)

    let listItem = document.createElement('div')
    listItem.classList.add('mentionDropdownItem')
    listItem.style.width = '260px'
    listItem.style.height = '60px'
    listItem.style.padding = '0 20px'
    listItem.style.boxSizing = 'border-box'
    listItem.style.display = 'flex'
    listItem.style.setProperty('align-items', 'center')

    if (i != 0) {
      listItem.style.borderTop = '1px solid lightgrey'
    }

    listItem.appendChild(userpic)
    listItem.appendChild(userDataWrapper)

    dropdown.appendChild(listItem)

    // profile['IsHidden']
    // profile['IsReserved']
    // profile['IsVerified']
  })
}

export { addHtmlDropdown, hideHtmlDropdown, updateHtmlDropdown }
