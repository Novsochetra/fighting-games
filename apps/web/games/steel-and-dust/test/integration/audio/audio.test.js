import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudio, installAudioUnlock, SOUND_TAKES } from '../../../src/audio/index.js';
import { nodesOfKind, reaches, stubAudioContext } from '../../unit/audio/fake-audio-context.js';

const SOUND_COUNT = Object.keys(SOUND_TAKES).length;

function gameState() {
  return {
    mode: 'title',
    muted: false,
    clearTime: 0,
    boss: null,
    camera: { x: 0 },
    settings: { music: 60, sfx: 80 },
  };
}

function fakeWindow() {
  const listeners = {};
  return {
    addEventListener: (type, listener) => {
      listeners[type] = listener;
    },
    document: { hidden: false, addEventListener: () => {} },
    fire: (type) => listeners[type](),
  };
}

const scheduled = (context) => [
  ...nodesOfKind(context, 'bufferSource'),
  ...nodesOfKind(context, 'oscillator'),
];

let contexts;

beforeEach(() => {
  vi.useFakeTimers();
  contexts = stubAudioContext();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('audio, from the first tap to a fight with music', () => {
  it('unlocks on a gesture, warms the bank and plays bank, live and music sounds to the speakers', () => {
    const game = gameState();
    const audio = createAudio(game);
    const target = fakeWindow();
    installAudioUnlock(target, audio);
    target.fire('pointerup');
    const [context] = contexts;
    expect(audio.debugState()).toEqual({ state: 'running', voices: 0, bank: `0/${SOUND_COUNT}` });

    vi.runAllTimers();
    expect(audio.debugState().bank).toBe(`${SOUND_COUNT}/${SOUND_COUNT}`);

    audio.update();
    const titleNotes = scheduled(context).length;
    expect(titleNotes).toBeGreaterThan(0);

    game.mode = 'play';
    game.camera.x = 200;
    context.currentTime = 1;
    audio.sfx('swingSword', true, { x: 260, dir: 1 });
    audio.sfx('blade', true, { x: 300 });
    audio.sfx('voiceHurt', false, { x: 300 });
    audio.sfx('pickup');
    audio.sfx('combo');
    audio.update();

    expect(audio.debugState().voices).toBe(3);
    const nodes = scheduled(context);
    expect(nodes.length).toBeGreaterThan(titleNotes + 3);
    for (const node of nodes) {
      expect(reaches(node, context.destination)).toBe(true);
    }
    expect(nodesOfKind(context, 'stereoPanner')).toHaveLength(3);
  });

  it('plays the ultimate cut-in and finish from the bank, beside a full group of hits', () => {
    const game = gameState();
    game.mode = 'play';
    const audio = createAudio(game);
    audio.unlock();
    vi.runAllTimers();
    const [context] = contexts;
    context.currentTime = 2;
    for (const hit of ['blade', 'heavy', 'blunt', 'pierce']) {
      audio.sfx(hit, false, { x: 120 });
    }
    const before = nodesOfKind(context, 'bufferSource').length;
    audio.sfx('ult');
    audio.sfx('ultEnd');
    expect(audio.debugState().voices).toBe(6);
    const ultSources = nodesOfKind(context, 'bufferSource').slice(before);
    expect(ultSources).toHaveLength(2);
    for (const source of ultSources) {
      expect(source.stops).toEqual([]);
      expect(reaches(source, context.destination)).toBe(true);
    }
  });

  it('ducks and restores the music as the game pauses and resumes, and mutes everything', () => {
    const game = gameState();
    game.mode = 'play';
    const audio = createAudio(game);
    audio.unlock();
    const [context] = contexts;
    const musicBus = nodesOfKind(context, 'gain').find((node) => node.gain.value === 0.3);
    expect(musicBus).toBeDefined();
    game.mode = 'pause';
    audio.update();
    expect(musicBus.gain.value).toBeCloseTo(0.12, 12);
    game.mode = 'play';
    audio.update();
    expect(musicBus.gain.value).toBe(0.3);
    const unmuted = () => nodesOfKind(context, 'gain').filter((node) => node.gain.value === 0.9);
    expect(unmuted()).toHaveLength(2);
    game.muted = true;
    audio.syncVolumes();
    expect(unmuted()).toHaveLength(0);
    const before = context.nodes.length;
    audio.sfx('blunt');
    audio.sfx('ui');
    expect(context.nodes.length).toBe(before);
    game.muted = false;
    audio.syncVolumes();
    expect(unmuted()).toHaveLength(2);
  });
});
