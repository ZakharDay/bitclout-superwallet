function getHtmlBitCloutPrice() {
  const bitCloutPrice = document
    .querySelector('.right-bar-creators__balance-box .d-flex div:last-child')
    .innerHTML.match(/[^ ]*/i)[0]
    .substring(2)

  return bitCloutPrice
}

function clearElementsWithDash(elements) {
  for (let element of elements) {
    element.innerHTML = '–'
  }
}

export { getHtmlBitCloutPrice, clearElementsWithDash }
