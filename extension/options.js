promisifyAll(chrome.storage.sync);

const patchSubjectCheckbox = document.getElementById('patchSubject');

patchSubjectCheckbox.onchange = async () => {
  try {
    patchSubjectCheckbox.disabled = true;

    await chrome.storage.sync.set({
      patchSubject: patchSubjectCheckbox.checked
    }, null);
  }
  finally {
    patchSubjectCheckbox.disabled = false;
  }
};

load();

async function load() {
  try {
    patchSubjectCheckbox.disabled = true;

    const options = await chrome.storage.sync.get({ patchSubject: true }, null);
    patchSubjectCheckbox.checked = options.patchSubject;
  }
  finally {
    patchSubjectCheckbox.disabled = false;
  }
}

const resetButton = document.getElementById('reset');

resetButton.onclick = () => {
  chrome.storage.sync.clear(load);
};