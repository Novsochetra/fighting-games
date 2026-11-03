import { describe, expect, it } from 'vitest';
import { KITS } from '../../../../src/art/kits.js';
import { GLOVES, VILLAGER_SHIRTS } from '../../../../src/art/portraits/clothes.js';
import { matchSidesFor, newSave, stageOf } from '../../../../src/campaign/index.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { createDuelShow, drawDuelShow } from '../../../../src/render/duel/index.js';
import { PORTRAITS, UNIT } from '../../../../src/render/duel/layout.js';
import { portraitOf } from '../../../../src/render/duel/portrait-card.js';
import { MOODS } from '../../../../src/render/portraits/index.js';
import { recipeFor } from '../../../../src/render/portraits/cast/index.js';
import { composePortrait } from '../../../../src/render/portraits/compose.js';
import { LEGEND } from '../../../../src/render/portraits/legend.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

function storyMatch(chapter, stageId) {
  const index = CHAPTERS[chapter].stages.findIndex((stage) => stage.id === stageId);
  const save = { ...newSave(), chapter, stage: index };
  const stage = stageOf(save, CHAPTERS, TEAMS);
  const teams = matchSidesFor(save, stage, TEAMS, CHAPTERS);

  return { match: createMatch({ seed: 7, humanTeam: 0, teams }), heroAge: stage.at.heroAge };
}

// every plain player of every side, as the chapter he plays in has him
const PLAIN = CHAPTERS.flatMap((chapter, number) =>
  chapter.stages
    .filter((stage) => stage.opponent)
    .flatMap((stage) => {
      const { match, heroAge } = storyMatch(number, stage.id);

      return match.players
        .filter((player) => !player.star)
        .map((player) => ({ player, match, heroAge, name: `${stage.id} ${player.id}` }));
    }),
);

const clothOf = ({ recipe }) => recipe.palette.cloth;

const hexAt = (canvas, x, y) =>
  `#${[...canvas.data.subarray((y * canvas.width + x) * 4, (y * canvas.width + x) * 4 + 3)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;

function coloursIn(canvas, { x, y, size }) {
  const seen = new Set();

  for (let row = y; row < y + size; row += 1) {
    for (let column = x; column < x + size; column += 1) {
      seen.add(hexAt(canvas, column, row));
    }
  }

  return seen;
}

const lettersMissing = (recipe, mood) =>
  [...new Set(composePortrait(recipe, mood).cells.filter(Boolean))].filter(
    (letter) => !recipe.palette[LEGEND[letter]],
  );

// a side meets the hero in more than one match, in the same faces
function facesOnce() {
  const faces = new Map();

  for (const { player, match, heroAge, name } of PLAIN) {
    const look = portraitOf(player, { heroAge, match });

    faces.set(JSON.stringify([look.age, look.variant]), { name, recipe: recipeFor(look) });
  }

  return [...faces.values()];
}

describe('the footballers of the story', () => {
  it('paint only letters their palette has a colour for, in every mood', () => {
    const faces = facesOnce();

    expect(faces.length).toBeGreaterThan(150);

    faces.forEach(({ name, recipe }, i) => {
      const moods = i % 11 === 0 ? MOODS : ['determined'];

      for (const mood of moods) {
        expect(lettersMissing(recipe, mood), `${name} ${mood}`).toEqual([]);
      }
    });
  });

  it('shirt a side’s outfield players in one cloth and its keeper in another, with gloves', () => {
    const sides = Map.groupBy(PLAIN, ({ match, player }) => `${match.teams[player.team].id}`);

    for (const [side, members] of sides) {
      const faces = members.map(({ player, match, heroAge }) => ({
        keeper: player.role === 'keeper',
        recipe: recipeFor(portraitOf(player, { heroAge, match })),
      }));
      const outfield = new Set(faces.filter((face) => !face.keeper).map(clothOf));
      const keepers = faces.filter((face) => face.keeper);

      expect(outfield.size, side).toBeLessThanOrEqual(2);

      for (const keeper of keepers) {
        expect(outfield.has(clothOf(keeper)), side).toBe(false);
        expect(keeper.recipe.frontProps, side).toHaveLength(1);
      }
    }
  });

  it('show Chivorn in the final’s versus card in Royal Kids’ keeper green and gloves', () => {
    const { match } = storyMatch(0, 'ch1-final');
    const hero = match.players.find((player) => player.star === 'sochetra');
    const chivorn = match.sides[1][0];

    match.duel = {
      rounds: [
        {
          attacker: hero.index,
          defender: chivorn.index,
          kind: 'keeper',
          picked: { attack: null, defend: null },
          result: null,
        },
      ],
      stage: 'choose',
    };

    const show = Object.assign(createDuelShow(match, { heroAge: 'child' }), {
      stage: 'versus',
      stageTicks: 60,
    });
    const canvas = createPixelCanvas(768, 432);

    drawDuelShow(canvas.getContext('2d'), show, { lang: 'en', tick: 100 });

    const card = { x: PORTRAITS.defend.x * UNIT, y: PORTRAITS.defend.y * UNIT, size: 64 * UNIT };
    const colours = coloursIn(canvas, card);

    expect(colours.has(KITS['royal-kids'].keeper.shirt[2])).toBe(true);
    expect(colours.has(GLOVES.prop)).toBe(true);
    expect(colours.has(VILLAGER_SHIRTS.indigo.cloth)).toBe(false);
  });
});
