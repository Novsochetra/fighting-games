import { NAGA_TIMINGS } from '../../sequence.js';
import { phaseOf } from '../../tracks/ease.js';
import { drawBallAura, drawBallGlint } from './aura.js';
import { powerOf, pourOf } from './beats.js';
import { drawRunDust } from './dust.js';
import { drawGlyphCircle, SEAL_MIDDLE } from './glyph.js';
import { drawPulledSparks, drawWindSwirl } from './inpull.js';
import { drawBallMotes, drawEmbers } from './motes.js';
import { drawOrbits } from './orbit.js';

const LIT = {
  charge: (clock) => phaseOf(clock.share, 0.08, 0.7),
  manifest: () => 1,
  impact: () => 1,
};

function glyphOf(clock) {
  const fade = clock.stage === 'impact' ? 1 - phaseOf(clock.ticks, NAGA_TIMINGS.contact, 8) : 1;

  return {
    lit: LIT[clock.stage]?.(clock) ?? 0,
    fade,
    spin: clock.frame * 0.012,
    beat: Math.floor(clock.frame / 4),
    flare: pourOf(clock) > 0.4,
  };
}

const shrinkOf = (clock) => 1 - pourOf(clock);

export function drawBuildBehind(pen, moment) {
  const { clock, ball } = moment;
  const power = powerOf(clock);
  const tick = clock.frame;

  if (clock.stage === 'awakening') {
    drawRunDust(pen, moment);

    return;
  }

  drawGlyphCircle(pen, glyphOf(clock));
  drawBallAura(pen, { ball, power: power * shrinkOf(clock), tick });
  drawOrbits(pen, { ball, power, tick, side: 'back', shrink: shrinkOf(clock) });
}

const MOTES_FROM = 0.3;

// while the Naga rises the ball only simmers, so the eye goes to the Naga
const CALM = { wind: 0.35, sparks: 0.3, embers: 34 };

export function drawBuildFront(pen, moment) {
  const { clock, ball } = moment;
  const power = powerOf(clock);
  const tick = clock.frame;

  if (clock.stage === 'awakening') {
    drawBallMotes(pen, {
      ball,
      tick,
      count: Math.round(6 * phaseOf(clock.share, MOTES_FROM, 0.5)),
    });

    return;
  }

  drawOrbits(pen, { ball, power, tick, side: 'front', shrink: shrinkOf(clock) });
  drawBallGlint(pen, { ball, power, tick });

  if (clock.stage === 'impact') {
    return;
  }

  const calm =
    clock.stage === 'manifest' ? CALM : { wind: power, sparks: power, embers: power * 14 };

  drawWindSwirl(pen, { ball, power: calm.wind, tick });
  drawPulledSparks(pen, { ball, power: calm.sparks, tick });
  drawEmbers(pen, {
    area: { x: SEAL_MIDDLE.x, y: SEAL_MIDDLE.y + 2, width: 92, height: 8 },
    tick,
    count: Math.round(calm.embers),
    life: 64,
  });
}
