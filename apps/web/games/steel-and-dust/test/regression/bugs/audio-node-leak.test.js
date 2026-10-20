import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAudio } from '../../../src/audio/index.js';
import {
  advanceTo,
  connectedNodes,
  stubAudioContext,
} from '../../unit/audio/fake-audio-context.js';

// Bug: after beating the final boss and playing again four or five times, the sound began to lag
// and then stopped. Every hit, shout and note of the music built fresh Web Audio nodes and none was
// ever disconnected. Desktop Chrome collects them, but Safari keeps connected nodes in the audio
// graph, so a long session piled up tens of thousands of them until the audio thread fell behind.
const TICK = 1 / 60;
const COMBAT_SOUNDS = ['swingSword', 'blade', 'blunt', 'voiceHurt', 'thorns', 'swarm', 'freeze'];

function playFor(session, seconds, everyTick) {
  const { audio, context } = session;
  for (let i = 0; i < seconds * 60; i++) {
    session.time += TICK;
    context.currentTime = session.time;
    everyTick?.(i);
    audio.update();
    if (i % 30 === 0) {
      advanceTo(context, session.time);
    }
  }
}

function fight(session, ticks) {
  const key = COMBAT_SOUNDS[ticks % COMBAT_SOUNDS.length];
  if (ticks % 6 === 0) {
    session.audio.sfx(key, ticks % 12 === 0, { x: 120 + (ticks % 200), dir: 1 });
  }
}

// one run: a fight to the battle music, the boss fight, the final KO and the stage clear
function playRun(session) {
  const { game, audio } = session;
  Object.assign(game, { mode: 'play', clearTime: 0, boss: null });
  playFor(session, 20, (tick) => fight(session, tick));
  game.boss = { entering: false, state: 'walk' };
  playFor(session, 12, (tick) => fight(session, tick));
  game.boss.state = 'ko';
  game.clearTime = 1;
  audio.sfx('ko');
  audio.sfx('clear');
  playFor(session, 6);
}

describe('a long session of runs', () => {
  let contexts;

  beforeEach(() => {
    vi.useFakeTimers();
    contexts = stubAudioContext();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('leaves nothing connected but the mixing chain once the sounds have ended', () => {
    const game = {
      mode: 'title',
      muted: false,
      clearTime: 0,
      boss: null,
      camera: { x: 0 },
      settings: { music: 80, sfx: 80 },
    };
    const audio = createAudio(game);
    audio.unlock();
    const context = contexts[0];
    const permanent = connectedNodes(context).length;
    const session = { game, audio, context, time: 0 };
    for (let run = 0; run < 5; run++) {
      playRun(session);
    }
    game.mode = 'pause';
    game.clearTime = 1;
    advanceTo(context, session.time + 10);
    expect(context.nodes.length).toBeGreaterThan(10000);
    expect(connectedNodes(context)).toHaveLength(permanent);
    expect(audio.debugState().voices).toBe(0);
  });
});
