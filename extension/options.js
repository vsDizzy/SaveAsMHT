const patchSubjectCheckbox = document.getElementById('patchSubject');

patchSubjectCheckbox.onchange = () => {
  patchSubjectCheckbox.disabled = true;
  chrome.storage.sync.set({
    patchSubject: patchSubjectCheckbox.checked
  }, () => {
    patchSubjectCheckbox.disabled = false;
  });
};

load();

function load() {
  patchSubjectCheckbox.disabled = true;
  chrome.storage.sync.get({ patchSubject: true }, (options) => {
    patchSubjectCheckbox.checked = options.patchSubject;
    patchSubjectCheckbox.disabled = false;
  });
}

const resetButton = document.getElementById('reset');

resetButton.onclick = () => {
  chrome.storage.sync.clear(load);
};