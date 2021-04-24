import { calcFounderRewardPercentage } from './calcs_and_formatters'

function addHtmlProfileBitCloutPulseLink(data, element) {
  let bitCloutPulseLink = document.createElement('a')
  bitCloutPulseLink.href = `https://www.bitcloutpulse.com/profiles/${data.publicKey}`
  bitCloutPulseLink.classList.add('bitCloutPulseLink')

  bitCloutPulseLink.style.backgroundColor = '#005bff'
  bitCloutPulseLink.style.borderRadius = '12px'
  bitCloutPulseLink.style.position = 'absolute'
  bitCloutPulseLink.style.top = '96px'
  bitCloutPulseLink.style.left = '110px'
  bitCloutPulseLink.style.width = '24px'
  bitCloutPulseLink.style.height = '24px'
  bitCloutPulseLink.style.lineHeight = '24px'
  bitCloutPulseLink.style.fontSize = '16px'
  bitCloutPulseLink.style.textAlign = 'center'
  bitCloutPulseLink.style.color = 'white'
  bitCloutPulseLink.target = '_blank'
  bitCloutPulseLink.innerText = 'P'

  element.appendChild(bitCloutPulseLink)
}

function addHtmlProfileFounderRewardPercentage(data) {
  let wrapper = document.createElement('div')
  wrapper.style.whitespace = 'nowrap'

  let percent = document.createElement('div')
  percent.classList.add('font-weight-bold')
  percent.style.display = 'inline'
  percent.innerText = calcFounderRewardPercentage(data)

  let label = document.createElement('div')
  label.classList.add('fc-muted')
  label.style.display = 'inline'
  label.innerText = ' Founder Reward'

  wrapper.appendChild(percent)
  wrapper.appendChild(label)

  document
    .querySelector(
      '.global__center__inner .d-flex.flex-column.pl-15px.pr-15px .fs-15px.pt-5px.d-flex.flex-wrap'
    )
    .appendChild(wrapper)
}

function prepareHtmlProfileTabs() {
  const profileWrapper = document.querySelector(
    'creator-profile-details > .flex-grow-1'
  )

  const wrapper = document.querySelector('tab-selector > div.d-flex')
  wrapper.classList.add('profileTabsWrapper')

  const postsTab = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:first-child'
  )

  const postsTabText = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:first-child > div.d-flex:first-child'
  )

  const postsTabLine = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:first-child > div:last-child'
  )

  const coinTab = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(2)'
  )

  const coinTabText = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(2) > div.d-flex:first-child'
  )

  const coinTabLine = document.querySelector(
    'tab-selector > div.d-flex > div.d-flex:nth-child(2) > div:last-child'
  )

  const walletTab = document.createElement('div')
  // prettier-ignore
  walletTab.classList.add('d-flex', 'flex-column', 'align-items-center', 'h-100', 'pl-15px', 'pr-15px')
  const walletTabText = document.createElement('div')
  // prettier-ignore
  walletTabText.classList.add('d-flex', 'h-100', 'align-items-center', 'fs-15px', 'fc-muted')
  walletTabText.innerText = 'Creator Wallet'
  const walletTabLine = document.createElement('div')
  walletTabLine.classList.add('tab-underline-inactive')
  walletTabLine.style.width = '50px'

  postsTab.addEventListener('click', () => {
    const walletTabContainer = document.querySelector('.walletTabContainer')

    if (walletTabContainer) {
      walletTabContainer.remove()
    }

    walletTabText.classList.remove('fc-default')
    walletTabText.classList.add('fc-muted')
    walletTabLine.classList.remove('tab-underline-active')
    walletTabLine.classList.add('tab-underline-inactive')
  })

  coinTab.addEventListener('click', () => {
    const walletTabContainer = document.querySelector('.walletTabContainer')

    if (walletTabContainer) {
      walletTabContainer.remove()
    }

    walletTabText.classList.remove('fc-default')
    walletTabText.classList.add('fc-muted')
    walletTabLine.classList.remove('tab-underline-active')
    walletTabLine.classList.add('tab-underline-inactive')
  })

  walletTab.addEventListener('click', () => {
    const walletTabContainer = document.createElement('div')
    // prettier-ignore
    walletTabContainer.classList.add('w-100', 'd-flex', 'flex-column', 'walletTabContainer')
    walletTabContainer.innerText = 'THIS IS A CONTAINER'

    console.log('click')
    walletTabLine.classList.remove('tab-underline-inactive')
    walletTabLine.classList.add('tab-underline-active')

    postsTabText.classList.remove('fc-default')
    postsTabText.classList.add('fc-muted')
    postsTabLine.classList.remove('tab-underline-active')
    postsTabLine.classList.add('tab-underline-inactive')

    coinTabText.classList.remove('fc-default')
    coinTabText.classList.add('fc-muted')
    coinTabLine.classList.remove('tab-underline-active')
    coinTabLine.classList.add('tab-underline-inactive')

    const postsTabContainer = document.querySelector(
      'creator-profile-details > .flex-grow-1 > div:last-child'
    )
    const coinTabContainer = document.querySelector(
      'creator-profile-details > .flex-grow-1 > div:last-child'
    )

    if (postsTabContainer) {
      // postsTabContainer.style.backgroundColor = 'red'
      postsTabContainer.remove()
    } else if (coinTabContainer) {
      // coinTabContainer.style.backgroundColor = 'red'
      coinTabContainer.remove()
    }

    profileWrapper.appendChild(walletTabContainer)
  })

  walletTab.appendChild(walletTabText)
  walletTab.appendChild(walletTabLine)
  wrapper.appendChild(walletTab)
}

export {
  addHtmlProfileBitCloutPulseLink,
  addHtmlProfileFounderRewardPercentage,
  prepareHtmlProfileTabs
}
