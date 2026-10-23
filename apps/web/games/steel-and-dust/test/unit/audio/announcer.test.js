import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAnnouncer, playCall, preloadCalls } from '../../../src/audio/announcer.js';
import { buildChain } from '../../../src/audio/context/build-chain.js';
import { MISSIONS } from '../../../src/data/missions/index.js';
import {
  advanceTo,
  createFakeAudioContext,
  createFakeBuffer,
  nodesOfKind,
  reaches,
} from './fake-audio-context.js';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function runningAudio() {
  const context = createFakeAudioContext({ state: 'running' });
  context.decodeAudioData = vi.fn(async () => createFakeBuffer(1, 44100, 44100));
  const audio = { context, chain: buildChain(context), tickOffset: 0 };
  context.nodes.length = 0;
  return audio;
}

function serveClips({ ok = true } = {}) {
  const fetch = vi.fn(async () => ({ ok, status: ok ? 200 : 404, arrayBuffer: async () => [] }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

const fetched = (fetch) => fetch.mock.calls.map(([url]) => url);
const game = (missionIndex = 0, muted = false) => ({ missionIndex, muted });

async function loadedAnnouncer(audio, missionIndex = 0) {
  const announcer = createAnnouncer();
  preloadCalls(audio, announcer, game(missionIndex));
  await settle();
  return announcer;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the announcer', () => {
  it("loads a mission's own calls and the next one's start while it is played", async () => {
    const fetch = serveClips();
    await loadedAnnouncer(runningAudio(), 1);
    expect(fetched(fetch)).toEqual([
      'assets/audio/announcer/mission-02-start.mp3',
      'assets/audio/announcer/mission-02-complete.mp3',
      'assets/audio/announcer/mission-03-start.mp3',
    ]);
  });

  it('loads each call once, and nothing before there is sound to play it on', async () => {
    const fetch = serveClips();
    const audio = runningAudio();
    const announcer = createAnnouncer();
    preloadCalls({ context: null }, announcer, game());
    expect(fetch).not.toHaveBeenCalled();
    preloadCalls(audio, announcer, game());
    preloadCalls(audio, announcer, game());
    preloadCalls(audio, announcer, game(1));
    await settle();
    expect(fetched(fetch)).toHaveLength(5);
    expect(new Set(fetched(fetch)).size).toBe(5);
  });

  it('looks for no mission past the last one', async () => {
    const fetch = serveClips();
    await loadedAnnouncer(runningAudio(), MISSIONS.length - 1);
    expect(fetched(fetch)).toEqual([
      'assets/audio/announcer/mission-12-start.mp3',
      'assets/audio/announcer/mission-12-complete.mp3',
    ]);
  });

  it('plays a call through the effects bus and lets go of it once it has played', async () => {
    serveClips();
    const audio = runningAudio();
    const announcer = await loadedAnnouncer(audio);
    playCall(audio, announcer, { game: game(), call: 'mission-01-start' });
    const [source] = nodesOfKind(audio.context, 'bufferSource');
    expect(source.buffer.duration).toBe(1);
    expect(reaches(source, audio.chain.effectsBus)).toBe(true);
    advanceTo(audio.context, 2);
    expect(source.connections[0].disconnected).toBe(true);
    expect(announcer.playing).toBeNull();
  });

  it('cuts a call off when the next one comes', async () => {
    serveClips();
    const audio = runningAudio();
    const announcer = await loadedAnnouncer(audio);
    playCall(audio, announcer, { game: game(), call: 'mission-01-start' });
    playCall(audio, announcer, { game: game(), call: 'mission-01-complete' });
    const [first, second] = nodesOfKind(audio.context, 'bufferSource');
    expect(first.stops).toHaveLength(1);
    expect(announcer.playing).toBe(second);
  });

  it('stays silent when muted, or for a call still on its way or that failed to load', async () => {
    serveClips({ ok: false });
    const audio = runningAudio();
    const announcer = await loadedAnnouncer(audio);
    playCall(audio, announcer, { game: game(), call: 'mission-01-start' });
    playCall(audio, announcer, { game: game(), call: 'mission-05-start' });
    serveClips();
    const loaded = await loadedAnnouncer(audio);
    playCall(audio, loaded, { game: game(0, true), call: 'mission-01-start' });
    expect(nodesOfKind(audio.context, 'bufferSource')).toEqual([]);
  });
});
