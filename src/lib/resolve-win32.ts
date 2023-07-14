import cwd from "./cwd.js";
import isPathSeparator from "./isPathSeparator.js";
import normalizeString from "./normalizeString.js";
import maybeSessionStorage from "./maybeSessionStorage.js";

function isWindowsDeviceRoot(code: number) {
  return (
    (code >= "A".charCodeAt(0) && code <= "Z".charCodeAt(0)) ||
    (code >= "a".charCodeAt(0) && code <= "z".charCodeAt(0))
  );
}

function resolve(...args: string[]): string {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;

  for (let i = args.length - 1; i >= -1; i--) {
    let path;
    if (i >= 0) {
      path = args[i];
      if (typeof path !== "string") {
        throw new TypeError(`${path} is not a string`);
      }

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }
    } else if (resolvedDevice.length === 0) {
      path = cwd();
    } else {
      // Windows has the concept of drive-specific current working
      // directories. If we've resolved a drive letter but not yet an
      // absolute path, get cwd for that drive, or the process cwd if
      // the drive cwd is not available. We're sure the device is not
      // a UNC path at this points, because UNC paths are always absolute.
      path = maybeSessionStorage?.[`=${resolvedDevice}`] || cwd();

      // Verify that a cwd was found and that it actually points
      // to our drive. If not, default to the drive's root.
      if (
        path === undefined ||
        (path.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() &&
          path.charCodeAt(2) === "\\".charCodeAt(0))
      ) {
        path = `${resolvedDevice}\\`;
      }
    }

    const len = path.length;
    let rootEnd = 0;
    let device = "";
    let isAbsolute = false;
    const code = path.charCodeAt(0);

    // Try to match a root
    if (len === 1) {
      if (isPathSeparator(code)) {
        // `path` contains just a path separator
        rootEnd = 1;
        isAbsolute = true;
      }
    } else if (isPathSeparator(code)) {
      // Possible UNC root

      // If we started with a separator, we know we at least have an
      // absolute path of some kind (UNC or otherwise)
      isAbsolute = true;

      if (isPathSeparator(path.charCodeAt(1))) {
        // Matched double path separator at beginning
        let j = 2;
        let last = j;
        // Match 1 or more non-path separators
        while (j < len && !isPathSeparator(path.charCodeAt(j))) {
          j++;
        }
        if (j < len && j !== last) {
          const firstPart = path.slice(last, j);
          // Matched!
          last = j;
          // Match 1 or more path separators
          while (j < len && isPathSeparator(path.charCodeAt(j))) {
            j++;
          }
          if (j < len && j !== last) {
            // Matched!
            last = j;
            // Match 1 or more non-path separators
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j === len || j !== last) {
              // We matched a UNC root
              device = `\\\\${firstPart}\\${path.slice(last, j)}`;
              rootEnd = j;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (
      isWindowsDeviceRoot(code) &&
      path.charCodeAt(1) === ":".charCodeAt(0)
    ) {
      // Possible device root
      device = path.slice(0, 2);
      rootEnd = 2;
      if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
        // Treat separator following drive name as an absolute path
        // indicator
        isAbsolute = true;
        rootEnd = 3;
      }
    }

    if (device.length > 0) {
      if (resolvedDevice.length > 0) {
        if (device.toLowerCase() !== resolvedDevice.toLowerCase())
          // This path points to another device so it is not applicable
          continue;
      } else {
        resolvedDevice = device;
      }
    }

    if (resolvedAbsolute) {
      if (resolvedDevice.length > 0) break;
    } else {
      resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute;
      if (isAbsolute && resolvedDevice.length > 0) {
        break;
      }
    }
  }

  // At this point the path should be resolved to a full absolute path,
  // but handle relative paths to be safe (might happen when process.cwd()
  // fails)

  // Normalize the tail path
  resolvedTail = normalizeString(
    resolvedTail,
    !resolvedAbsolute,
    "\\",
    isPathSeparator
  );

  return resolvedAbsolute
    ? `${resolvedDevice}\\${resolvedTail}`
    : `${resolvedDevice}${resolvedTail}` || ".";
}

export = resolve;
