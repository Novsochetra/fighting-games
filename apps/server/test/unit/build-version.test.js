import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildVersion } from '../../src/build-version.js';
import { ARCADE_PACKAGE } from '../../src/paths.js';

const SHA = '06f31ee99c9bdb2ecd440eef32ced21c7bbc0002';
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[0-9A-Za-z.-]+)?$/;
const noGit = () => '';
const release = () => '1.2.3';

describe('buildVersion', () => {
  it('is the release, then the commit Railway deploys after a +, shortened as git shows it', () => {
    const env = { RAILWAY_GIT_COMMIT_SHA: SHA };

    expect(buildVersion({ env, gitHead: () => 'other', release })).toBe('1.2.3+06f31ee');
  });

  it('is the commit checked out where Railway names none', () => {
    expect(buildVersion({ env: {}, gitHead: () => SHA, release })).toBe('1.2.3+06f31ee');
  });

  it('is the time of the build where no commit is known, so every build still has one', () => {
    const now = new Date('2026-10-26T09:41:07.123Z');

    expect(buildVersion({ env: {}, gitHead: noGit, now, release })).toBe('1.2.3+20261026094107');
  });

  it('reads the release from package.json and the commit of this checkout by default', () => {
    const { version } = JSON.parse(readFileSync(ARCADE_PACKAGE, 'utf8'));
    const [built, build] = buildVersion({ env: {} }).split('+');

    expect(built).toBe(version);
    expect(build).toMatch(/^[0-9a-f]{7}$|^\d{14}$/);
  });

  it('names a release in package.json that is SemVer, MAJOR.MINOR.PATCH', () => {
    const { version } = JSON.parse(readFileSync(ARCADE_PACKAGE, 'utf8'));

    expect(version).toMatch(SEMVER);
  });
});
