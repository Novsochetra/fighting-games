import { describe, expect, it, vi } from 'vitest';
import { startTrailer, stopTrailer } from '../../../src/home/trailer-player.js';

const SRC = 'https://arcade.test/games/demo/assets/trailer/trailer.mp4';

const refusal = (name) => Object.assign(new Error(name), { name });

// A video element as far as the player touches it; play answers with each of `answers` in turn.
function fakeVideo(...answers) {
  const attributes = new Map();
  const video = {
    muted: false,
    played: [],
    getAttribute: (name) => attributes.get(name) ?? null,
    removeAttribute: (name) => attributes.delete(name),
    set src(value) {
      attributes.set('src', value);
    },
    play: vi.fn(() => {
      video.played.push(video.muted ? 'muted' : 'with sound');
      const answer = answers.shift() ?? 'plays';

      return answer === 'plays' ? Promise.resolve() : Promise.reject(refusal(answer));
    }),
    pause: vi.fn(),
    load: vi.fn(),
  };

  return video;
}

describe('startTrailer', () => {
  it('plays the trailer with sound, from its address', async () => {
    const video = fakeVideo();

    expect(await startTrailer(video, { src: SRC, withSound: true })).toBe(true);
    expect(video.getAttribute('src')).toBe(SRC);
    expect(video.played).toEqual(['with sound']);
  });

  it('plays it muted for a player who turned the arcade’s sound off', async () => {
    const video = fakeVideo();

    await startTrailer(video, { src: SRC, withSound: false });

    expect(video.played).toEqual(['muted']);
  });

  it('plays it muted where the browser refuses its sound', async () => {
    const video = fakeVideo('NotAllowedError');

    expect(await startTrailer(video, { src: SRC, withSound: true })).toBe(true);
    expect(video.played).toEqual(['with sound', 'muted']);
    expect(video.muted).toBe(true);
  });

  it('keeps its sound when its start was only cut short, by the sheet closing', async () => {
    const video = fakeVideo('AbortError');

    expect(await startTrailer(video, { src: SRC, withSound: true })).toBe(false);
    expect(video.played).toEqual(['with sound']);
    expect(video.muted).toBe(false);
  });

  it('leaves the play button to the player where the browser plays nothing by itself', async () => {
    const refusing = fakeVideo('NotAllowedError', 'NotAllowedError');

    expect(await startTrailer(refusing, { src: SRC, withSound: true })).toBe(false);

    const throwing = {
      ...fakeVideo(),
      play: () => {
        throw new Error('no video here');
      },
    };

    expect(await startTrailer(throwing, { src: SRC, withSound: false })).toBe(false);
  });

  it('keeps the address it already has, so the download goes on', async () => {
    const video = fakeVideo();
    const setSrc = vi.spyOn(video, 'src', 'set');

    await startTrailer(video, { src: SRC, withSound: true });
    await startTrailer(video, { src: SRC, withSound: true });

    expect(setSrc).toHaveBeenCalledTimes(1);
  });
});

describe('stopTrailer', () => {
  it('stops the trailer and its download', async () => {
    const video = fakeVideo();

    await startTrailer(video, { src: SRC, withSound: true });
    stopTrailer(video);

    expect(video.pause).toHaveBeenCalled();
    expect(video.getAttribute('src')).toBeNull();
    expect(video.load).toHaveBeenCalled();
  });
});
