// A key becomes a CloudFront address as it is, so it holds only characters a URL sends unescaped, and
// no part of it starts with a dot: no "..", no hidden files.
const FILE_KEY = /^(?:[A-Za-z0-9][\w.-]*\/)*[A-Za-z0-9][\w.-]*$/;
const MAX_KEY_LENGTH = 300;

export function isFileKey(key) {
  return typeof key === 'string' && key.length <= MAX_KEY_LENGTH && FILE_KEY.test(key);
}
