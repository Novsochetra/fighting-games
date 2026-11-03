import { describe, expect, it } from 'vitest';
import { newSave } from '../../../src/campaign/save.js';
import { hashText, matchSeedFor, mixSeeds } from '../../../src/campaign/seeds.js';
import { FIXTURE_CHAPTERS, stageAt } from '../../support/campaign-fixtures.js';

const isUint32 = (value) => Number.isInteger(value) && value >= 0 && value < 2 ** 32;

describe('seeds', () => {
  it('hash a text the same each time, and other texts otherwise', () => {
    expect(hashText('asia-cup')).toBe(hashText('asia-cup'));
    expect(hashText('asia-cup')).not.toBe(hashText('asia-cuq'));
    expect(isUint32(hashText('ស្វាគមន៍'))).toBe(true);
  });

  it('mix into one uint32 that changes with any part', () => {
    const mixed = mixSeeds(1, 2, 3);

    expect(isUint32(mixed)).toBe(true);
    expect(mixSeeds(1, 2, 3)).toBe(mixed);
    expect(mixSeeds(1, 2, 4)).not.toBe(mixed);
    expect(mixSeeds(2, 1, 3)).not.toBe(mixed);
  });

  it('give each match its own seed, and a replay another', () => {
    const save = newSave({ seed: 9 });
    const friendly = stageAt(FIXTURE_CHAPTERS, 0, 2);
    const semi = stageAt(FIXTURE_CHAPTERS, 0, 3);

    expect(isUint32(matchSeedFor(save, friendly))).toBe(true);
    expect(matchSeedFor(save, friendly)).not.toBe(matchSeedFor(save, semi));
    expect(matchSeedFor({ ...save, attempts: 1 }, semi)).not.toBe(matchSeedFor(save, semi));
    expect(matchSeedFor({ ...save, seed: 10 }, semi)).not.toBe(matchSeedFor(save, semi));
  });
});
