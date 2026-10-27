import { describe, expect, it } from 'vitest';
import { dayLabel, leaderboardHtml } from '../../../src/ui/leaderboard/leaderboard-panel.js';
import { continueSavedLabel, overNoteHtml } from '../../../src/ui/menus/menu-text.js';

const AT = new Date(2026, 9, 24, 21, 30).getTime();
const run = (score, more = {}) => ({
  score,
  mission: 5,
  hero: 'firefly',
  difficulty: 2,
  time: 14520,
  cleared: false,
  at: AT,
  ...more,
});

function cells(html) {
  const rows = [...html.matchAll(/<tr class="([^"]*)">(.*?)<\/tr>/g)];
  return rows.map(([, classes, row]) => ({
    classes,
    cells: [...row.matchAll(/<td[^>]*>(.*?)<\/td>/g)].map(([, cell]) => cell),
  }));
}

describe('the leaderboard panel', () => {
  it('says how a run gets on the board while it is empty', () => {
    const html = leaderboardHtml([], null);
    expect(html).toContain('No runs on the board yet');
    expect(html).not.toContain('<table');
  });

  it('lists each run with its place, score, hero, how far it got, difficulty, time and day', () => {
    const board = [
      run(48210, { cleared: true, mission: 12, hero: 'angkor', difficulty: 0 }),
      run(6200),
    ];
    const rows = cells(leaderboardHtml(board, null));
    expect(rows).toHaveLength(2);
    expect(rows[0].cells[0]).toBe('1');
    expect(rows[0].cells[1]).toBe('48210');
    expect(rows[0].cells[2]).toBe(
      '<span class="board-hero" data-hero="angkor">Angkor Warrior</span>',
    );
    expect(rows[0].cells.slice(3)).toEqual(['All clear', 'Easy', '4:02', '24 Oct']);
    expect(rows[1].cells.slice(3)).toEqual(['Mission 5', 'Hard', '4:02', '24 Oct']);
    expect(leaderboardHtml(board, null)).toContain('The best 10 runs played on this device.');
  });

  it('marks the run that just ended', () => {
    const latest = run(6200);
    const rows = cells(leaderboardHtml([run(9000), latest], latest));
    expect(rows.map((row) => row.classes)).toEqual(['board-row', 'board-row latest']);
  });

  it('shows a hero it no longer knows as the first hero', () => {
    const rows = cells(leaderboardHtml([run(900, { hero: 'retired' })], null));
    expect(rows[0].cells[2]).toContain('Moss Shade');
  });

  it('gives the day a run ended on', () => {
    expect(dayLabel(new Date(2026, 0, 3).getTime())).toBe('3 Jan');
    expect(dayLabel(AT)).toBe('24 Oct');
  });
});

describe('the menus on a saved or ended run', () => {
  const game = (more) => ({
    missionIndex: 4,
    score: 6200,
    lives: 0,
    playTime: 14520,
    continues: 2,
    records: { bestCombo: 18 },
    settings: { difficulty: 1 },
    newBestScore: false,
    leaderboard: [],
    lastRun: null,
    ...more,
  });

  it('names the mission a saved run goes on from', () => {
    expect(continueSavedLabel({ mission: 4 })).toBe('Continue mission 5');
  });

  it("shows the ended run's place on the board after the last life", () => {
    const lastRun = run(6200);
    const ended = game({ leaderboard: [run(9000), lastRun], lastRun });
    expect(overNoteHtml(ended)).toContain('Leaderboard <b>#2</b>');
    expect(overNoteHtml(game())).not.toContain('Leaderboard');
  });

  it('shows no place after a fall with lives left, while the last run still has one', () => {
    const lastRun = run(9000);
    const fallen = game({ lives: 2, leaderboard: [lastRun], lastRun });
    expect(overNoteHtml(fallen)).not.toContain('Leaderboard');
  });
});
