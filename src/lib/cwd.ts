import fileURLToPath from "./fileURLToPath.js";
import isWindows from "./isWindows.js";

export = function cwd() {
  if (location.protocol === "file:") {
    return fileURLToPath(location.href);
  } else if (isWindows.get()) {
    return fileURLToPath("file://" + location.hostname + location.pathname);
  } else {
    return fileURLToPath("file://" + location.pathname);
  }
};
