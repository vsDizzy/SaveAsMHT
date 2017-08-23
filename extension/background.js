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

function save(tab) {
  chrome.storage.sync.get({ patchSubject: true }, (options) => {
    chrome.pageCapture.saveAsMHTML({ tabId: tab.id }, async (blob) => {
      if (options.patchSubject) {
        var mht = await readBlobAsync(blob);
        mht = mht.replace(/(Subject: )(.*)/, `$1${tab.title}`);
        saveInternal(new Blob([mht]));
      } else {
        saveInternal(blob);
      }
    });
  });

  function saveInternal(blob) {
    const filename = `${sanitize(tab.title)}.MHT`;
    console.info(`Saving page as: ${filename}`);

    download(blob, filename);
  }

  function sanitize(filename) {
    return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
  }

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
}