function toPromise(fn, ...args) {
  return new Promise(function(resolve, reject) {
    args.push(function() {
      const error = chrome.runtime.lastError;
      error ? reject.call(this, error) : resolve.apply(this, arguments);
    });
    fn.apply(this, args);
  });
}
