import { describe, expect, it } from 'vitest';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { crunchCurve, softClipCurve } from '../../../src/audio/context/shaper-curves.js';
import { applyVolumes, volumeLevels } from '../../../src/audio/context/volumes.js';
import { createFakeAudioContext, nodesOfKind, reaches } from './fake-audio-context.js';

const gameWith = (fields) => ({
  mode: 'play',
  muted: false,
  settings: { music: 60, sfx: 80 },
  ...fields,
});

describe('curves', () => {
  it('leaves the soft clip linear below 0.8 and bends the peaks under 1', () => {
    const curve = softClipCurve();
    expect(curve).toHaveLength(2049);
    expect(curve[1024]).toBe(0);
    expect(curve[1024 + 512]).toBeCloseTo(0.5, 6);
    expect(curve[2048]).toBeGreaterThan(0.95);
    expect(curve[2048]).toBeLessThan(1);
    expect(crunchCurve()[1023]).toBeCloseTo(Math.tanh(3.2), 2);
  });
});

describe('buildChain', () => {
  it('routes the effects and music buses to the speakers, with the reverb and the echo', () => {
    const context = createFakeAudioContext();
    const chain = buildChain(context);
    for (const bus of [chain.master, chain.effectsBus, chain.musicBus, chain.echoInput]) {
      expect(reaches(bus, context.destination)).toBe(true);
    }
    expect(reaches(chain.effectsBus, nodesOfKind(context, 'convolver')[0])).toBe(true);
    expect(reaches(chain.echoInput, chain.musicBus)).toBe(true);
    expect(chain.noiseBuffer.length).toBe(44100);
    expect(nodesOfKind(context, 'compressor')).toHaveLength(2);
  });
});

describe('volumes', () => {
  it('scales the buses by the settings and ducks the music in pause and game over', () => {
    expect(volumeLevels(gameWith({}))).toEqual({
      master: 0.9,
      effectsOut: 0.9,
      effects: 0.6,
      music: 0.3,
    });
    expect(volumeLevels(gameWith({ mode: 'over' })).music).toBeCloseTo(0.12, 12);
    expect(volumeLevels(gameWith({ muted: true }))).toMatchObject({ master: 0, effectsOut: 0 });
  });

  it('writes the levels into the chain, and does nothing before there is one', () => {
    const chain = buildChain(createFakeAudioContext());
    applyVolumes(chain, gameWith({ muted: true }));
    expect(chain.master.gain.value).toBe(0);
    expect(chain.effectsBus.gain.value).toBe(0.6);
    expect(() => applyVolumes(null, gameWith({}))).not.toThrow();
  });
});
