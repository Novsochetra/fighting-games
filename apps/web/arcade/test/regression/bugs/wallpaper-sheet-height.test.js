import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARCADE_SRC } from '../../../../../server/src/paths.js';

// Bug: the wallpaper sheet grew and shrank as Phone and Computer swapped, since the preview was a
// 16:9 box for the computer's cut and a fixed height for the phone's, so the body under it jumped.
// The preview now has one size, and each cut only stands inside it.
const SIZING = /^\s*(block-size|height|min-block-size|max-block-size|aspect-ratio|padding[\w-]*):/m;

const withoutComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const rulesOf = (css) =>
  [...withoutComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector.trim(),
    body,
  }));

async function sheetRules() {
  const file = path.join(ARCADE_SRC, 'screens', 'wallpapers', 'wallpaper-sheet.css');

  return rulesOf(await readFile(file, 'utf8'));
}

describe('the wallpaper sheet as Phone and Computer swap', () => {
  it('gives the preview its size whichever cut it shows', async () => {
    const preview = (await sheetRules()).find((rule) => rule.selector === '.wallpaper-preview');

    expect(preview.body).toMatch(/^\s*(block-size|aspect-ratio):/m);
  });

  it('never sizes the preview by the cut it shows, only the picture inside it', async () => {
    const byShape = (await sheetRules()).filter((rule) =>
      /^\.wallpaper-preview\[data-shape='\w+'\]$/.test(rule.selector),
    );

    expect(byShape.filter((rule) => SIZING.test(rule.body))).toEqual([]);
  });
});
