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

export {
  addHtmlProfileBitCloutPulseLink,
  addHtmlProfileFounderRewardPercentage
}
