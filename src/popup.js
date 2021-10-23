import './popup.scss'
import { getUsersUrl, profilePicEndpoint } from './urls'

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

    chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
      if (!userListToWatch) {
        chrome.storage.sync.get('creatorList', ({ creatorList }) => {
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

        chrome.storage.sync.get((items) => {
          // console.log(items)

          Object.keys(items).forEach((key, i) => {
            if (key === 'userListToWatch') {
              chrome.storage.sync.set({
                userListToWatch: [...new Set(items[key])]
              })
            } else {
              chrome.storage.sync.remove(`${key}`)
            }
          })

          resolve()
        })
      }
    })
  })
}

function checkAndFetchData() {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
      getApiUsersData(userListToWatch).then((data) => resolve(data))
    })
  })
}

function getApiUsersData(publicKeys) {
  return new Promise(function (resolve, reject) {
    const data = {
      PublicKeysBase58Check: publicKeys
    }

    fetch(getUsersUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('DEV Success getUsers:', data)
        }

        resolve(data)
      })
      .catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('DEV Error:', error)
        }
      })
  })
}

function getStorageUserListToWatch() {
  chrome.storage.sync.get('userListToWatch', ({ userListToWatch }) => {
    return userListToWatch
  })
}

function formatDataUserListToWatch(data) {
  return new Promise((resolve, reject) => {
    if (data['UserList']) {
      resolve(data['UserList'])
    } else {
      resolve()
    }
  })
}

function renderHtmlUserListToWatch(users) {
  console.log('users', users)
  users.forEach((user, i) => {
    renderHtmlUser(user)
  })
}

function renderHtmlUser(user) {
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
  userPicElement.style.backgroundImage = `url("${profilePicEndpoint}${user.PublicKeyBase58Check}?fallback=https://bitclout.com/assets/img/default_profile_pic.png")`
  userNameElement.innerText = user['ProfileEntryResponse']['Username']
  userRemoveButton.innerText = 'Remove'

  userRemoveButton.addEventListener('click', (e) => {
    userListToWatchRemoveItem(user)
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
    console.log('userListToWatch', userListToWatch, userData)
    userListToWatch.remove(userData.PublicKeyBase58Check)
    chrome.storage.sync.set({ userListToWatch })
  })
}

checkAndMigrateData()
  .then(checkAndFetchData)
  .then((data) => formatDataUserListToWatch(data))
  .then((users) => renderHtmlUserListToWatch(users))
  .then(showHtmlFirstTab)
