import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAGES_ROOT } from '../../../../server/src/paths.js';
import { SCREEN_HEADS } from '@/navigation/routes/screen-heads.ts';
import { SCREENS } from '@/navigation/routes/screens.ts';

// As the arcade changes screens in the page it writes the head of the screen on top; each must be
// the head that screen's own page has, so a link shared or a page indexed reads the same either way.
const decode = (text) =>
  text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");

async function headOf(screen) {
  const html = await readFile(path.join(PAGES_ROOT, screen.path, 'index.html'), 'utf8');
  const find = (pattern) => decode(pattern.exec(html)?.[1] ?? '');

  return {
    title: find(/<title>([^<]*)<\/title>/),
    description: find(/<meta\s+name="description"\s+content="([^"]*)"/),
    canonical: find(/<link rel="canonical" href="([^"]*)"/),
  };
}

describe.each(SCREENS.map((screen) => [screen.id, screen]))('the %s screen', (id, screen) => {
  it('writes the head its own page has', async () => {
    expect(SCREEN_HEADS[id]).toEqual(await headOf(screen));
  });
});
