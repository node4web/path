let cache: boolean;
const isWindows = {
  // @ts-ignore
  get: () => (cache ??= navigator.userAgentData?.platform === "Windows"),
};
export = isWindows;
