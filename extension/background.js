chrome.runtime.onStartup.addListener(install);
chrome.runtime.onInstalled.addListener(install);

function install() {
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == 'save') {
      chrome.pageCapture.saveAsMHTML({ tabId: tab.id }, function(blob) {
        var filename = sanitize(tab.title) + '.MHT';
        download(blob, filename);
      });
    }
  });

  chrome.contextMenus.create({
    contexts: ['all'],
    id: 'save',
    title: 'Save As .MHT...'
  });
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