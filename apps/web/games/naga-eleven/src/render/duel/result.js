import { WORD_RAMPS } from '../../art/duel/palette.js';
import { drawSaveCamOn } from '../save-cam/index.js';
import { BLOWN_WORD_AFTER, drawBlownAway, isBlownAway } from './blown.js';
import { drawClash } from './clash.js';
import { easeOut, phaseOf } from './hash.js';
import { ART, toCanvas } from './layout.js';
import { drawOutlinedText } from './outlined-text.js';
import { drawPixelWord, wordWidth } from './pixel-word.js';
import { polygon } from './shapes.js';
import { shownRound } from './show.js';
import { RESULT_WORDS } from './words.js';

const MOST_WIDTH = 236;

const sizeFor = (lines) =>
  Math.min(7, ...lines.map((line) => Math.floor(MOST_WIDTH / (wordWidth(line, 1) + 1))));

// a slanted band of the word's colour sweeps across behind it
function banner(pen, { ramp, top, height, share }) {
  const reach = ART.width * easeOut(share);

  polygon(
    pen,
    [
      [0, top + 6],
      [reach, top - 2],
      [reach, top + height - 6],
      [0, top + height + 2],
    ],
    ramp[4],
  );
  polygon(
    pen,
    [
      [0, top + 8],
      [reach, top],
      [reach, top + height - 8],
      [0, top + height],
    ],
    ramp[3],
  );
}

function word(pen, { entry, ticks }) {
  const ramp = WORD_RAMPS[entry.ramp];
  const settled = sizeFor(entry.lines);
  const size = settled + Math.max(0, 5 - ticks);
  const lineHeight = size * 7 + 4;
  const height = lineHeight * entry.lines.length;
  const top = Math.round(66 - height / 2);
  const tremble = ticks < 14 ? (ticks % 2) * 2 - 1 : 0;

  banner(pen, { ramp, top: top - 6, height: height + 8, share: phaseOf(ticks, 0, 8) });
  entry.lines.forEach((line, i) => {
    drawPixelWord(pen, {
      text: line,
      x: ART.width / 2 + tremble,
      y: top + i * lineHeight,
      size,
      ramp,
    });
  });

  return top + height;
}

export function drawResult(pen, show, options) {
  const entry = RESULT_WORDS[shownRound(show).result.word];
  const ticks = show.stage === 'result' ? show.stageTicks : 99;

  if (show.saveCam) {
    drawSaveCamOn(pen, show.saveCam, options);
  } else if (isBlownAway(show)) {
    drawBlownAway(pen, show, options);
  } else {
    drawClash(pen, show, options);
  }

  const wordTicks = isBlownAway(show) ? ticks - BLOWN_WORD_AFTER : ticks;

  if (!entry || wordTicks < 0) {
    return;
  }

  const bottom = word(pen, { entry, ticks: wordTicks });

  if (options.lang === 'km') {
    drawOutlinedText(pen.context, entry.km, {
      x: pen.origin.x + toCanvas(ART.width / 2),
      y: pen.origin.y + toCanvas(bottom + 4),
      color: WORD_RAMPS[entry.ramp][1],
    });
  }
}
