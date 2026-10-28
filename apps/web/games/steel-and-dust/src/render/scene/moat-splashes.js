import { drawFxFrame, fxFrameAt } from '../fx/fx-sheets.js';

function risesIn(span, summon) {
  const { kind, time, x } = summon;

  return kind === 'splash' && time > 0 && x >= span.from && x < span.to;
}

// the splashes of bodies fallen in this stretch of the moat, drawn with its water, behind the road
export function drawMoatSplashes(painter, span, { summons, sheets }) {
  for (const splash of summons.filter((summon) => risesIn(span, summon))) {
    drawFxFrame(painter, sheets, {
      name: 'splash',
      frame: fxFrameAt('splash', splash.time),
      x: splash.x,
      y: splash.y,
      scale: splash.scale,
    });
  }
}
