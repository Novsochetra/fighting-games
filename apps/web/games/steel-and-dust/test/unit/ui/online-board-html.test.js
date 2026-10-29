import { describe, expect, it } from 'vitest';
import { onlineBoardHtml, onlineLatest } from '../../../src/ui/leaderboard/online-board-html.js';
import { postHtml } from '../../../src/ui/post/post-panel.js';

const shown = (initials, score) => ({
  initials,
  score,
  mission: 4,
  hero: 'angkor',
  difficulty: 0,
  time: 36000,
  cleared: false,
  date: '2026-10-28',
});

const onlineWith = (extra) => ({ status: 'ready', runs: null, posted: null, note: '', ...extra });

describe('the online board panel', () => {
  it('says it is loading until the board is in, and when it could not be read', () => {
    expect(onlineBoardHtml(onlineWith({ status: 'loading' }), 'week')).toContain('Loading');
    expect(onlineBoardHtml(onlineWith({ status: 'failed' }), 'all')).toContain("Can't reach");
  });

  it('invites a first post to an empty board', () => {
    const online = onlineWith({ runs: { week: [], allTime: [] } });
    expect(onlineBoardHtml(online, 'week')).toContain('No runs posted this week yet');
    expect(onlineBoardHtml(online, 'all')).toContain('No runs posted yet');
  });

  it("lists each run with its place, score, player's initials and hero, and day", () => {
    const online = onlineWith({ runs: { week: [shown('SOK', 9000)], allTime: [] } });
    const html = onlineBoardHtml(online, 'week');
    expect(html).toContain('<td>1</td><td>9000</td>');
    expect(html).toContain('<b class="board-name">SOK</b>');
    expect(html).toContain('Angkor Warrior');
    expect(html).toContain('Mission 4');
    expect(html).toContain('10:00');
    expect(html).toContain('<td class="wide">28 Oct</td>');
    expect(html).toContain('A new week starts on Monday');
  });

  it('marks the run just posted only where the run at its place is it', () => {
    const runs = [shown('DAR', 9000), shown('SOK', 4200)];
    const run = { score: 4200 };
    const posted = { run, rank: { week: 2, allTime: 9 }, initials: 'SOK' };
    expect(onlineLatest(runs, posted, 'week')).toBe(1);
    expect(onlineLatest(runs, posted, 'all')).toBe(-1);
    expect(onlineLatest(runs, { ...posted, initials: 'MEY' }, 'week')).toBe(-1);
    expect(onlineLatest(runs, null, 'week')).toBe(-1);
  });
});

describe('the post panel', () => {
  const run = { score: 4200, mission: 3, cleared: false };
  const online = (extra) => ({ posting: false, note: '', rankOf: () => null, ...extra });

  it('shows the run, its three letters and Post', () => {
    const html = postHtml({ run, letters: ['S', 'O', 'K'], online: online() });
    expect(html).toContain('Score <b>4200</b>');
    expect(html).toContain('Mission 3');
    expect([...html.matchAll(/initial-letter">(\w)</g)].map((match) => match[1])).toEqual([
      'S',
      'O',
      'K',
    ]);
    expect(html).toContain('data-act="sendScore">Post');
  });

  it('holds Post while a post is under way, and offers the board once it is posted', () => {
    const posting = postHtml({ run, letters: ['A', 'A', 'A'], online: online({ posting: true }) });
    expect(posting).toContain('data-act="sendScore" disabled');
    const posted = postHtml({
      run,
      letters: ['A', 'A', 'A'],
      online: online({ rankOf: () => ({}) }),
    });
    expect(posted).toContain('data-act="leaderboard">See the board');
  });

  it('writes what the server said as text, never as markup', () => {
    const html = postHtml({
      run,
      letters: ['A', 'A', 'A'],
      online: online({ note: '<img src=x onerror=alert(1)>' }),
    });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
