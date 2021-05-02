import getCaretCoordinates from 'textarea-caret'

import { calcAndFormatPortfolioItemPriceInUsd } from './calcs_and_formatters'
import { getStoreMention } from './store'

function addHtmlDropdown() {
  const textarea = document.querySelector('textarea.feed-create-post__textarea')
  const wrapper = textarea.parentElement
  const dropdown = document.createElement('div')
  dropdown.classList.add('mentionDropdown')
  wrapper.style.position = 'relative'
  wrapper.appendChild(dropdown)
}

function hideHtmlDropdown() {
  const dropdown = document.getElementsByClassName('mentionDropdown')[0]
  dropdown.classList.remove('active')
  dropdown.innerHTML = ''
}

function updateHtmlDropdown() {
  const data = getStoreMention().data
  const textarea = document.querySelector('textarea.feed-create-post__textarea')
  const caret = getCaretCoordinates(textarea, textarea.selectionEnd)
  const dropdown = document.getElementsByClassName('mentionDropdown')[0]
  dropdown.classList.add('active')
  dropdown.innerHTML = ''
  dropdown.style.top = `${caret.top + caret.height + 11}px`
  dropdown.style.left = `${caret.left - 11}px`

  data['ProfilesFound'].forEach((profile, i) => {
    const userpic = document.createElement('div')
    userpic.classList.add('userPic')
    userpic.style.backgroundImage = `url(${profile['ProfilePic']})`

    const userDataWrapper = document.createElement('div')

    const username = document.createElement('div')
    username.classList.add('userName')
    username.innerText = profile['Username']

    const usercoin = document.createElement('div')
    usercoin.classList.add('userCoin')
    usercoin.innerText = calcAndFormatPortfolioItemPriceInUsd(
      profile['CoinPriceBitCloutNanos']
    )

    userDataWrapper.appendChild(username)
    userDataWrapper.appendChild(usercoin)

    let listItem = document.createElement('div')
    listItem.classList.add('mentionDropdownItem')

    listItem.appendChild(userpic)
    listItem.appendChild(userDataWrapper)

    listItem.addEventListener('click', () => {
      const caretPlace = textarea.selectionEnd
      const value = textarea.value
      const textBeforeCaret = value.slice(0, caretPlace)
      const textAfterCaret = value.slice(caretPlace, value.length)
      const atPlace = textBeforeCaret.lastIndexOf('@')
      const textBeforeAt = textBeforeCaret.slice(0, atPlace)
      const newValue = [
        textBeforeAt,
        '@',
        profile['Username'],
        textAfterCaret
      ].join('')

      textarea.value = newValue
      textarea.focus()
      hideHtmlDropdown()
    })

    dropdown.appendChild(listItem)

    // profile['IsHidden']
    // profile['IsReserved']
    // profile['IsVerified']
  })
}

export { addHtmlDropdown, hideHtmlDropdown, updateHtmlDropdown }
