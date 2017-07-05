chrome.contextMenus.create({
  contexts: ['all'],
  id: 'save',
  title: 'Save As .MHT...'
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == 'save') {
    save(tab);
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  save(tab);
});

async function save(tab) {
  chrome.storage.sync.get({ patch: false }, (options) => {
    chrome.pageCapture.saveAsMHTML({ tabId: tab.id }, (blob) => {
      if (options.patch) {
        readBlobAsync(blob).then(mht => {
          mht = mht.replace(/(?:Subject: )(.*)/, `Subject: ${tab.title}`);
          saveInternal(new Blob([mht]));
        });
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
      fr.onerror = function () {
        reject(this.error)
      };
      fr.onload = function () {
        resolve(this.result)
      };
      fr.readAsText(blob);
    });
  }
}