import {
  NUMBER_COLOURS,
  NUMBER_INKS,
  PLAIN_NUMBER_COLOURS,
  SPARE_NUMBER_COLOURS,
} from '../../art/shirt-numbers.js';

const channelsOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

const linear = (value) => {
  const share = value / 255;

  return share <= 0.03928 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
};

export function luminanceOf(hex) {
  const [red, green, blue] = channelsOf(hex).map(linear);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

// as the web's accessibility guidelines measure it: 1 for the same colour, 21 for black on white
export function contrastRatio(first, second) {
  const [lighter, darker] = [luminanceOf(first), luminanceOf(second)].sort(
    (one, other) => other - one,
  );

  return (lighter + 0.05) / (darker + 0.05);
}

export const shirtBaseOf = (shirt) => shirt[Math.min(2, shirt.length - 1)];

const SPARE = /^keeper-(\d+)$/;
const PLAIN = /^plain-(\d+)$/;

function namedFill(kitId, choice) {
  const spare = SPARE.exec(choice);

  if (spare) {
    return SPARE_NUMBER_COLOURS[Number(spare[1])];
  }

  const plain = PLAIN.exec(kitId);

  return plain ? PLAIN_NUMBER_COLOURS[Number(plain[1])]?.[choice] : NUMBER_COLOURS[kitId]?.[choice];
}

// the colour a kit's numbers are printed in, by its id and which of its shirts is worn ('home',
// 'away', 'keeper' or a spare's 'keeper-<n>'); a kit with none named takes the ink that reads
export function numberFillOf(kitId, choice, shirt) {
  const base = shirtBaseOf(shirt);
  const { light, dark } = NUMBER_INKS;

  return (
    namedFill(kitId, choice) ??
    (contrastRatio(light, base) >= contrastRatio(dark, base) ? light : dark)
  );
}

// the outline is the shirt's own deepest shade round a pale number, its lightest round a dark one,
// so the number sits in the cloth, not on a patch
export function numberColoursOf(fill, shirt) {
  const isPale = luminanceOf(fill) > luminanceOf(shirtBaseOf(shirt));
  const edge = isPale ? shirt[0] : shirt[shirt.length - 1];

  return { fill, edge, key: `${fill}${edge}` };
}
