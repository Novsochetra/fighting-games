import { describe, expect, it } from 'vitest';
import { buildVersion } from '../../src/build-version.js';

const SHA = '06f31ee99c9bdb2ecd440eef32ced21c7bbc0002';
const noGit = () => '';

describe('buildVersion', () => {
  it('is the commit Railway deploys, shortened as git shows it', () => {
    expect(buildVersion({ env: { RAILWAY_GIT_COMMIT_SHA: SHA }, gitHead: () => 'other' })).toBe(
      '06f31ee',
    );
  });

  it('is the commit checked out where Railway names none', () => {
    expect(buildVersion({ env: {}, gitHead: () => SHA })).toBe('06f31ee');
  });

  it('is the time of the build where no commit is known, so every build still has one', () => {
    const now = new Date('2026-10-26T09:41:07.123Z');

    expect(buildVersion({ env: {}, gitHead: noGit, now })).toBe('20261026094107');
  });

  it('reads the commit of this checkout by default', () => {
    expect(buildVersion({ env: {} })).toMatch(/^[0-9a-f]{7}$|^\d{14}$/);
  });
});
