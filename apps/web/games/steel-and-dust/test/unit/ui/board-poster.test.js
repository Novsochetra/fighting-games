import { describe, expect, it, vi } from 'vitest';
import { createBoardPoster } from '../../../src/ui/share/board-poster.js';
import { HERO_SPOT } from '../../../src/ui/share/share-card.js';

const run = { score: 4200, mission: 3, hero: 'moss', difficulty: 1, time: 600, cleared: false };

// a page whose images load at once, whose canvases record what is drawn on them and hand back a
// blob naming their size and type, and whose reader reads a blob as base64
function fakePage() {
  const canvases = [];
  const fakeCanvas = () => {
    const canvas = { texts: [], cuts: [] };
    const context = new Proxy(
      {},
      {
        get: (target, key) =>
          key in target
            ? target[key]
            : (...args) => {
                if (key === 'fillText') {
                  canvas.texts.push(args[0]);
                }
                if (key === 'drawImage') {
                  canvas.cuts.push(args.slice(1, 5));
                }
                return { width: 1 };
              },
      },
    );
    canvas.getContext = () => context;
    canvas.toBlob = (done, type, quality) =>
      done(new Blob([`${canvas.width}x${canvas.height} ${type} ${quality}`]));
    canvases.push(canvas);
    return canvas;
  };
  const document = {
    querySelector: () => ({ href: 'https://www.khmerarcade.games/games/steel-and-dust/' }),
    createElement: vi.fn(fakeCanvas),
    fonts: { load: vi.fn(async () => []) },
  };
  class FakeImage {
    set src(value) {
      this.width = 128;
      this.height = 80;
      queueMicrotask(() => this.onload());
    }
  }
  function FakeReader() {
    return {
      readAsDataURL(blob) {
        blob.text().then((text) => {
          this.result = `data:application/octet-stream;base64,${btoa(text)}`;
          this.onload();
        });
      },
    };
  }
  return { window: { Image: FakeImage, FileReader: FakeReader }, document, canvases };
}

describe("a run's poster for the online board", () => {
  it('names who played in place of a rank, and comes in every size the board keeps', async () => {
    const { window, document, canvases } = fakePage();
    const images = await createBoardPoster({ window, document })(run, 'Sok Dara');
    expect(canvases[0].texts).toContain('by Sok Dara');
    expect(canvases[0].texts.some((text) => text.includes('this week'))).toBe(false);
    const decoded = Object.fromEntries(
      Object.entries(images).map(([size, data]) => [size, atob(data)]),
    );
    expect(decoded).toEqual({
      avatar: '192x192 image/jpeg 0.8',
      medium: '640x336 image/jpeg 0.8',
      large: '1200x630 image/png 0.8',
    });
  });

  it('cuts the avatar out of the card around the hero, and shrinks the card whole for the rest', async () => {
    const { window, document, canvases } = fakePage();
    await createBoardPoster({ window, document })(run, 'Sok Dara');
    const [avatar, medium] = canvases.slice(1);
    expect([avatar.width, avatar.height]).toEqual([192, 192]);
    expect(avatar.cuts).toEqual([[HERO_SPOT.x, HERO_SPOT.y, HERO_SPOT.size, HERO_SPOT.size]]);
    expect(HERO_SPOT).toEqual({ x: 712, y: 230, size: 400 });
    expect(medium.cuts).toEqual([[0, 0, 1200, 630]]);
  });

  it('fails as a whole when a size cannot be encoded, so nothing half drawn is sent', async () => {
    const { window, document } = fakePage();
    document.createElement.mockImplementationOnce(() => ({
      getContext: () => new Proxy({}, { get: () => () => ({ width: 1 }) }),
      toBlob: (done) => done(null),
    }));
    window.FileReader = function BrokenReader() {
      return {
        readAsDataURL() {
          this.onerror(new TypeError('not a blob'));
        },
      };
    };
    await expect(createBoardPoster({ window, document })(run, 'Sok')).rejects.toThrow();
  });
});
