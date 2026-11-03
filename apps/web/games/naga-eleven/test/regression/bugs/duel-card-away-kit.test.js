import { describe, expect, it } from 'vitest';
import { matchSidesFor, newSave, stageOf } from '../../../src/campaign/index.js';
import { CHAPTERS } from '../../../src/data/story/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { createDuelShow, drawDuelShow } from '../../../src/render/duel/index.js';
import { PORTRAITS, UNIT } from '../../../src/render/duel/layout.js';
import { portraitOf } from '../../../src/render/duel/portrait-card.js';
import { recipeFor } from '../../../src/render/portraits/cast/index.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// The versus card asked for a plain player's face without the match, so it fell back to his side's
// home kit: Korea's Woojin wore red on the card while his sprite wore Korea's white away shirt

function koreaMatch() {
  const chapter = 2;
  const index = CHAPTERS[chapter].stages.findIndex((stage) => stage.id === 'ch3-group-korea');
  const save = { ...newSave(), chapter, stage: index };
  const stage = stageOf(save, CHAPTERS, TEAMS);
  const teams = matchSidesFor(save, stage, TEAMS, CHAPTERS);

  return createMatch({ seed: 7, humanTeam: 0, format: stage.at.format, teams });
}

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

function versusCard(match, attacker, defender) {
  match.duel = {
    rounds: [{ attacker, defender, kind: 'field', picked: { attack: null, defend: null } }],
    stage: 'choose',
  };

  const show = Object.assign(createDuelShow(match, { heroAge: 'young' }), {
    stage: 'versus',
    stageTicks: 60,
  });
  const canvas = createPixelCanvas(768, 432);

  drawDuelShow(canvas.getContext('2d'), show, { lang: 'en', tick: 100 });

  const home = PORTRAITS.attack;

  return coloursIn(canvas, { x: home.x * UNIT, y: home.y * UNIT, size: 64 * UNIT });
}

const clothOf = (player, match) =>
  recipeFor(portraitOf(player, { mood: 'determined', heroAge: 'young', match })).palette.cloth;

describe('a plain player on the versus card', () => {
  it('wears the shirt his side has on in the match', () => {
    const match = koreaMatch();
    const korean = match.sides[1].find((player) => !player.star && player.role !== 'keeper');
    const hero = match.players.find((player) => player.star === 'sochetra');
    const away = clothOf(korean, match);
    const home = clothOf(korean, null);

    expect(away).not.toBe(home);

    const colours = versusCard(match, korean.index, hero.index);

    expect(colours.has(away)).toBe(true);
    expect(colours.has(home)).toBe(false);
  });
});
