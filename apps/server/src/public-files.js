const HIDDEN_NAMES = new Set(['test', 'node_modules', 'package.json', 'package-lock.json']);

// Lower-cased because macOS and Windows file systems ignore case, so /TEST/ would reach test/.
export function isHiddenName(name) {
  return name.startsWith('.') || HIDDEN_NAMES.has(name.toLowerCase());
}
