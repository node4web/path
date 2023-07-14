import { toUnicode } from "./punycode.js";

export = function domainToUnicode(input: string): string {
  return toUnicode(input);
};
