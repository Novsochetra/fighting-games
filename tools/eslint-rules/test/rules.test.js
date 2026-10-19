import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import { noBannerComments } from '../rules/no-banner-comments.js';
import { noJsdocBlocks } from '../rules/no-jsdoc-blocks.js';
import { noRawHex } from '../rules/no-raw-hex.js';

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
