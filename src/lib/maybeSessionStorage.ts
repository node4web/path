let maybeSessionStorage: Storage | undefined;
try {
  maybeSessionStorage = sessionStorage;
} catch {}
export = maybeSessionStorage;
