import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARCADE_SRC } from '../../../../../server/src/paths.js';

const STYLES = path.join(ARCADE_SRC, 'styles');
const read = (file) => readFile(path.join(STYLES, file), 'utf8');

describe('the arcade’s font', () => {
  it('ships with the arcade, its licence beside it', async () => {
    const css = await read('fonts.css');
    const files = [...css.matchAll(/url\('([^']+)'\)/g)].map(([, url]) => url);

    expect(files).not.toEqual([]);

    for (const file of [...files, './fonts/OFL.txt']) {
      await expect(stat(path.join(STYLES, file))).resolves.toBeTruthy();
    }
  });

  it('is the one the screens set, loaded before every screen', async () => {
    const [, family] = /--font-system:\s*'([^']+)'/.exec(await read('tokens.css'));

    expect(await read('fonts.css')).toContain(`font-family: '${family}';`);
    expect(await read('global-styles.ts')).toContain(`import './fonts.css';`);
  });
});
