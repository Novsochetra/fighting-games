import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import { blankLines } from '../../rules/blank-lines.js';
import { noBannerComments } from '../../rules/no-banner-comments.js';
import { noJsdocBlocks } from '../../rules/no-jsdoc-blocks.js';
import { noRawHex } from '../../rules/no-raw-hex.js';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({ languageOptions: { ecmaVersion: 'latest', sourceType: 'module' } });

tester.run('no-jsdoc-blocks', noJsdocBlocks, {
  valid: [
    '// iPhone ignores user-scalable=no, so block the gesture here\nconst a = 1;',
    '/* eslint-disable no-console */\nconsole.log(1);',
    '/* global window */\nwindow.x = 1;',
  ],
  invalid: [
    {
      code: '/** Adds two numbers. */\nfunction add(a, b) { return a + b; }',
      errors: [{ messageId: 'noBlock' }],
    },
    { code: '/* the player */\nconst player = {};', errors: [{ messageId: 'noBlock' }] },
  ],
});

tester.run('no-banner-comments', noBannerComments, {
  valid: ['// raiders wait their turn so the screen never floods\nconst tokens = 2;'],
  invalid: [
    { code: '// ---------- menus ----------\nconst m = 1;', errors: [{ messageId: 'noBanner' }] },
    { code: '// ====\nconst m = 1;', errors: [{ messageId: 'noBanner' }] },
  ],
});

tester.run('no-raw-hex', noRawHex, {
  valid: ['const color = palette.gold;', "const id = '#menu';", "const anchor = 'page#top';"],
  invalid: [
    { code: "const c = '#ffd36b';", errors: [{ messageId: 'noHex' }] },
    { code: "const c = '#FFF';", errors: [{ messageId: 'noHex' }] },
    { code: 'const c = `border: 1px solid #140f1a`;', errors: [{ messageId: 'noHex' }] },
  ],
});

tester.run('blank-lines', blankLines, {
  valid: [
    'function only() {\n  return 1;\n}',
    'function steps(pad) {\n  if (!pad) {\n    return;\n  }\n\n  const x = pad.x;\n\n  return x;\n}',
    'function last(items) {\n  for (const item of items) {\n    use(item);\n  }\n}',
    'function early(pad) {\n  if (pad) {\n    move(pad);\n    return true;\n  }\n\n  return false;\n}',
    'const keys = {\n  up: () => move(-1),\n  down: () => move(1),\n};',
    'const api = {\n  list() {\n    return [];\n  },\n\n  add(item) {\n    store(item);\n  },\n};',
    'if (ready) {\n  go();\n} // the pad wakes late\n\nstart();',
  ],
  invalid: [
    {
      code: 'if (ready) {\n  go();\n}\nstart();',
      output: 'if (ready) {\n  go();\n}\n\nstart();',
      errors: [{ messageId: 'afterBlock' }],
    },
    {
      code: 'function sum(a, b) {\n  const total = a + b;\n  return total;\n}',
      output: 'function sum(a, b) {\n  const total = a + b;\n\n  return total;\n}',
      errors: [{ messageId: 'beforeReturn' }],
    },
    {
      code: 'const api = {\n  list() {\n    return [];\n  },\n  add() {},\n};',
      output: 'const api = {\n  list() {\n    return [];\n  },\n\n  add() {},\n};',
      errors: [{ messageId: 'betweenMethods' }],
    },
    {
      code: 'class Pad {\n  start() {\n    go();\n  }\n  stop() {}\n}',
      output: 'class Pad {\n  start() {\n    go();\n  }\n\n  stop() {}\n}',
      errors: [{ messageId: 'betweenMethods' }],
    },
    {
      code: 'if (ready) {\n  go();\n} // the pad wakes late\nstart();',
      output: 'if (ready) {\n  go();\n} // the pad wakes late\n\nstart();',
      errors: [{ messageId: 'afterBlock' }],
    },
  ],
});
