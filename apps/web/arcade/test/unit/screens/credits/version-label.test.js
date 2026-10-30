import { describe, expect, it } from 'vitest';
import { versionLabel } from '@/screens/credits/version-label.js';

describe('versionLabel', () => {
  it('names the release, then the build in brackets', () => {
    expect(versionLabel('1.0.0+5f272d9')).toBe('1.0.0 (5f272d9)');
  });

  it('keeps a pre-release with its release', () => {
    expect(versionLabel('1.1.0-beta.2+5f272d9')).toBe('1.1.0-beta.2 (5f272d9)');
  });

  it('names a build of the time it was made as it names a commit', () => {
    expect(versionLabel('1.0.0+20261026094107')).toBe('1.0.0 (20261026094107)');
  });

  it('is the version alone where it names no build', () => {
    expect(versionLabel('1.0.0')).toBe('1.0.0');
  });
});
