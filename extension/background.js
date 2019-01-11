chrome.browserAction.onClicked.addListener(function(tab) {
  save(tab);
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    contexts: ['all'],
    id: 'save',
    title: 'Save as .mht...'
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == 'save') {
    save(tab);
  }
});

async function save(tab) {
  const filename = `${sanitize(tab.title)}.mht`;
  let blob = await toPromise(chrome.pageCapture.saveAsMHTML, { tabId: tab.id });
  download(filename, await patchSubject(blob));

  function sanitize(filename) {
    return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
  }

  function download(filename, blob) {
    chrome.downloads.download({
      conflictAction: 'prompt',
      filename: filename,
      saveAs: true,
      url: URL.createObjectURL(blob)
    });
  }

  async function patchSubject(blob) {
    let mht = await readBlobAsync(blob);
    mht = mht.replace(/^(Subject: )(.*)$/m, `$1${tab.title}`);
    return new Blob([mht]);
  }

  function readBlobAsync(blob) {
    return new Promise(function(resolve, reject) {
      const fr = new FileReader();
      fr.onerror = function() {
        reject(fr.error);
      };
      fr.onload = function() {
        resolve(fr.result);
      };
      fr.readAsText(blob);
    });
  }
}

run();

async function run() {
  async function setPopup(tab) {
    if (/^file:\/\/\/.*\.mht(ml)?$/i.test(tab.url)) {
      chrome.browserAction.setBadgeText({ tabId: tab.id, text: 'info' });

      const fileEnabled = await toPromise(chrome.permissions.contains, {
        origins: ['file:///*']
      });
      chrome.browserAction.setPopup({
        tabId: tab.id,
        popup: fileEnabled ? 'info.html' : 'filePermission.html'
      });
    }
  }

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'loading') {
      setPopup(tab);
    }
  });

  const tabs = await toPromise(chrome.tabs.query, {});
  for (const tab of tabs) {
    setPopup(tab);
  }
}
