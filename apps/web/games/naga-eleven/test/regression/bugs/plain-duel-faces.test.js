import { describe, expect, it } from 'vitest';
import { TEAM_LOOKS } from '../../../src/art/actors.js';
import { KITS } from '../../../src/art/kits.js';
import { matchSidesFor, newSave, stageOf } from '../../../src/campaign/index.js';
import { CHAPTERS } from '../../../src/data/story/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { portraitOf } from '../../../src/render/duel/portrait-card.js';
import { recipeFor } from '../../../src/render/portraits/cast/index.js';
import { colouringOf } from '../../../src/render/portraits/cast/footballer-colouring.js';
import { createMatch } from '../../../src/sim/create-match.js';

// A plain player's duel portrait was a villager picked by his place in the match, of any age or
// sex: Royal Kids' keeper Chivorn, a primary-school boy, showed as a grey-haired old woman in a
// dotted blouse, and Brazil's keeper Gustavo as a long-haired young woman in lilac

function storyMatch(stageId) {
  const chapter = CHAPTERS.findIndex((each) => each.stages.some((stage) => stage.id === stageId));
  const index = CHAPTERS[chapter].stages.findIndex((stage) => stage.id === stageId);
  const save = { ...newSave(), chapter, stage: index };
  const stage = stageOf(save, CHAPTERS, TEAMS);
  const teams = matchSidesFor(save, stage, TEAMS, CHAPTERS);
  const match = createMatch({ seed: 99, humanTeam: 0, format: stage.at.format, teams });

  return { match, heroAge: stage.at.heroAge };
}

// the versus card and the cut-in ask for a face with the match, or without it
const facesOf = (player, { match, heroAge }) =>
  [match, null].map((given) =>
    recipeFor(portraitOf(player, { mood: 'determined', heroAge, match: given })),
  );

const STAGES = CHAPTERS.flatMap((chapter) =>
  chapter.stages.filter((stage) => stage.opponent).map((stage) => stage.id),
);

describe('a plain player in a duel', () => {
  it('draws Chivorn as a primary-school boy in Royal Kids’ keeper kit', () => {
    const story = storyMatch('ch1-final');
    const chivorn = story.match.sides[1][0];

    expect(chivorn.name.en).toBe('Chivorn');

    for (const face of facesOf(chivorn, story)) {
      expect(face).toMatchObject({ age: 'child', sex: 'male', head: 'child', build: 'child' });
      expect(face.palette.cloth).toBe(KITS['royal-kids'].keeper.shirt[2]);
      expect(face.frontProps).toHaveLength(1);
    }
  });

  it('draws Gustavo as a grown Brazilian man in Brazil’s keeper kit', () => {
    const story = storyMatch('ch4-group-brazil');
    const gustavo = story.match.sides[1][0];
    const brazilian = colouringOf('brazil', 0).palette;

    expect(gustavo.name).toBe('Gustavo');

    for (const face of facesOf(gustavo, story)) {
      expect(face).toMatchObject({ age: 'adult', sex: 'male', build: 'big' });
      expect(face.palette.cloth).toBe(KITS.brazil.keeper.shirt[2]);
      expect(face.palette.skin).toBe(brazilian.skin);
      expect(face.backHair ?? null).toBeNull();
    }

    expect(TEAM_LOOKS.brazil.skins).toContain(colouringOf('brazil', 0).skin);
  });

  it('is a boy or man of the chapter’s age in every story match', () => {
    for (const stageId of STAGES) {
      const story = storyMatch(stageId);
      const plain = story.match.players.filter((player) => !player.star);

      expect(plain.length, stageId).toBeGreaterThan(4);

      for (const player of plain) {
        for (const face of facesOf(player, story)) {
          expect(face, `${stageId} ${player.id}`).toMatchObject({
            age: story.heroAge,
            sex: 'male',
          });
        }
      }
    }
  });
});
