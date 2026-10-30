import { describe, expect, it, vi } from 'vitest';
import { createBoardPoster } from '../../../src/ui/share/board-poster.js';

const run = { score: 4200, mission: 3, hero: 'moss', difficulty: 1, time: 600, cleared: false };

// a page whose images load at once, whose canvases record what is drawn on them and hand back a
// blob naming their size and type, and whose reader reads a blob as base64
function fakePage() {
  const canvases = [];
  const fakeCanvas = () => {
    const canvas = { texts: [] };
    const context = new Proxy(
      {},
      {
        get: (target, key) =>
          key in target
            ? target[key]
            : (...args) => (key === 'fillText' && canvas.texts.push(args[0]), { width: 1 }),
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
      small: '320x168 image/jpeg 0.8',
      medium: '640x336 image/jpeg 0.8',
      large: '1200x630 image/png 0.8',
    });
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
