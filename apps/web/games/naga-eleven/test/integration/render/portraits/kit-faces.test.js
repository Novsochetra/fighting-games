import { describe, expect, it } from 'vitest';
import { GLOVES } from '../../../../src/art/portraits/clothes.js';
import { matchSidesFor, newSave, stageOf } from '../../../../src/campaign/index.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { portraitOf } from '../../../../src/render/duel/portrait-card.js';
import { recipeFor } from '../../../../src/render/portraits/cast/index.js';
import { portraitFor } from '../../../../src/render/portraits/portrait.js';
import { kitLookOf } from '../../../../src/render/portraits/kit/index.js';
import { createMatch } from '../../../../src/sim/create-match.js';

function storyMatch(chapter, stage) {
  const save = { ...newSave(), chapter, stage: CHAPTERS[chapter].stages.indexOf(stage) };
  const at = stageOf(save, CHAPTERS, TEAMS);
  const teams = matchSidesFor(save, at, TEAMS, CHAPTERS);

  return { match: createMatch({ seed: 7, humanTeam: 0, teams }), heroAge: at.at.heroAge };
}

const DUELLISTS = CHAPTERS.flatMap((chapter, number) =>
  chapter.stages
    .filter((stage) => stage.opponent)
    .flatMap((stage) => {
      const { match, heroAge } = storyMatch(number, stage);

      return match.players.map((player) => ({
        name: `${stage.id} ${player.id}`,
        look: { ...portraitOf(player, { mood: 'shout', heroAge, match }), kit: true },
        keeper: player.role === 'keeper',
      }));
    }),
);

const coloursOf = (request) => new Set(portraitFor(request).runs.map((run) => run.colour));

describe('the players of the story in a duel', () => {
  it('all have a look in the face kit', () => {
    const missing = DUELLISTS.filter(({ look }) => !kitLookOf(look)).map(({ name }) => name);

    expect(missing).toEqual([]);
  });

  it('show in their own skin, hair and shirt', () => {
    for (const { name, look } of DUELLISTS.filter((_, i) => i % 7 === 0)) {
      const { palette } = recipeFor(look);
      const colours = coloursOf(look);

      expect(colours.has(palette.skin), name).toBe(true);
      expect(colours.has(palette.cloth) || colours.has(palette.clothShade), name).toBe(true);
    }
  });

  it('keep a keeper’s gloves up in front of him', () => {
    const keepers = DUELLISTS.filter(({ keeper }) => keeper);

    expect(keepers.length).toBeGreaterThan(0);

    for (const { name, look } of keepers) {
      expect(coloursOf(look).has(GLOVES.prop), name).toBe(true);
    }
  });

  it('leave the story’s own portraits as they were outside a duel', () => {
    const { look } = DUELLISTS.find(({ look: each }) => each.character === 'sochetra');
    const scene = { ...look, kit: false, mood: 'neutral' };

    expect(portraitFor(scene).key.startsWith('kit|')).toBe(false);
    expect(portraitFor({ ...scene, kit: true }).key.startsWith('kit|')).toBe(true);
  });
});
