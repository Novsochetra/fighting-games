import { describe, expect, it } from 'vitest';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { LIVE_SOUNDS } from '../../../src/audio/live/live-sounds.js';
import { biquad, envelopeGain, oscillator } from '../../../src/audio/live/nodes.js';
import { playOneShot } from '../../../src/audio/live/one-shot.js';
import { playStep } from '../../../src/audio/music/sequencer.js';
import { SONGS } from '../../../src/audio/music/songs.js';
import { advanceTo, connectedNodes, createFakeAudioContext } from './fake-audio-context.js';

function fakeAudio() {
  const context = createFakeAudioContext({ state: 'running' });
  const chain = buildChain(context);
  context.nodes.length = 0;
  return { context, chain };
}

function tone(live, { start, duration }) {
  const envelope = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: 0.01,
    peak: 0.2,
    decay: duration,
  });
  const filter = biquad(live, {
    type: 'lowpass',
    from: 900,
    start,
    duration,
    destination: envelope,
  });
  oscillator(live, { wave: 'sine', from: 440, start, duration, destination: filter });
}

describe('playOneShot', () => {
  it('keeps a sound connected while it plays and disconnects all of it when it ends', () => {
    const audio = fakeAudio();
    playOneShot(audio, (live) => tone(live, { start: 0, duration: 0.2 }));
    expect(connectedNodes(audio.context)).toHaveLength(3);
    advanceTo(audio.context, 0.1);
    expect(connectedNodes(audio.context)).toHaveLength(3);
    advanceTo(audio.context, 0.3);
    expect(connectedNodes(audio.context)).toEqual([]);
  });

  it('waits for the last of several sources', () => {
    const audio = fakeAudio();
    playOneShot(audio, (live) => {
      tone(live, { start: 0, duration: 0.1 });
      tone(live, { start: 0, duration: 0.5 });
    });
    advanceTo(audio.context, 0.2);
    expect(connectedNodes(audio.context)).toHaveLength(6);
    advanceTo(audio.context, 0.6);
    expect(connectedNodes(audio.context)).toEqual([]);
  });

  it('leaves the shared buses alone', () => {
    const audio = fakeAudio();
    playOneShot(audio, (live) => tone(live, { start: 0, duration: 0.1 }));
    advanceTo(audio.context, 1);
    expect(audio.chain.effectsBus.disconnected).toBeUndefined();
    expect(audio.chain.musicBus.disconnected).toBeUndefined();
  });

  it.each(Object.keys(LIVE_SOUNDS))('cleans up every node of the %s sound', (key) => {
    const audio = fakeAudio();
    playOneShot(audio, (live) => LIVE_SOUNDS[key](live, 0.5));
    expect(connectedNodes(audio.context).length).toBeGreaterThan(0);
    advanceTo(audio.context, 10);
    expect(connectedNodes(audio.context)).toEqual([]);
  });

  it('cleans up every node of a music step, the lead vibrato and the echo sends included', () => {
    const audio = fakeAudio();
    for (let index = 0; index < 64; index++) {
      const step = { song: SONGS.boss, index, time: index * 0.1 };
      playOneShot(audio, (live) => playStep(live, step));
    }
    advanceTo(audio.context, 30);
    expect(connectedNodes(audio.context)).toEqual([]);
  });
});
