import { DIALOGUE } from '../../art/dialogue/palette.js';
import { drawLineText } from './dialogue-text.js';
import { drawFrame } from './frame.js';
import { speakerName } from './names.js';
import { drawNamePlate } from './plate.js';
import { drawNextArrow } from './cues.js';

export function drawSpeech(context, line, { layout, lang, tick, characters }) {
  drawFrame(context, layout.box, layout.frame);
  drawNamePlate(context, speakerName(line, { lang, characters }), layout.plate);
  drawLineText(context, line, {
    area: layout.text,
    color: DIALOGUE.text,
    shadow: DIALOGUE.textShadow,
  });

  if (line.typed) {
    drawNextArrow(context, layout.arrow, tick);
  }
}
