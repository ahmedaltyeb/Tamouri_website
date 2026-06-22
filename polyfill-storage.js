'use strict';
// Runs before Next.js boots (via node --require).
// --localstorage-file creates a global localStorage whose methods are not
// real functions; this replaces it with a working in-memory implementation
// so Next.js dev-overlay and SSR code no longer crash.
if (
  typeof global.localStorage === 'undefined' ||
  typeof global.localStorage.getItem !== 'function'
) {
  const _s = Object.create(null);
  Object.defineProperty(global, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem:    (k)    => Object.prototype.hasOwnProperty.call(_s, k) ? _s[k] : null,
      setItem:    (k, v) => { _s[String(k)] = String(v); },
      removeItem: (k)    => { delete _s[String(k)]; },
      clear:      ()     => { Object.keys(_s).forEach(k => delete _s[k]); },
      key:        (i)    => { const ks = Object.keys(_s); return ks[i] ?? null; },
      get length()       { return Object.keys(_s).length; },
    },
  });
}

// Same fix for sessionStorage if it is also broken.
if (
  typeof global.sessionStorage === 'undefined' ||
  typeof global.sessionStorage.getItem !== 'function'
) {
  const _ss = Object.create(null);
  Object.defineProperty(global, 'sessionStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem:    (k)    => Object.prototype.hasOwnProperty.call(_ss, k) ? _ss[k] : null,
      setItem:    (k, v) => { _ss[String(k)] = String(v); },
      removeItem: (k)    => { delete _ss[String(k)]; },
      clear:      ()     => { Object.keys(_ss).forEach(k => delete _ss[k]); },
      key:        (i)    => { const ks = Object.keys(_ss); return ks[i] ?? null; },
      get length()       { return Object.keys(_ss).length; },
    },
  });
}
