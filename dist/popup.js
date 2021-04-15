let creatorList = []
let trackCreatorsButton = document.getElementById('trackCreatorsButton')
let creatorListTextarea = document.getElementById('creatorListTextarea')

chrome.storage.sync.get('creatorList', ({ creatorList }) => {
  creatorListTextarea.value = creatorList.join('\n')
})

trackCreatorsButton.addEventListener('click', async () => {
  let txtArray = creatorListTextarea.value.split('\n')

  for (var i = 0; i < txtArray.length; i++) {
    creatorList.push(txtArray[i])
  }

  chrome.storage.sync.set({ creatorList })

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: pageReload
  })
})

function trackCreatorsInjected() {
  chrome.storage.sync.get('creatorList', ({ creatorList }) => {
    trackCreators(creatorList)
  })
}

function pageReload() {
  location.reload()
}
