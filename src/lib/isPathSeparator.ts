export = function isPathSeparator(code: number) {
  return code === "/".charCodeAt(0) || code === "\\".charCodeAt(0);
};
