import normalizeString from "./normalizeString.js";
import posixCwd from "./posixCwd.js";

function isPosixPathSeparator(code: number) {
  return code === "/".charCodeAt(0);
}

function resolve(...args: string[]): string {
  let resolvedPath = "";
  let resolvedAbsolute = false;

  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : posixCwd();
    // validateString(path, `paths[${i}]`);
    if (typeof path !== "string") {
      throw new TypeError(`${path} is not a string`);
    }

    // Skip empty entries
    if (path.length === 0) {
      continue;
    }

    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path.charCodeAt(0) === "/".charCodeAt(0);
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeString(
    resolvedPath,
    !resolvedAbsolute,
    "/",
    isPosixPathSeparator
  );

  if (resolvedAbsolute) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
}

export = resolve;
