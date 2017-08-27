promisifyAll(chrome.pageCapture, chrome.storage.sync, chrome.tabs);

chrome.browserAction.onClicked.addListener((tab) => {
  save(tab);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['all'],
    id: 'save',
    title: 'Save as .mht...'
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == 'save') {
    save(tab);
  }
});

async function save(tab) {
  let blob = await chrome.pageCapture.saveAsMHTML({ tabId: tab.id }, null);

  const options = await chrome.storage.sync.get({ patchSubject: true }, null);
  if (options.patchSubject) {
    let mht = await readBlobAsync(blob);
    mht = mht.replace(/^(Subject: )(.*)$/m, `$1${tab.title}`);
    blob = new Blob([mht]);
  }

  const filename = `${sanitize(tab.title)}.mht`;
  console.info(`Saving page as: ${filename}`);

  download(filename, blob);

  function download(filename, blob) {
    chrome.downloads.download({
      conflictAction: 'prompt',
      filename: filename,
      saveAs: true,
      url: URL.createObjectURL(blob)
    });
  }

  function readBlobAsync(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => {
        reject(fr.error)
      };
      fr.onload = () => {
        resolve(fr.result)
      };
      fr.readAsText(blob);
    });
  }

  function sanitize(filename) {
    return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
  }
}

run();

async function run() {
  function setPopup(tab) {
    if (/file:\/\/\//.test(tab.url)) {
      chrome.browserAction.setPopup({ tabId: tab.id, popup: 'info.html' });
      chrome.browserAction.setBadgeText({ tabId: tab.id, text: 'info' });
    }
  }

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status == 'loading') {
      setPopup(tab);
    }
  });

  const tabs = await chrome.tabs.query({}, null);
  for (const tab of tabs) {
    setPopup(tab);
  }
}