import { anchorFor, numberAnchorsOf } from './number-anchors.js';
import { bakeNumberAtlas } from './number-atlas.js';
import { STAMP } from './number-stamp.js';

const hasNumber = (number) => Number.isFinite(number) && number > 0;

// a number's atlas is kept by its colours and digits, so two players never share one by mistake
// and a frame makes no new one once the match has started
function atlasOf(art, { number, colours }) {
  const anchors = numberAnchorsOf(art);

  if (!anchors || !colours || !hasNumber(number)) {
    return null;
  }

  art.numbers ??= new Map();

  const key = `${colours.key}:${number}`;

  if (!art.numbers.has(key)) {
    const { variants } = anchors;

    art.numbers.set(key, bakeNumberAtlas(art.createCanvas, { number, colours, variants }));
  }

  return art.numbers.get(key);
}

// paints every number a match's players wear before it starts, with the look each wears
export function prepareNumbers(art, { players, looks }) {
  players.forEach((player, i) =>
    atlasOf(art, { number: player.number, colours: looks[i]?.numberColours }),
  );
}

// the number on the frame just drawn at left, top (`at`: the frame's animation name, row,
// mirroring and frame index), one image drawn from the atlas: nothing is painted pixel by pixel
export function drawShirtNumber(context, art, { look, number, at, left, top }) {
  const anchor = anchorFor(numberAnchorsOf(art), at);
  const atlas = anchor && atlasOf(art, { number, colours: look.numberColours });

  if (!atlas) {
    return;
  }

  const { width, height } = STAMP;

  context.drawImage(
    atlas,
    anchor.variant * width,
    0,
    width,
    height,
    left + anchor.x,
    top + anchor.y,
    width,
    height,
  );
}
