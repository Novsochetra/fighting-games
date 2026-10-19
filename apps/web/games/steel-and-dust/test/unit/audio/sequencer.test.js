import { describe, expect, it } from 'vitest';
import { playStep } from '../../../src/audio/music/sequencer.js';
import { midiToFrequency, SONGS } from '../../../src/audio/music/songs.js';
import { createFakeAudioContext, nodesOfKind } from './fake-audio-context.js';

function fakeLive() {
  const context = createFakeAudioContext({ state: 'running' });
  const musicBus = { kind: 'musicBus', connections: [] };
  const echoInput = { kind: 'echo', connections: [] };
  const noiseBuffer = context.createBuffer(1, 44100, 44100);
  return { context, chain: { musicBus, echoInput, noiseBuffer } };
}

const frequencies = (context) =>
  nodesOfKind(context, 'oscillator').map(
    (node) => node.frequency.events[0]?.[1] ?? node.frequency.value,
  );

describe('playStep', () => {
  it('plays bass, arpeggio, pad, kick and a closed hat on the first battle step', () => {
    const live = fakeLive();
    playStep(live, { song: SONGS.battle, index: 0, time: 2 });
    const chord = SONGS.battle.chords[0];
    const bass = midiToFrequency(chord[0] - 24);
    expect(frequencies(live.context)).toEqual([
      bass,
      bass / 2,
      midiToFrequency(chord[0] + 12),
      ...chord.flatMap((note) => [midiToFrequency(note), midiToFrequency(note) * 1.007]),
      150,
    ]);
    expect(nodesOfKind(live.context, 'bufferSource')).toHaveLength(2);
    for (const node of [
      ...nodesOfKind(live.context, 'oscillator'),
      ...nodesOfKind(live.context, 'bufferSource'),
    ]) {
      expect(node.starts[0][0]).toBe(2);
    }
  });

  it('plays nothing on a quiet title step', () => {
    const live = fakeLive();
    playStep(live, { song: SONGS.title, index: 1, time: 0 });
    expect(live.context.nodes).toEqual([]);
  });

  it('plays the lead with its vibrato only on the alternate bars, through the echo', () => {
    const quiet = fakeLive();
    playStep(quiet, { song: SONGS.title, index: 4, time: 1 });
    const lead = fakeLive();
    playStep(lead, { song: SONGS.title, index: 20, time: 1 });
    const before = nodesOfKind(quiet.context, 'oscillator').length;
    const [voice, lfo, ...rest] = nodesOfKind(lead.context, 'oscillator').slice(before);
    expect(rest).toEqual([]);
    expect(voice.type).toBe('triangle');
    expect(voice.frequency.events[0]).toEqual(['setValueAtTime', midiToFrequency(67), 1]);
    expect(lfo.frequency.value).toBe(5.5);
    const echoed = (live) =>
      nodesOfKind(live.context, 'gain').filter((node) =>
        node.connections.includes(live.chain.echoInput),
      );
    expect(echoed(quiet)).toHaveLength(1);
    expect(echoed(lead)).toHaveLength(2);
  });

  it('sends every voice to the music bus', () => {
    const live = fakeLive();
    playStep(live, { song: SONGS.boss, index: 4, time: 0 });
    const toBus = nodesOfKind(live.context, 'gain').filter((node) =>
      node.connections.includes(live.chain.musicBus),
    );
    expect(toBus.length).toBeGreaterThan(3);
  });
});
