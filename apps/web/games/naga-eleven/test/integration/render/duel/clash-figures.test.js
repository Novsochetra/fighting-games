import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { FIGURE_ART, LOOK_ART } from '../../../../src/art/duel/looks.js';
import { BASIC_OPTIONS } from '../../../../src/data/duels.js';
import { MOVES } from '../../../../src/data/moves.js';
import { SPRITES } from '../../../../src/data/sprites.js';
import { createActorArt, loadSprites } from '../../../../src/render/actors/index.js';
import { looksOf } from '../../../../src/render/actors/looks.js';
import { drawAfterimage } from '../../../../src/render/duel/figure.js';
import { createDuelShow, drawDuelShow } from '../../../../src/render/duel/index.js';
import { UNIT } from '../../../../src/render/duel/layout.js';
import { createPen } from '../../../../src/render/duel/pen.js';
import { specialOption } from '../../../../src/sim/duel/options.js';
import { fakeMatch, startMeeting } from '../../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { decodePng } from '../../../support/png.js';
import { painted, strictContext } from './strict-context.js';

const GAME = fileURLToPath(new URL('../../../../', import.meta.url));

// the players from the game's own sheets, as the match draws them
const SHEETS = createActorArt({
  sprites: await loadSprites(SPRITES, {
    loadImage: async (path) => decodePng(readFileSync(GAME + path)),
  }),
  createCanvas: createPixelCanvas,
});

const optionOf = (id) =>
  MOVES[id] ? specialOption(MOVES[id]) : { ...BASIC_OPTIONS[id], move: null, cost: 0, power: 0 };

function decided({ attack, defend, word, side }) {
  const match = fakeMatch({ seed: 4 });

  Object.assign(match.players[3], { star: 'rithy' });
  startMeeting(match, { at: 840 });

  const round = match.duel.rounds[0];

  round.picked = { attack: optionOf(attack), defend: optionOf(defend) };
  round.result = { word, side };
  match.duel.stage = 'done';

  return createDuelShow(match, { heroAge: 'young' });
}

function drawClashAt(show, ticks, actors = SHEETS) {
  const { canvas, context, bad } = strictContext();

  for (const stageTicks of ticks) {
    Object.assign(show, { stage: 'clash', stageTicks, ticks: 200 + stageTicks });
    drawDuelShow(context, show, { tick: show.ticks, actors });
  }

  return { canvas, bad };
}

const hexOf = (canvas, at) =>
  `#${[0, 1, 2].map((i) => canvas.data[at + i].toString(16).padStart(2, '0')).join('')}`;

// the colours painted in a box of the art grid
function coloursIn(canvas, { left, top, right, bottom }) {
  const found = new Set();

  for (let y = top * UNIT; y < bottom * UNIT; y += 1) {
    for (let x = left * UNIT; x < right * UNIT; x += 1) {
      found.add(hexOf(canvas, (y * canvas.width + x) * 4));
    }
  }

  return found;
}

const wears = (colours, ramp) => ramp.some((hex) => colours.has(hex.toLowerCase()));

const PLAYS = [
  ['dribble', 'tackle', ['broke', 'attack'], ['stolen', 'defend']],
  ['pass', 'intercept', ['passed', 'attack'], ['cut', 'defend']],
  ['shoot', 'block', ['through', 'attack'], ['blocked', 'defend']],
  ['mirror-step', 'tackle', ['broke', 'attack'], ['stolen', 'defend']],
  ['hanuman-leap', 'iron-gate', ['broke', 'attack'], ['stolen', 'defend']],
  ['hwarang-charge', 'tackle', ['broke', 'attack'], ['stolen', 'defend']],
  ['samba-mirage', 'tackle', ['broke', 'attack'], ['stolen', 'defend']],
  ['apsara-curl', 'intercept', ['passed', 'attack'], ['cut', 'defend']],
  ['garuda-volley', 'steel-block', ['through', 'attack'], ['blocked', 'defend']],
];

