import isWindows from "./lib/isWindows.js";

let resolve: (...args: string[]) => string;
if (isWindows.get()) {
  resolve = require("./lib/resolve-win32.js");
} else {
  resolve = require("./lib/resolve-posix.js");
}
export = resolve;
