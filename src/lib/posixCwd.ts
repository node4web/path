import cwd from "./cwd.js";
import isWindows from "./isWindows.js";

let posixCwd: () => string;
if (isWindows.get()) {
  // Converts Windows' backslash path separators to POSIX forward slashes
  // and truncates any drive indicator
  posixCwd = () => {
    const path = cwd().replace(/\\/g, "/");
    return path.slice(path.indexOf("/"));
  };
} else {
  // We're already on POSIX, no need for any transformations
  posixCwd = () => cwd();
}

export = posixCwd;
