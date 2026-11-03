import { describe, expect, it } from 'vitest';
import {
  gainXp,
  growHero,
  learnMoves,
  raiseToLevel,
  trainHero,
} from '../../../src/campaign/growth.js';
import { heroAtLevel, statsAtLevel, xpForLevel } from '../../../src/campaign/levels.js';

describe('gaining XP', () => {
  it('adds the XP and keeps the level until the next is reached', () => {
    const hero = gainXp(heroAtLevel(1), 10);

    expect(hero).toMatchObject({ level: 1, xp: 10 });
    expect(hero.stats).toEqual(statsAtLevel(1));
  });

  it('levels up, maybe several levels, growing the stats and the gauge', () => {
    const start = heroAtLevel(1);
    const hero = gainXp(start, xpForLevel(6));

    expect(hero.level).toBe(6);
    expect(hero.stats).toEqual(statsAtLevel(6));
    expect(hero.spiritMax).toBeGreaterThan(start.spiritMax);
  });

  it('keeps what training added on top of the levels', () => {
    const trained = trainHero(heroAtLevel(3), 'target-shot', 'S');
    const hero = gainXp(trained, xpForLevel(8) - trained.xp);

    expect(hero.stats.shot).toBe(statsAtLevel(8).shot + 3);
    expect(hero.stats.dribble).toBe(statsAtLevel(8).dribble);
  });

  it('ignores nothing, negative or nonsense XP', () => {
    const hero = heroAtLevel(4);

    expect(gainXp(hero, 0)).toEqual(hero);
    expect(gainXp(hero, -50)).toEqual(hero);
    expect(gainXp(hero, 'lots')).toEqual(hero);
  });

  it('never takes a stat over 99', () => {
    const hero = { ...heroAtLevel(1), stats: { ...heroAtLevel(1).stats, shot: 99 } };

    expect(gainXp(hero, xpForLevel(30)).stats.shot).toBe(99);
  });
});

describe('the chapter floor', () => {
  it('lifts a hero under the level to it', () => {
    const hero = raiseToLevel(heroAtLevel(3), 9);

    expect(hero).toMatchObject({ level: 9, xp: xpForLevel(9), stats: statsAtLevel(9) });
  });

  it('leaves a hero at or over the level as he is', () => {
    const hero = heroAtLevel(12);

    expect(raiseToLevel(hero, 9)).toBe(hero);
  });
});

describe('training', () => {
  it("adds the grade's steps to the drill's own stats", () => {
    const hero = heroAtLevel(1);
    const trained = trainHero(hero, 'cone-dribble', 'A');

    expect(trained.stats.dribble).toBe(hero.stats.dribble + 2);
    expect(trained.stats.speed).toBe(hero.stats.speed + 2);
    expect(trained.stats.shot).toBe(hero.stats.shot);
  });

  it('raises the spirit gauge in spirit focus', () => {
    const hero = heroAtLevel(1);

    expect(trainHero(hero, 'spirit-focus', 'B').spiritMax).toBe(hero.spiritMax + 2);
  });

  it('adds nothing for a C or an unknown drill', () => {
    const hero = heroAtLevel(1);

    expect(trainHero(hero, 'target-shot', 'C')).toEqual(hero);
    expect(trainHero(hero, 'juggling', 'S')).toEqual(hero);
  });
});

describe('moves', () => {
  it('are kept for good, once each, in the order learned', () => {
    const hero = learnMoves(learnMoves(heroAtLevel(1), ['naga-shot']), 'naga-shot');

    expect(learnMoves(hero, ['garuda-volley', 'power-shot']).moves).toEqual([
      'power-shot',
      'naga-shot',
      'garuda-volley',
    ]);
  });

  it('ignore what is not a move id', () => {
    expect(learnMoves(heroAtLevel(1), [null, '', 7, undefined]).moves).toEqual(['power-shot']);
  });
});

describe('growing the hero at once', () => {
  it('trains, gains XP and learns moves together', () => {
    const hero = growHero(heroAtLevel(1), {
      xp: xpForLevel(2),
      moves: ['naga-shot'],
      drill: 'target-shot',
      grade: 'B',
    });

    expect(hero.level).toBe(2);
    expect(hero.stats.shot).toBe(statsAtLevel(2).shot + 1);
    expect(hero.moves).toContain('naga-shot');
  });
});
