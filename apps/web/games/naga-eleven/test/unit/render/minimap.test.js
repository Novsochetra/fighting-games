import { describe, expect, it } from 'vitest';
import { MINIMAP } from '../../../src/art/venues/minimap.js';
import { KITS } from '../../../src/art/kits.js';
import { colourGap, matchKits } from '../../../src/render/actors/kit-clash.js';
import { drawMinimap } from '../../../src/render/minimap.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { createRecordingContext } from '../../support/recording-context.js';

const RECT = { x: 20, y: 300, width: 140, height: 86 };

const colourAt = (canvas, { x, y }) =>
  `#${[0, 1, 2].map((i) => canvas.data[(y * canvas.width + x) * 4 + i].toString(16).padStart(2, '0')).join('')}`;

// a dot is 3 pixels square inside the panel's 2 pixel frame
function spotOf(match, point) {
  return {
    x: Math.round(RECT.x + 2 + (point.x / match.pitch.length) * (RECT.width - 7)),
    y: Math.round(RECT.y + 2 + (point.y / match.pitch.width) * (RECT.height - 7)),
  };
}

describe('the minimap', () => {
  for (const format of ['7', '11']) {
    it(`shows every player of a ${format} a side in their shirt's colour, and the ball`, () => {
      const match = createMatch({ seed: 3, format, humanTeam: 0 });
      const canvas = createPixelCanvas(768, 432);
      const kits = matchKits(match);

      drawMinimap(canvas.getContext('2d'), match, RECT);

      for (const player of match.players.filter(
        (each) => each.role !== 'keeper' && each.index !== match.controlled,
      )) {
        expect(colourAt(canvas, spotOf(match, player))).toBe(kits[player.team].outfield.shirt[2]);
      }

      expect(colourAt(canvas, spotOf(match, match.ball))).toBe('#ffffff');
    });
  }

  it('rings the player being steered, blinking, and draws nothing at NaN', () => {
    const match = createMatch({ seed: 3, format: '11', humanTeam: 0 });
    const { context, calls } = createRecordingContext();

    drawMinimap(context, match, RECT);

    const steered = spotOf(match, match.players[match.controlled]);
    const rings = calls.filter((call) => call.name === 'fillRect' && call.args[2] === 7);

    expect(rings).toHaveLength(1);
    expect(rings[0].args.slice(0, 2)).toEqual([steered.x - 2, steered.y - 2]);
    expect(
      calls
        .flatMap((call) => call.args)
        .filter((arg) => typeof arg === 'number')
        .every(Number.isFinite),
    ).toBe(true);
  });

  // Phnom Penh Elite's black shirts, edged in black, sank into the dark grass
  it('edges a dark shirt in light, and a bright one in dark', () => {
    const match = createMatch({ seed: 3, format: '11', humanTeam: 0 });
    const canvas = createPixelCanvas(768, 432);
    const edgeOf = (player) => {
      const spot = spotOf(match, player);

      return colourAt(canvas, { x: spot.x - 1, y: spot.y - 1 });
    };
    const outfield = (team) =>
      match.players.find((each) => each.team === team && each.role === 'forward');

    match.teams = [{ kit: 'kampong-cham-high' }, { kit: 'phnom-penh-elite' }];
    drawMinimap(canvas.getContext('2d'), match, RECT);

    expect(edgeOf(outfield(1))).toBe(MINIMAP.halo);
    expect(edgeOf(outfield(0))).toBe(MINIMAP.outline);
  });

  // a village side in green sank into the green radar: its pitch is now a dark, grey green
  it('shows a green shirt clearly on its pitch', () => {
    const green = KITS['neighbor-village'].home.shirt[2];

    for (const grass of MINIMAP.grass) {
      expect(colourGap(green, grass)).toBeGreaterThan(200);
    }
  });
});
