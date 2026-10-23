import { afterEach, describe, expect, it } from 'vitest';
import { versionedSite, versionIn } from '../support/module-site.js';

const SITE = {
  'index.html': '<script type="module" src="src/main.js"></script>',
  'src/main.js':
    "import { a } from './a.js';\nimport { x } from './x.js';\nimport { b } from './b.js';\n",
  'src/a.js': "import { leaf } from './deep/leaf.js';\nexport const a = leaf;\n",
  'src/deep/leaf.js': 'export const leaf = 1;\n',
  'src/b.js': 'export const b = 2;\n',
  'src/x.js': "import { y } from './y.js';\nexport const x = 3;\n",
  'src/y.js': "import { x } from './x.js';\nexport const y = x;\n",
};

let sites = [];
const build = async (files) => {
  const site = await versionedSite(files);
  sites.push(site);
  return site;
};

afterEach(async () => {
  await Promise.all(sites.map((site) => site.remove()));
  sites = [];
});

async function versionsOf(site) {
  const main = await site.read('src/main.js');
  return {
    main: versionIn(await site.read('index.html'), 'src/main.js'),
    a: versionIn(main, './a.js'),
    b: versionIn(main, './b.js'),
    x: versionIn(main, './x.js'),
    y: versionIn(await site.read('src/x.js'), './y.js'),
    leaf: versionIn(await site.read('src/a.js'), './deep/leaf.js'),
  };
}

describe('versioned module URLs in the built site', () => {
  it('versions every import and the page script, the same for every importer of a module', async () => {
    const versions = await versionsOf(await build(SITE));
    for (const version of Object.values(versions)) {
      expect(version).toMatch(/^[0-9a-f]{10}$/);
    }
    expect(versions.x).toBe(versions.y);
  });

  it('builds the same versions from the same files', async () => {
    expect(await versionsOf(await build(SITE))).toEqual(await versionsOf(await build(SITE)));
  });

  it('gives a changed module and everything above it new URLs, and the rest their old ones', async () => {
    const before = await versionsOf(await build(SITE));
    const after = await versionsOf(
      await build({ ...SITE, 'src/deep/leaf.js': 'export const leaf = 10;\n' }),
    );
    expect(after.leaf).not.toBe(before.leaf);
    expect(after.a).not.toBe(before.a);
    expect(after.main).not.toBe(before.main);
    expect(after.b).toBe(before.b);
    expect(after.x).toBe(before.x);
  });
});
