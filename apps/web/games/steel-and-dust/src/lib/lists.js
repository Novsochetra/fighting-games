// .at() and findLast came in Chrome 92 and 97 and in Safari 15.4, and phones that never updated
// past those still play the game (test/regression/bugs/older-phone-built-ins.test.js)
export const lastOf = (list) => list[list.length - 1];

export function findLast(list, matches) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (matches(list[i])) {
      return list[i];
    }
  }

  return undefined;
}
