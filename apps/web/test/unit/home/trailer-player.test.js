import { describe, expect, it, vi } from 'vitest';
import {
  PHONE_MEDIA,
  startTrailer,
  stopTrailer,
  tapTrailer,
  trailerFor,
} from '../../../src/home/trailer-player.js';

const SRC = 'https://arcade.test/games/demo/assets/trailer/trailer.mp4';

const refusal = (name) => Object.assign(new Error(name), { name });

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

describe('tapTrailer', () => {
  const at = (video, { paused, muted }) => Object.assign(video, { paused, muted });

  it('plays a trailer that waits', async () => {
    const video = at(fakeVideo(), { paused: true, muted: false });

    expect(await tapTrailer(video)).toBe('playing');
    expect(video.play).toHaveBeenCalled();
  });

  it('brings back the sound of a trailer playing muted, and plays on', async () => {
    const video = at(fakeVideo(), { paused: false, muted: true });

    expect(await tapTrailer(video)).toBe('sound');
    expect(video.muted).toBe(false);
    expect(video.pause).not.toHaveBeenCalled();
  });

  it('pauses a trailer playing with sound', async () => {
    const video = at(fakeVideo(), { paused: false, muted: false });

    expect(await tapTrailer(video)).toBe('paused');
    expect(video.pause).toHaveBeenCalled();
  });

  it('stays paused where the browser will not play it', async () => {
    const video = at(fakeVideo('NotAllowedError'), { paused: true, muted: false });

    expect(await tapTrailer(video)).toBe('paused');
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

const FULL = 'https://cdn.example.com/promo/trailer.mp4';
const SMALL = 'https://cdn.example.com/promo/trailer-480.mp4';

const browser = ({ phone = false, connection } = {}) => ({
  matchMedia: (query) => ({ matches: query === PHONE_MEDIA && phone }),
  navigator: { connection },
});

describe('trailerFor', () => {
  const card = { trailerSrc: FULL, trailerSmallSrc: SMALL };

  it('plays the full trailer on a wide screen with a good connection', () => {
    expect(trailerFor(card, browser())).toBe(FULL);
    expect(trailerFor(card, browser({ connection: { effectiveType: '4g', downlink: 10 } }))).toBe(
      FULL,
    );
  });

  it('plays the small copy on a phone', () => {
    expect(trailerFor(card, browser({ phone: true }))).toBe(SMALL);
  });

  it.each([
    { saveData: true, effectiveType: '4g', downlink: 10 },
    { effectiveType: '3g', downlink: 1.4 },
    { effectiveType: '2g' },
    { effectiveType: '4g', downlink: 2.5 },
  ])('plays the small copy on a connection that is %o', (connection) => {
    expect(trailerFor(card, browser({ connection }))).toBe(SMALL);
  });

  it('plays the only trailer a game has, whatever the screen', () => {
    const one = { trailerSrc: FULL, trailerSmallSrc: '' };

    expect(trailerFor(one, browser({ phone: true, connection: { saveData: true } }))).toBe(FULL);
  });

  it('plays the full trailer where the browser can say nothing of its screen', () => {
    expect(trailerFor(card, { navigator: {} })).toBe(FULL);
  });
});