describe('the clash from the sheets', { timeout: 20000 }, () => {
  it.each(PLAYS)('plays %s against %s both ways with no NaN', (attack, defend, ...results) => {
    for (const [word, side] of results) {
      const { canvas, bad } = drawClashAt(
        decided({ attack, defend, word, side }),
        [6, 30, 50, 54, 70, 90],
      );

      expect(bad, `${attack} ${word}`).toEqual([]);
      expect(painted(canvas)).toBe(true);
    }
  });

  it('draws each player in his own kit on his own side of the clash', () => {
    const show = decided({ attack: 'dribble', defend: 'tackle', word: 'broke', side: 'attack' });
    const round = show.duel.rounds[0];
    const looks = looksOf(show.match).players;
    const { canvas } = drawClashAt(show, [30]);
    const left = coloursIn(canvas, { left: 60, top: 50, right: 130, bottom: 118 });
    const right = coloursIn(canvas, { left: 170, top: 50, right: 240, bottom: 118 });

    expect(wears(left, looks[round.attacker].shirt)).toBe(true);
    expect(wears(right, looks[round.defender].shirt)).toBe(true);
    expect(wears(left, looks[round.defender].shirt)).toBe(false);
    expect(left.has(FIGURE_ART.body)).toBe(false);
  });

  it('prints the shirt number on the dribbler chest', () => {
    const show = decided({ attack: 'dribble', defend: 'tackle', word: 'broke', side: 'attack' });
    const look = looksOf(show.match).players[show.duel.rounds[0].attacker];
    const { canvas } = drawClashAt(show, [30]);

    expect(coloursIn(canvas, { left: 60, top: 50, right: 130, bottom: 118 })).toContain(
      look.numberColours.fill.toLowerCase(),
    );
  });

  it('draws the lit shadows while no sheets are loaded', () => {
    const show = decided({ attack: 'dribble', defend: 'tackle', word: 'broke', side: 'attack' });
    const looks = looksOf(show.match).players;
    const { canvas } = drawClashAt(show, [30], createActorArt({ createCanvas: createPixelCanvas }));
    const left = coloursIn(canvas, { left: 60, top: 40, right: 130, bottom: 118 });

    expect(left.has(FIGURE_ART.body)).toBe(true);
    expect(wears(left, looks[show.duel.rounds[0].attacker].shirt)).toBe(false);
  });
});

// the highest art row a ghost of the dribbler paints, and the colours it paints in
function ghost(cast) {
  const canvas = createPixelCanvas(768, 432);
  const pen = createPen(canvas.getContext('2d'), { unit: UNIT });
  const tint = LOOK_ART.mirror.body[2];

  drawAfterimage(pen, { pose: 'run', x: 100, y: 116, facing: 1, body: tint, alpha: 1, ...cast });

  const rows = [];

  for (let at = 3; at < canvas.data.length; at += 4) {
    if (canvas.data[at] > 0) {
      rows.push(Math.floor((at - 3) / 4 / canvas.width / UNIT));
    }
  }

  return {
    top: Math.min(...rows),
    colours: coloursIn(canvas, { left: 0, top: 0, right: 256, bottom: 144 }),
  };
}

describe('the afterimages of a move', () => {
  it('are his own frames in the move tint when given the clash', () => {
    const show = decided({
      attack: 'mirror-step',
      defend: 'tackle',
      word: 'broke',
      side: 'attack',
    });
    const sprite = ghost({ show, actors: SHEETS, side: 'attack' });
    const shadow = ghost({});

    expect(sprite.top).toBeGreaterThanOrEqual(116 - SPRITES.anchor.y - 1);
    expect(shadow.top).toBeLessThan(116 - SPRITES.anchor.y - 1);
    expect([...sprite.colours].filter((hex) => hex !== '#000000')).toEqual([
      LOOK_ART.mirror.body[2].toLowerCase(),
    ]);
  });
});
