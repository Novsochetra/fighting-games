import { describe, expect, it, vi } from 'vitest';
import { createShare } from '../../../src/ui/share/share-run.js';

const run = {
  score: 4200,
  mission: 3,
  hero: 'moss',
  difficulty: 1,
  time: 600,
  cleared: false,
  at: 7,
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

// a page whose images load at once, whose canvas draws nothing and hands back a blob, and whose
// timers run when the test says
function fakePage(navigator) {
  const timers = [];
  const canvas = { getContext: () => new Proxy({}, { get: () => vi.fn(() => ({ width: 1 })) }) };
  canvas.toBlob = (done) => done(new Blob(['png']));
  const link = { click: vi.fn() };
  const document = {
    querySelector: () => ({ href: 'https://www.khmerarcade.games/games/steel-and-dust/' }),
    createElement: vi.fn((tag) => (tag === 'canvas' ? canvas : link)),
    fonts: { load: vi.fn(async () => []) },
  };
  class FakeImage {
    set src(value) {
      this.width = 128;
      this.height = 80;
      this.source = value;
      queueMicrotask(() => this.onload());
    }
  }
  const window = {
    navigator,
    Image: FakeImage,
    File,
    URL: { createObjectURL: () => 'blob:card', revokeObjectURL: vi.fn() },
    setTimeout: (callback) => timers.push(callback),
  };
  const runTimers = () => timers.splice(0).forEach((callback) => callback());
  return { window, document, link, runTimers };
}

describe('sharing a run', () => {
  it('hands the phone’s share sheet the card and the words, with the game’s address', async () => {
    const navigator = { canShare: vi.fn(() => true), share: vi.fn(async () => {}) };
    const { window, document } = fakePage(navigator);
    await createShare({ window, document })(run, null);
    const [shared] = navigator.share.mock.calls[0];
    expect(shared.files[0].name).toBe('steel-and-dust-run.png');
    expect(shared.title).toBe('Steel & Dust');
    expect(shared.text).toMatch(/^I reached mission 3 of Steel & Dust as Moss Shade/);
    expect(shared.text).toMatch(/\nhttps:\/\/www\.khmerarcade\.games\/games\/steel-and-dust\/$/);
  });

  it('shares the words and the address where a browser shares no files', async () => {
    const navigator = { share: vi.fn(async () => {}) };
    const { window, document } = fakePage(navigator);
    await createShare({ window, document })(run, { week: 2, allTime: 5 });
    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Steel & Dust',
      text: "I reached mission 3 of Steel & Dust as Moss Shade with 4,200 points, #2 on this week's board. Can you beat me?",
      url: 'https://www.khmerarcade.games/games/steel-and-dust/',
    });
  });

  it('saves the card where a browser cannot share at all', async () => {
    const { window, document, link } = fakePage({});
    await createShare({ window, document })(run, null);
    expect(link.download).toBe('steel-and-dust-run.png');
    expect(link.click).toHaveBeenCalled();
  });

  it('draws the card ahead, once the run’s end has shown, and shares that one', async () => {
    const navigator = { canShare: () => true, share: vi.fn(async () => {}) };
    const { window, document, runTimers } = fakePage(navigator);
    const share = createShare({ window, document });
    share.prepare(run, null);
    share.prepare(run, null);
    expect(document.createElement).not.toHaveBeenCalled();
    runTimers();
    await settle();
    expect(document.createElement).toHaveBeenCalledTimes(1);
    await share(run, null);
    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(navigator.share).toHaveBeenCalledTimes(1);
  });

  it('lets a closed share sheet go quietly', async () => {
    const abort = Object.assign(new Error('closed'), { name: 'AbortError' });
    const navigator = { share: vi.fn(async () => Promise.reject(abort)) };
    const { window, document } = fakePage(navigator);
    await expect(createShare({ window, document })(run, null)).resolves.toBeUndefined();
  });
});
