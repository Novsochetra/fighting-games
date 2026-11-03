import { WORD_RAMPS } from '../../art/duel/palette.js';
import { toCanvas, ART } from '../duel/layout.js';
import { drawOutlinedText } from '../duel/outlined-text.js';
import { drawPixelWord } from '../duel/pixel-word.js';
import { RESULT_WORDS } from '../duel/words.js';
import { contactTick } from './timing.js';

// in open play the cam calls out a save or a miss itself; a goal it leaves to the goal's own
// banner, which comes straight after
export function drawCamWord(pen, cam, { lang }) {
  const since = cam.ticks - contactTick() - 14;
  const entry = cam.moment.result === 'goal' ? null : RESULT_WORDS[cam.moment.result];

  if (!entry || since < 0) {
    return;
  }

  const size = 4 + Math.max(0, 3 - since);

  entry.lines.forEach((line, i) => {
    drawPixelWord(pen, {
      text: line,
      x: ART.width / 2,
      y: 20 + i * (size * 7 + 3),
      size,
      ramp: WORD_RAMPS[entry.ramp],
    });
  });

  if (lang === 'km') {
    drawOutlinedText(pen.context, entry.km, {
      x: pen.origin.x + toCanvas(ART.width / 2),
      y: pen.origin.y + toCanvas(24 + entry.lines.length * (size * 7 + 3)),
      color: WORD_RAMPS[entry.ramp][1],
    });
  }
}
