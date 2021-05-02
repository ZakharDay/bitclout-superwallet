import './popup.scss'

Array.prototype.remove = function () {
  // prettier-ignore
  let what, a = arguments, L = a.length, ax
  while (L && this.length) {
    what = a[--L]
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1)
    }
  }
  return this
}

function checkAndMigrateData() {
  return new Promise((resolve, reject) => {
    let newUserListToWatch = []

    // console.log('yo')

    chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
      if (!userListToWatch) {
        // console.log('no')
        chrome.storage.sync.set({
          creatorList: ['zakharday', 'superwallet', 'wallettracker']
        })

        chrome.storage.sync.get('creatorList', ({ creatorList }) => {
          // console.log(creatorList)
          if (creatorList && creatorList[0] != '') {
            // chrome.storage.sync.set({ userListToWatch: creatorList }, () => {
            fetchCreatorsForPopup(creatorList).then(() => {
              chrome.storage.sync.remove('creatorList')
              resolve()
            })
            // })
          }
        })
      } else {
        // console.log('yes')

        // chrome.storage.sync.get((items) => {
        //   Object.keys(items).forEach((key, i) => {
        //     chrome.storage.sync.remove(`${key}`)
        //   })
        //
        //   chrome.storage.sync.set(
        //     {
        //       creatorList: ['zakharday', 'superwallet', 'wallettracker']
        //     },
        //     resolve
        //   )
        // })

        resolve()
      }
    })
  })
}

function checkAndFetchData() {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get((items) => {
      let unknownList = []

      // console.log(items)

      items['userListToWatch'].forEach((publicKey, i) => {
        if (items[publicKey]) {
          // console.log('ok ok')
        } else {
          unknownList.push(publicKey)
        }
      })

      if (unknownList.length > 0) {
        fetchCreatorsForPopup(unknownList).then(() => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  })
}

function fetchCreatorsForPopup(creators) {
  const promises = creators.map((creator, i) => {
    return fetchCreatorForPopup(creator)
  })

  return Promise.all(promises)
}

function fetchCreatorForPopup(creator) {
  return new Promise((resolve, reject) => {
    getApiProfileData(creator)
      .then((data) => formatDataUserListToWatch(data))
      .then((user) => setStorageUserListToWatch(user))
      .then(resolve)
  })
}

function getStorageUserListToWatch() {
  chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
    return userListToWatch
  })
}

function setStorageUserListToWatch(user) {
  return new Promise(function (resolve, reject) {
    // console.log('setStorageUserListToWatch', user)
    if (user) {
      chrome.storage.sync.set({ [user.publicKey]: user })

      chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
        if (userListToWatch) {
          userListToWatch.push(user.publicKey)
        } else {
          userListToWatch = [user.publicKey]
        }

        chrome.storage.sync.set({ userListToWatch }, resolve)
      })
    } else {
      resolve()
    }
  })
}

function formatDataUserListToWatch(data) {
  return new Promise((resolve, reject) => {
    if (data['ProfilesFound'] && data['ProfilesFound'][0]) {
      const profileData = data['ProfilesFound'][0]

      resolve({
        publicKey: profileData['PublicKeyBase58Check'],
        username: profileData['Username'],
        profilePic: profileData['ProfilePic']
      })
    } else {
      resolve()
    }
  })
}

function getApiProfileData(publicKey) {
  return new Promise((resolve, reject) => {
    const superWalletPublicKey =
      'BC1YLgTwjbHjy8rLPWZHX53JMmreo5u3sxX5BvdASugUyUaMZdo51oh'

    const data = {
      AddGlobalFeedBool: false,
      Description: '',
      FetchUsersThatHODL: false,
      ModerationType: '',
      NumToFetch: 1,
      OrderBy: 'newest_last_post',
      UsernamePrefix: ''
    }

    // console.log(publicKey, publicKey.length, publicKey.length < 55)

    if (publicKey.length === 55) {
      data['ReaderPublicKeyBase58Check'] = publicKey
      data['PublicKeyBase58Check'] = publicKey
      data['Username'] = ''
    } else {
      data['ReaderPublicKeyBase58Check'] = superWalletPublicKey
      data['PublicKeyBase58Check'] = ''
      data['Username'] = publicKey
    }

    // console.log('Request', data)

    fetch('https://api.bitclout.com/get-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data)
        if (process.env.NODE_ENV === 'development') {
          console.log('DEV Success:', data, publicKey)
        }
      })
      .catch((error) => {
        // resolve(error)
        if (process.env.NODE_ENV === 'development') {
          console.error('DEV Error:', error, publicKey)
        }

        getApiProfileData(publicKey)
      })
  })
}

function renderHtmlUserListToWatch() {
  let usersData = []

  chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
    // userListToWatch.forEach((publicKey, i) => {
    // })

    chrome.storage.sync.get(userListToWatch, (usersData) => {
      // console.log('usersData', usersData)

      Object.keys(usersData).forEach((key, i) => {
        if (key != 'creatorList' && key != 'userListToWatch') {
          renderHtmlUser(usersData[key])
        }
      })
    })
  })
}

function renderHtmlUser(userData) {
  const container = document.getElementById('userListToWatchContainer')
  const tabItemElement = document.createElement('div')
  const leftWrapperElement = document.createElement('div')
  const userPicElement = document.createElement('div')
  const userNameElement = document.createElement('div')
  const userRemoveButton = document.createElement('div')
  tabItemElement.classList.add('tabItem')
  leftWrapperElement.classList.add('leftWrapper')
  userPicElement.classList.add('userPic')
  userNameElement.classList.add('userName')
  userRemoveButton.classList.add('userRemove')
  userPicElement.style.backgroundImage = `url(${userData.profilePic})`
  userNameElement.innerText = userData.username
  userRemoveButton.innerText = 'Remove'

  userRemoveButton.addEventListener('click', (e) => {
    userListToWatchRemoveItem(userData)
    e.target.parentElement.remove()
  })

  leftWrapperElement.appendChild(userPicElement)
  leftWrapperElement.appendChild(userNameElement)
  tabItemElement.appendChild(leftWrapperElement)
  tabItemElement.appendChild(userRemoveButton)
  container.appendChild(tabItemElement)
}

function showHtmlFirstTab() {
  document.getElementById('preloaderContainer').remove()
  document.getElementById('userListToWatchContainer').classList.add('active')
}

function userListToWatchRemoveItem(userData) {
  chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
    userListToWatch.forEach((publicKey, i) => {
      if (publicKey === userData.publicKey) {
        chrome.storage.sync.remove(publicKey)
      }
    })

    userListToWatch.remove(userData.publicKey)
    chrome.storage.sync.set({ userListToWatch })
  })
}

checkAndMigrateData()
  .then(checkAndFetchData)
  .then(renderHtmlUserListToWatch)
  .then(showHtmlFirstTab)
