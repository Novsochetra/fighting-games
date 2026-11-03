import { describe, expect, it } from 'vitest';
import { MOVES } from '../../../../src/data/moves.js';
import {
  drawSpiritGauge,
  GAUGE,
  isSpecialReady,
  readyKeyOf,
  spiritShare,
} from '../../../../src/render/hud/spirit-gauge.js';
import { createRecordingContext } from '../../../support/recording-context.js';

describe('the spirit gauge', () => {
  it('fills by the share of spirit held', () => {
    expect(spiritShare({ spirit: 25, spiritMax: 100 })).toBe(0.25);
    expect(spiritShare({ spirit: 130, spiritMax: 100 })).toBe(1);
    expect(spiritShare({ spirit: 5, spiritMax: 0 })).toBe(0);
  });

  it('glows once the gauge holds what the cheapest of the player moves costs', () => {
    const moves = ['naga-shot', 'power-shot'];
    const cheapest = Math.min(...moves.map((id) => MOVES[id].cost));

    expect(isSpecialReady({ moves, spirit: cheapest - 1 })).toBe(false);
    expect(isSpecialReady({ moves, spirit: cheapest })).toBe(true);
    expect(isSpecialReady({ moves: [], spirit: 100 })).toBe(false);
  });

  it("counts the player's own skill, and none while he waits out his last", () => {
    const player = { moves: [], skill: 'apsara-curl', spirit: MOVES['apsara-curl'].cost };

    expect(isSpecialReady(player)).toBe(true);
    expect(isSpecialReady({ ...player, cooldown: 40 })).toBe(false);
    expect(isSpecialReady({ ...player, spirit: player.spirit - 1 })).toBe(false);
  });

  it('names the key for what is ready, the shot first, and none for what fires by itself', () => {
    expect(readyKeyOf({ moves: ['naga-shot'], skill: null, spirit: 99 })).toBe('SHOOT');
    expect(readyKeyOf({ moves: [], skill: 'kite-cross', spirit: 99 })).toBe('PASS');
    expect(readyKeyOf({ moves: ['hanuman-leap'], skill: null, spirit: 99 })).toBe('RUN');
    expect(readyKeyOf({ moves: ['hanuman-leap', 'naga-shot'], spirit: 99 })).toBe('SHOOT');
    expect(readyKeyOf({ moves: [], skill: 'bayon-eyes', spirit: 99 })).toBeNull();
    expect(readyKeyOf({ moves: ['naga-shot'], spirit: 1 })).toBeNull();
  });

  it('notches the gauge at what each move costs', () => {
    const { context, calls } = createRecordingContext();
    const player = { moves: ['naga-shot', 'garuda-volley'], spirit: 45, spiritMax: 100 };

    context.measureText = (text) => ({ width: [...text].length * 5 });
    drawSpiritGauge(context, player, { x: 100, y: 50, tick: 0 });

    const notches = calls
      .filter((call) => call.name === 'fillRect' && call.args[1] === 47 && call.args[2] === 1)
      .map((call) => call.args[0]);

    expect(notches).toEqual([40, 50].map((cost) => Math.round(100 + (GAUGE.width * cost) / 100)));
  });
});
