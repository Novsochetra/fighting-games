import { describe, expect, it, vi } from 'vitest';
import { HERO_THEMES } from '../../../src/art/hero-themes.js';
import { CARD_SIZE, drawShareCard } from '../../../src/ui/share/share-card.js';
import { cardWords, shareText } from '../../../src/ui/share/share-text.js';

const run = (extra) => ({
  score: 48210,
  mission: 8,
  hero: 'bokator',
  difficulty: 1,
  time: 90000,
  cleared: false,
  at: 1,
  ...extra,
});

describe('the words a run is shared with', () => {
  it('names how far the run got, as whom, with how many points, and dares a friend', () => {
    expect(shareText(run(), null)).toBe(
      'I reached mission 8 of Steel & Dust as Bokator with 48,210 points. Can you beat me?',
    );
    expect(shareText(run({ cleared: true, mission: 12, hero: 'angkor' }), { week: 2 })).toBe(
      "I cleared all 12 missions of Steel & Dust as Angkor Warrior with 48,210 points, #2 on this week's board. Can you beat me?",
    );
  });

  it('puts the hero, the score, the mission and the online place on the card', () => {
    expect(cardWords(run(), { week: 3, allTime: 20 })).toEqual({
      hero: 'Bokator',
      score: '48,210',
      reached: 'Mission 8: Iron Works',
      rank: '#3 this week online',
    });
    expect(cardWords(run({ cleared: true }), null)).toMatchObject({
      reached: 'All 12 missions clear!',
      rank: '',
    });
  });
});

describe('the share card', () => {
  function recordingContext() {
    const texts = [];
    const context = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      // each letter as wide as the font is tall
      measureText: (text) => ({ width: text.length * Number(/(\d+)px/.exec(context.font)[1]) }),
      fillText(text, x, y) {
        texts.push({ text, font: context.font, color: context.fillStyle, x, y });
      },
    };
    return { context, texts };
  }

  const art = (width, height) => ({ width, height });

  it('paints the painting in whole pixels, the hero in their glow, and the run in the pixel font', () => {
    const { context, texts } = recordingContext();
    drawShareCard(context, {
      run: run(),
      rank: { week: 3, allTime: 20 },
      backdrop: art(384, 216),
      heroArt: art(768, 112),
      site: 'khmerarcade.games',
    });
    expect(context.imageSmoothingEnabled).toBe(false);
    expect(context.drawImage.mock.calls[0]).toEqual([art(384, 216), -168, -117, 1536, 864]);
    const [, sx, sy, sw, sh, , , width, height] = context.drawImage.mock.calls[1];
    expect([sx, sy, sw, sh, width, height]).toEqual([0, 0, 128, 112, 640, 560]);
    expect(context.shadowColor).toBe(HERO_THEMES.bokator.spark);
    const words = texts.filter((_, i) => i % 2 === 1).map((entry) => entry.text);
    expect(words).toEqual([
      'Steel & Dust',
      'Bokator',
      'Score',
      '48,210',
      'Mission 8: Iron Works',
      '#3 this week online',
      'Play free at khmerarcade.games',
    ]);
    expect(texts.every((entry) => entry.font.includes('Silkscreen'))).toBe(true);
  });

  it('shrinks a word that would run past the band', () => {
    const { context, texts } = recordingContext();
    drawShareCard(context, {
      run: run({ score: 99999999 }),
      rank: null,
      backdrop: art(384, 216),
      heroArt: art(512, 80),
      site: 'khmerarcade.games',
    });
    const score = texts.find((entry) => entry.text === '99,999,999');
    const fitted = Math.floor(110 * (600 / (10 * 110)));
    expect(score.font).toBe(`700 ${fitted}px 'Silkscreen', 'Courier New', monospace`);
    expect(texts.every((entry) => entry.x <= 68 && entry.x >= 64)).toBe(true);
    expect(CARD_SIZE).toEqual({ width: 1200, height: 630 });
  });
});
