chrome.action.onClicked.addListener(function (tab) {
  saveTab(tab)
})

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'save-mht',
    title: 'Save as .mht...',
    contexts: ['all'],
  })
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId == 'save-mht') {
    saveTab(tab)
  }
})

async function saveTab(tab: chrome.tabs.Tab) {
  chrome.downloads.download({
    conflictAction: 'prompt',
    filename: `${sanitizeFilename(tab.title)}.mht`,
    saveAs: true,
    url: await captureTabToDataUrl(tab.id),
  })
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[<>:"/\\|?*\x00-\x1F~]/g, '_')
}

async function captureTabToDataUrl(tabId: number) {
  const tabText = await new Promise<string>(function (resolve, reject) {
    chrome.pageCapture.saveAsMHTML({ tabId }, function (mhtmlData) {
      return mhtmlData
        ? resolve(mhtmlData.text())
        : reject(new Error(chrome.runtime.lastError.message))
    })
  })

  return `data:multipart/related;base64,${btoa(tabText)}`
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status != 'loading') {
    return
  }

  setPopup(tabId, tab.url)
})

chrome.tabs.query({}).then(function (tabs) {
  tabs.forEach(function (tab) {
    setPopup(tab.id, tab.url)
  })
})

async function setPopup(tabId: number, url: string) {
  if (!/^file:\/\/\/.*\.mht(ml)?$/i.test(url)) {
    return
  }

  const { text, popup }: { text: string; popup: string } =
    (await chrome.permissions.contains({ origins: ['file:///*'] }))
      ? { text: '🛈', popup: 'mht-info.html' }
      : { text: '⚠', popup: 'file-permission.html' }
  chrome.action.setBadgeText({ tabId, text })
  chrome.action.setPopup({ tabId, popup })
}
