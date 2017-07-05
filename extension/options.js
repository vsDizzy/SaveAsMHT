const patch = document.getElementById('patch');
patch.onchange = function (event) {
    console.log(patch.parentElement);
    patch.disabled = true;
    chrome.storage.sync.set({
        patch: this.checked
    }, () => {
        patch.disabled = false;
    });
};

chrome.storage.sync.get({ patch: false }, (options) => {
    patch.checked = options.patch;
});