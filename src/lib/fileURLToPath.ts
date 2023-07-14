import domainToUnicode from "./domainToUnicode.js";
import isWindows from "./isWindows.js";

function getPathFromURLWin32(url: URL): string {
  const hostname = url.hostname;
  let pathname = url.pathname;
  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === "%") {
      const third = pathname.codePointAt(n + 2)! | 0x20;
      if (
        (pathname[n + 1] === "2" && third === 102) || // 2f 2F /
        (pathname[n + 1] === "5" && third === 99)
      ) {
        // 5c 5C \
        throw new URIError(
          `${url} must not include encoded '\\' or '/' characters`
        );
      }
    }
  }
  pathname = pathname.replace(/\//g, "\\");
  pathname = decodeURIComponent(pathname);
  if (hostname !== "") {
    // If hostname is set, then we have a UNC path
    // Pass the hostname through domainToUnicode just in case
    // it is an IDN using punycode encoding. We do not need to worry
    // about percent encoding because the URL parser will have
    // already taken care of that for us. Note that this only
    // causes IDNs with an appropriate `xn--` prefix to be decoded.
    return `\\\\${domainToUnicode(hostname)}${pathname}`;
  }
  // Otherwise, it's a local path that requires a drive letter
  const letter = pathname.codePointAt(1)! | 0x20;
  const sep = pathname.charAt(2);
  if (
    letter < "a".codePointAt(0)! ||
    letter > "z".codePointAt(0)! || // a..z A..Z
    sep !== ":"
  ) {
    throw new URIError(`${url} must be absolute`);
  }
  return pathname.slice(1);
}

function getPathFromURLPosix(url: URL): string {
  if (url.hostname !== "") {
    throw new URIError(`${url} must not have a hostname`);
  }
  const pathname = url.pathname;
  for (let n = 0; n < pathname.length; n++) {
    if (pathname[n] === "%") {
      const third = pathname.codePointAt(n + 2)! | 0x20;
      if (pathname[n + 1] === "2" && third === 102) {
        throw new URIError(`${url} must not include encoded '/' characters`);
      }
    }
  }
  return decodeURIComponent(pathname);
}

function fileURLToPath(path: URL | string): string {
  if (typeof path === "string") {
    path = new URL(path);
  } else if (!path?.href) {
    throw new TypeError(`${path} must be a string or URL`);
  }
  if (path.protocol !== "file:") {
    throw new URIError(`${path} is not a 'file:' URL`);
  }
  return isWindows.get() ? getPathFromURLWin32(path) : getPathFromURLPosix(path);
}

export = fileURLToPath;
