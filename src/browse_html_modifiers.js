import { calcAndFormatPortfolioItemPriceInUsd } from './calcs_and_formatters'

function updateHtmlDropdown(data) {
  const dropdown = document.getElementsByClassName('mentionDropdown')[0]
  // let list = []

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
    // username.classList.add('text-grey9', 'fs-12px', 'd-lg-none')

    let usercoin = document.createElement('div')
    console.log('CoinPriceBitCloutNanos', profile['CoinPriceBitCloutNanos'])
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
    // listItem.style.lineHeight = '60px'
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

  console.log(data)
}

export { updateHtmlDropdown }
