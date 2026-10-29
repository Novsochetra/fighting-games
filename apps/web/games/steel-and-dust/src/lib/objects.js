// Object.hasOwn came in Chrome 93 and Safari 15.4, and phones that never updated past those still
// play the game (test/regression/bugs/older-phone-built-ins.test.js)
export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
