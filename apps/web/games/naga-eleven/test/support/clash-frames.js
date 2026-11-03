import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { BASIC_OPTIONS } from '../../src/data/duels.js';
import { MOVES } from '../../src/data/moves.js';
import { SPRITES } from '../../src/data/sprites.js';
import { createActorArt, loadSprites } from '../../src/render/actors/index.js';
import { looksOf } from '../../src/render/actors/looks.js';
import { createDuelShow, drawDuelShow } from '../../src/render/duel/index.js';
import { UNIT } from '../../src/render/duel/layout.js';
import { specialOption } from '../../src/sim/duel/options.js';
import { fakeMatch, startMeeting } from './duel-fixtures.js';
import { createPixelCanvas } from './pixel-canvas.js';
import { decodePng } from './png.js';

const GAME = fileURLToPath(new URL('../../', import.meta.url));

// the players from the game's own sheets, as the match draws them
export const loadClashSheets = async () =>
  createActorArt({
    sprites: await loadSprites(SPRITES, {
      loadImage: async (path) => decodePng(readFileSync(GAME + path)),
    }),
    createCanvas: createPixelCanvas,
  });

const optionOf = (id) =>
  MOVES[id] ? specialOption(MOVES[id]) : { ...BASIC_OPTIONS[id], move: null, cost: 0, power: 0 };

// a field duel decided as asked, Sochetra (team 0) on the ball at a star of team 1, with a mate of
// his named Rithy for a duo
export function decidedClash({ attack, defend, word, side }) {
  const match = fakeMatch({ seed: 4 });

  Object.assign(match.players[3], { star: 'rithy' });
  startMeeting(match, { at: 840 });

  const round = match.duel.rounds[0];

  round.picked = { attack: optionOf(attack), defend: optionOf(defend) };
  round.result = { word, side };
  match.duel.stage = 'done';

  return createDuelShow(match, { heroAge: 'young' });
}

// the clash `stageTicks` in, drawn from the sheets on a canvas of the art grid at UNIT
export function drawClashFrame(show, stageTicks, actors) {
  const canvas = createPixelCanvas(768, 432);

  Object.assign(show, { stage: 'clash', stageTicks, ticks: 200 + stageTicks });
  drawDuelShow(canvas.getContext('2d'), show, { tick: show.ticks, actors });

  return canvas;
}

const hexAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;

  return `#${[0, 1, 2].map((i) => canvas.data[at + i].toString(16).padStart(2, '0')).join('')}`;
};

// the art pixels of a frame painted in any colour of a ramp, as [x, y] on the art grid
export function artPixelsIn(canvas, ramp) {
  const wanted = new Set(ramp.map((hex) => hex.toLowerCase()));
  const found = [];

  for (let y = 0; y < canvas.height / UNIT; y += 1) {
    for (let x = 0; x < canvas.width / UNIT; x += 1) {
      if (wanted.has(hexAt(canvas, x * UNIT + 1, y * UNIT + 1))) {
        found.push([x, y]);
      }
    }
  }

  return found;
}

// the shirt colours of the player a side sends into the round
export function shirtOf(show, side) {
  const round = show.duel.rounds[0];

  return looksOf(show.match).players[side === 'attack' ? round.attacker : round.defender].shirt;
}
