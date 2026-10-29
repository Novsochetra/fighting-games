import { describe, expect, it } from 'vitest';
import { clearResultsHtml } from '../../../src/ui/menus/results-text.js';

const cleared = (more) => ({
  missionIndex: 11,
  score: 186420,
  lives: 4,
  playTime: 60 * 60 * 47 + 60 * 17,
  continues: 2,
  records: { bestCombo: 48 },
  settings: { difficulty: 1, hero: 'angkor' },
  newBestScore: false,
  leaderboard: [],
  lastRun: null,
  ...more,
});

// each tile's label and value, in order
function tiles(html) {
  return [...html.matchAll(/<dt>(.*?)<\/dt><dd>(.*?)<\/dd>/g)].map(([, name, value]) => [
    name,
    value,
  ]);
}

describe('the results of a cleared run', () => {
  it('names the Shade who won it, in their own color', () => {
    expect(clearResultsHtml(cleared())).toContain(
      '<p class="results-hero" style="--hero-color: var(--color-hero-angkor)">Angkor Warrior</p>',
    );
  });

  it('puts the score first, on its own', () => {
    const html = clearResultsHtml(cleared());

    expect(html).toMatch(/<div class="results-score">.*<b>186420<\/b><\/div><dl/);
  });

  it('stamps a new best only when the score is one', () => {
    expect(clearResultsHtml(cleared({ newBestScore: true }))).toContain('New best!');
    expect(clearResultsHtml(cleared())).not.toContain('New best!');
  });

  it('sums up the rest in six tiles, leaving out the missions the title already counts', () => {
    const lastRun = { score: 186420, cleared: true };

    expect(tiles(clearResultsHtml(cleared({ leaderboard: [lastRun], lastRun })))).toEqual([
      ['Time', '47:17'],
      ['Best combo', '48 hits'],
      ['Leaderboard', '#1'],
      ['Continues', '2'],
      ['Lives left', '3'],
      ['Difficulty', 'Normal'],
    ]);
  });

  it('counts a single hit as one', () => {
    expect(tiles(clearResultsHtml(cleared({ records: { bestCombo: 1 } })))[1]).toEqual([
      'Best combo',
      '1 hit',
    ]);
  });

  it('keeps the leaderboard tile with a dash when the run did not go on the board', () => {
    expect(tiles(clearResultsHtml(cleared()))[2]).toEqual(['Leaderboard', '—']);
  });
});
