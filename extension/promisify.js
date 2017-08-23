function promisify(fn) {
  return (...args) => {
    if (!args.length || args[args.length - 1]) {
      return fn.apply(this, args);
    } else {
      return new Promise((resolve, reject) => {
        const callback = (...args) => {
          const error = chrome.runtime.lastError;
          return error ? reject(error) : resolve.apply(this, args);
        };

        args[args.length - 1] = callback;
        fn.apply(this, args);
      });
    }
  };
}

function promisifyAll(...args) {
  for (let target of args) {
    for (let key in target) {
      let val = target[key];
      if (typeof val === 'function') {
        target[key] = this.promisify(val);
      }
    }
  }
}