import { describe, expect, it } from 'vitest';
import { POSTER_SIZES as GAME_POSTER_SIZES } from '../../../web/games/steel-and-dust/src/online/poster-sizes.js';
import { jpegSize, pngSize } from '../../src/leaderboard/image-size.js';
import { newPosterKey, POSTER_SIZES, posterFileKey } from '../../src/leaderboard/poster-files.js';
import { readPoster } from '../../src/leaderboard/read-poster.js';
import { isFileKey } from '../../src/storage/file-keys.js';
import { fakeJpeg, fakePng, posterImages } from '../support/poster-images.js';

const RULES = new Map([['brawler', {}]]);
const body = (extra) => ({ game: 'brawler', ticket: 't', images: posterImages(), ...extra });

describe('the size of an image', () => {
  it('reads a PNG from its IHDR chunk', () => {
    expect(pngSize(fakePng(1200, 630))).toEqual({ width: 1200, height: 630 });
  });

  it('reads a JPEG from its frame header, past the segments before it', () => {
    expect(jpegSize(fakeJpeg(640, 336))).toEqual({ width: 640, height: 336 });
  });

  it.each([
    ['nothing', Buffer.alloc(0)],
    ['a JPEG as a PNG', fakeJpeg(1200, 630)],
    ['text', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'.padEnd(40))],
  ])('finds no PNG in %s', (_label, bytes) => {
    expect(pngSize(bytes)).toBeNull();
  });

  it.each([
    ['nothing', Buffer.alloc(0)],
    ['a PNG as a JPEG', fakePng(320, 168)],
    ['a JPEG cut off before its frame', fakeJpeg(320, 168).subarray(0, 24)],
    ['a JPEG whose scan comes before any frame', Buffer.from([0xff, 0xd8, 0xff, 0xda, 0, 2])],
  ])('finds no JPEG in %s', (_label, bytes) => {
    expect(jpegSize(bytes)).toBeNull();
  });
});

describe('readPoster', () => {
  it('takes a poster in every size, each the image and shape it should be', () => {
    const poster = readPoster(body(), RULES);
    expect(poster.game).toBe('brawler');
    expect(poster.files.map((file) => [file.size.name, file.bytes.length > 0])).toEqual([
      ['small', true],
      ['medium', true],
      ['large', true],
    ]);
  });

  it.each([
    ['a size missing', { small: undefined }],
    ['a size of the wrong shape', { medium: fakeJpeg(600, 336).toString('base64') }],
    ['a JPEG for the PNG', { large: fakeJpeg(1200, 630).toString('base64') }],
    ['a size too heavy', { small: fakeJpeg(320, 168, 41_000).toString('base64') }],
    ['text that is not base64', { small: '<script>alert(1)</script>' }],
  ])('refuses %s', (_label, images) => {
    const poster = readPoster(body({ images: posterImages(images) }), RULES);
    expect(poster.error).toMatch(/not a poster the game drew/);
  });

  it('refuses a game with no board, and a poster with no ticket', () => {
    expect(readPoster(body({ game: 'puzzle' }), RULES).error).toMatch(/no leaderboard/);
    expect(readPoster(body({ ticket: 42 }), RULES).error).toMatch(/ticket/);
    expect(readPoster(null, RULES).error).toMatch(/no leaderboard/);
  });
});

describe('the sizes of a poster', () => {
  it('are the ones Steel & Dust draws', () => {
    const shapeOf = ({ name, width, height, type }) => ({ name, width, height, type });
    expect(POSTER_SIZES.map(shapeOf)).toEqual(GAME_POSTER_SIZES);
  });
});

describe('a poster in the bucket', () => {
  it('lies under a random name in its game, each size a file key of its own', () => {
    const key = newPosterKey('steel-and-dust');
    expect(key).toMatch(/^posters\/steel-and-dust\/[0-9a-f]{24}$/);
    expect(newPosterKey('steel-and-dust')).not.toBe(key);
    expect(POSTER_SIZES.map((size) => posterFileKey(key, size)).every(isFileKey)).toBe(true);
  });
});
