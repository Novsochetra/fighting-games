import { rect } from '../kit/raster.js';
import { LETTER_HEIGHT, paintWord, wordWidth } from '../kit/tiny-font.js';

// the boards round a pitch: a run of panels, each an advert of a colour and a word, framed top and
// bottom and standing on its shadow; `shout` swaps every panel for one word, as an LED board does
// for a goal. Its letters are drawn two pixels to a pixel, big enough to read by the footballers
const LETTERS = 2;

function paintPanel(raster, { x, y, width, height }, ad) {
  const scale = wordWidth(ad.text, LETTERS) > width - 8 ? 1 : LETTERS;
  const left = x + Math.floor((width - wordWidth(ad.text, scale)) / 2);

  rect(raster, { x, y, width, height }, ad.back);
  rect(raster, { x, y: y + height - 3, width, height: 3 }, ad.shade ?? ad.back);
  paintWord(raster, ad.text, {
    x: left,
    y: y + Math.floor((height - LETTER_HEIGHT * scale) / 2) - 1,
    colour: ad.ink,
    scale,
  });
}

export function paintBoards(
  raster,
  { ads, frame: frameColour, panel = 150, height = 20, shout = null },
) {
  const top = raster.height - height - 3;

  rect(raster, { x: 0, y: top - 2, width: raster.width, height: height + 4 }, frameColour);

  for (let x = 0, i = 0; x < raster.width; x += panel, i += 1) {
    paintPanel(
      raster,
      { x: x + 2, y: top, width: panel - 4, height },
      shout ?? ads[i % ads.length],
    );
  }

  rect(raster, { x: 0, y: raster.height - 1, width: raster.width, height: 1 }, frameColour);
}
