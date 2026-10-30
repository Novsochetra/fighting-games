// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ARCADE_SRC } from '../../../../../server/src/paths.js';
import { createFakeInstaller, offerInstall, installApp } from '../../support/fake-installer.js';
import { bootWithRealCatalog, byId, click, stopHomes } from '../../support/home-harness.js';

// Bug: on a phone the install banner floated over Play, Details and the heart, since a short screen
// keeps them at its bottom. While the banner is up the root carries has-install-banner, and on a short
// screen install.css lifts the hero's buttons above it.
const isLifted = () => document.documentElement.classList.contains('has-install-banner');

beforeEach(async () => {
  document.body.innerHTML = '';
  document.documentElement.classList.remove('has-install-banner');
});

afterEach(stopHomes);

describe('the hero buttons beside the install banner', () => {
  it('rise while the banner is up and settle once it is gone', async () => {
    const installer = createFakeInstaller();
    await bootWithRealCatalog({ installer });
    expect(isLifted()).toBe(false);
    offerInstall(installer);
    expect(isLifted()).toBe(true);
    click(byId('install-add'));
    expect(isLifted()).toBe(false);

    offerInstall(installer);
    installApp(installer);
    expect(isLifted()).toBe(false);
  });

  it('settle when Not now closes the banner', async () => {
    await bootWithRealCatalog({ installer: createFakeInstaller({ isIos: true }) });
    expect(isLifted()).toBe(true);
    click(byId('install-close'));
    expect(isLifted()).toBe(false);
  });

  it('are lifted by the banner height on a short screen, for every banner in that place', async () => {
    const css = await readFile(
      path.join(ARCADE_SRC, 'screens', 'home', 'banners', 'install.css'),
      'utf8',
    );
    expect(css).toMatch(
      /@media \(max-height: [\d.]+rem\) \{\s*:root\.has-update-banner \.spotlight,\s*:root\.has-install-banner \.spotlight,\s*:root\.has-support-banner \.spotlight,\s*:root\.has-consent-banner \.spotlight \{\s*padding-block-end: calc\([^;]*var\(--size-install-clearance\)/,
    );
  });
});
