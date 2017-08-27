promisifyAll(chrome.tabs);

const dateSpan = document.getElementById('date');
const spanElement = document.getElementById('span');
const urlLink = document.getElementById('url');

const model = {};
Object.defineProperties(model, {
  date: {
    set: (value) => {
      dateSpan.textContent = value;
    }
  },
  span: {
    set: (value) => {
      spanElement.textContent = value;
    }
  },
  urlHref: {
    set: (value) => {
      urlLink.href = value;
      urlLink.title = value;
    }
  },
  urlText: {
    set: (value) => {
      urlLink.textContent = value;
    }
  }
});

run();

async function run() {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true }, null);
  if (!(tabs && tabs.length)) {
    return;
  }
  const tab = tabs[0];
  const text = await load(tab.url);

  model.urlHref = text.match(/^Content-Location: (.*)$/m)[1];
  model.urlText = text.match(/^Subject: (.*)$/m)[1];

  const then = new Date(text.match(/^Date: (.*)$/m)[1]);
  model.date = then.toLocaleString();
  model.span = spanToString(Date.now() - then);

  function load(url) {
    return new Promise((resolve, reject) => {
      const xr = new XMLHttpRequest();
      xr.onerror = () => {
        reject(xr.error);
      };
      xr.onload = () => {
        resolve(xr.responseText);
      };
      xr.open('GET', url);
      xr.setRequestHeader('Range', 'bytes=0-1024');
      xr.send();
    });
  }

  function spanToString(span) {
    const val = [];

    let tmp = Math.floor(span / 1000);
    let k = 60 * 60 * 24;
    const dd = Math.floor(tmp / k);
    if (dd) {
      val.push(`${dd} day(s)`);
    }

    tmp -= dd * k;
    k /= 24;
    const hh = Math.floor(tmp / k);
    if (hh) {
      val.push(`${hh} hour(s)`);
    }

    tmp -= hh * k;
    k /= 60;
    const mm = Math.ceil(tmp / k);
    if (mm) {
      val.push(`${mm} minute(s)`);
    }

    return val.join(', ');
  }
}