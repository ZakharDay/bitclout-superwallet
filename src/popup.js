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
    let newUserListToTrack = []

    chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
      if (!userListToWatch) {
        chrome.storage.sync.get('creatorList', ({ creatorList }) => {
          if (creatorList && creatorList[0] != '') {
            chrome.storage.sync.set({ userListToWatch: creatorList }, () => {
              fetchCreatorsForPopup(creatorList).then(() => {
                chrome.storage.sync.remove('creatorList')
                resolve()
              })
            })
          }
        })
      } else {
        //   chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
        //     chrome.storage.sync.remove('userListToWatch')
        //
        //     userListToWatch.forEach((publicKey, i) => {
        //       // let key = user.publicKey
        //       // console.log('key', key)
        //       chrome.storage.sync.remove(publicKey)
        //     })
        //
        //     // return userListToWatch
        //     console.log('from storage', userListToWatch)
        resolve()
        //   })
      }
    })
  })
}

function checkAndFetchData() {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get((items) => {
      let unknownList = []

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
      .then((data) => formatDataUserListToTrack(data))
      .then((user) => setStorageUserListToTrack(user))
      .then(resolve)
  })
}

function getStorageUserListToTrack() {
  chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
    return userListToWatch
  })
}

function setStorageUserListToTrack(user) {
  return new Promise(function (resolve, reject) {
    // console.log('setStorageUserListToTrack', user)
    chrome.storage.sync.set({ [user.publicKey]: user }, resolve)
  })
}

function formatDataUserListToTrack(data) {
  return new Promise((resolve, reject) => {
    const profileData = data['ProfilesFound'][0]

    resolve({
      publicKey: profileData['PublicKeyBase58Check'],
      username: profileData['Username'],
      profilePic: profileData['ProfilePic']
    })
  })
}

function getApiProfileData(publicKey) {
  return new Promise((resolve, reject) => {
    const data = {
      AddGlobalFeedBool: false,
      Description: '',
      FetchUsersThatHODL: true,
      ModerationType: '',
      NumToFetch: 1,
      OrderBy: 'newest_last_post',
      PublicKeyBase58Check: publicKey,
      ReaderPublicKeyBase58Check: publicKey,
      Username: '',
      UsernamePrefix: ''
    }

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
          // console.log('Success:', data, publicKey)
        }
      })
      .catch((error) => {
        // resolve(error)
        if (process.env.NODE_ENV === 'development') {
          console.error('Error:', error, publicKey)
        }

        getApiProfileData(publicKey)
      })
  })
}

function renderHtmlUserListToTrack() {
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
  const container = document.getElementById('userListTrackerContainer')
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
  document.getElementById('userListTrackerContainer').classList.add('active')
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
  .then(renderHtmlUserListToTrack)
  .then(showHtmlFirstTab)
