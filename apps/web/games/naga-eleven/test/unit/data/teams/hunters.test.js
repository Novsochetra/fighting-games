import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';

const hunters = Object.values(TEAMS).flatMap((team) =>
  team.players.filter((player) => player.hunts).map((player) => ({ team, player })),
);

const matchesAgainst = (teamId) =>
  CHAPTERS.flatMap((chapter) => chapter.stages).filter(
    (stage) => stage.kind === 'match' && stage.opponent === teamId,
  );

const duelRivalOf = (stage) =>
  (stage.triggers ?? []).find((trigger) => trigger.when === 'firstDuel')?.with ?? null;

describe('the rivals who hunt Sochetra', () => {
  it('are Rithy in the finals of the first two chapters, where his duel scene waits for him', () => {
    for (const final of ['royal-kids', 'phnom-penh-elite']) {
      const rithy = TEAMS[final].players.find((player) => player.star === 'rithy');

      expect(rithy.hunts, final).toBe('sochetra');
    }
  });

  // a hunter plays his matches round the star, so he is only for a rival a scene is written for
  it('hunt only Sochetra, and only in matches whose duel scene waits for them', () => {
    expect(hunters.length).toBeGreaterThan(0);

    for (const { team, player } of hunters) {
      expect(player.hunts).toBe('sochetra');
      expect(player.role).not.toBe('keeper');

      for (const stage of matchesAgainst(team.id)) {
        expect(duelRivalOf(stage), stage.id).toBe(player.star);
      }
    }
  });
});
