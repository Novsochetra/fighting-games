import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { clearCall, startCall } from '../../../src/data/mission-handoff.js';
import { MISSIONS } from '../../../src/data/missions/index.js';

const CLIPS = new URL('../../../assets/audio/announcer/', import.meta.url);
const calls = MISSIONS.flatMap((mission) => [startCall(mission.number), clearCall(mission.number)]);

// an MP3 opens on its ID3 tag or straight on a frame's sync bits
const isMp3 = (bytes) =>
  bytes.subarray(0, 3).toString('latin1') === 'ID3' || (bytes[0] === 0xff && bytes[1] >= 0xe0);

describe("the announcer's calls", () => {
  it('names a start and a clear call for every mission', () => {
    expect(startCall(2)).toBe('mission-02-start');
    expect(clearCall(12)).toBe('mission-12-complete');
    expect(new Set(calls).size).toBe(MISSIONS.length * 2);
  });

  it('has a small MP3 for each call and no clip that no call plays', () => {
    const files = readdirSync(CLIPS).sort();
    expect(files).toEqual(calls.map((call) => `${call}.mp3`).sort());
    for (const file of files) {
      const bytes = readFileSync(new URL(file, CLIPS));
      expect(isMp3(bytes)).toBe(true);
      expect(bytes.length).toBeGreaterThan(4000);
      expect(bytes.length).toBeLessThan(60000);
    }
  });
});
