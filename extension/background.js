promisifyAll(chrome.pageCapture, chrome.storage.sync);

chrome.browserAction.onClicked.addListener((tab) => {
  save(tab);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['all'],
    id: 'save',
    title: 'Save As .MHT...'
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
    mht = mht.replace(/(Subject: )(.*)/, `$1${tab.title}`);
    blob = new Blob([mht]);
  }

  const filename = `${sanitize(tab.title)}.MHT`;
  console.info(`Saving page as: ${filename}`);

  download(blob, filename);

  function download(blob, filename) {
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