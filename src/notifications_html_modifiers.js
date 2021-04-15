function addStupidFixForNotificationsFeed() {
  const wrapper = document.getElementsByClassName('global__center__inner')[0]
  let div = document.createElement('div')
  div.style.padding = '40px 0'
  div.style.fontSize = '14px'
  div.style.textAlign = 'center'
  div.innerHTML = `This white space brought to you by <a href='https://bitclout.com/u/superwallet'>@SuperWallet</a> to fix<br> notifications autoload, read <a href='https://bitclout.com/posts/fb80ee112e81c8e4005b8a8fab5899c9b9d6210e7fbd753bf3cf7741afe6b9c0'>this post</a> to know more`
  wrapper.appendChild(div)
}

export { addStupidFixForNotificationsFeed }
