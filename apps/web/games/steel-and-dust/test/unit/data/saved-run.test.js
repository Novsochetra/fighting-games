import { describe, expect, it } from 'vitest';
import { sanitizeSavedRun } from '../../../src/data/saved-run.js';

const RUN = { mission: 4, score: 6200, playTime: 14400, continues: 1, lives: 3, ultMeter: 42.5 };

describe('a saved run', () => {
  it('loads as it was saved', () => {
    expect(sanitizeSavedRun(RUN)).toEqual(RUN);
    expect(sanitizeSavedRun({ ...RUN, mission: 11, lives: 5, ultMeter: 200 })).toMatchObject({
      mission: 11,
    });
  });

  it('keeps only what a run carries', () => {
    expect(sanitizeSavedRun({ ...RUN, hero: 'blue' })).toEqual(RUN);
  });

  it('loads as no run at all when it is missing or broken', () => {
    expect(sanitizeSavedRun(null)).toBeNull();
    expect(sanitizeSavedRun('mission 5')).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, mission: 12 })).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, mission: 1.5 })).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, lives: 0 })).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, lives: 6 })).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, score: -1 })).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, playTime: '9' })).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, ultMeter: 201 })).toBeNull();
    expect(sanitizeSavedRun({ ...RUN, continues: undefined })).toBeNull();
  });
});
