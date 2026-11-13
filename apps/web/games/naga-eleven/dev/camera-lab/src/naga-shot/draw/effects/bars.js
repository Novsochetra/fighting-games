import { drawBars } from '../../../../../../src/render/duel/bars.js';
import { createPen } from '../../../../../../src/render/duel/pen.js';
import { easeInOut, phaseOf } from '../../tracks/ease.js';

const HELD = () => 1;

const AMOUNTS = {
  charge: (clock) => easeInOut(phaseOf(clock.share, 0.1, 0.7)),
  manifest: HELD,
  impact: HELD,
  flight: HELD,
  keeper: HELD,
  collision: HELD,
  aftermath: (clock) => 1 - easeInOut(phaseOf(clock.share, 0.55, 0.4)),
};

// the duel's own bars, drawn on its grid of three of the lab's pixels to an art pixel
export function drawLetterbox(context, { clock, settings }) {
  const amount = settings.camera === 'off' ? 0 : (AMOUNTS[clock.stage]?.(clock) ?? 0);

  drawBars(createPen(context, { unit: 3 }), amount);
}
