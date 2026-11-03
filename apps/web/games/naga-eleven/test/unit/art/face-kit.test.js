import { describe, expect, it } from 'vitest';
import { COVERING_GEAR, KIT_FACES, KIT_GEAR, KIT_HAIR } from '../../../src/art/face-kit/index.js';
import { LEGEND } from '../../../src/render/portraits/legend.js';
import { decodePart } from '../../../src/render/portraits/kit/decode.js';

const MOODS = ['shout', 'grin', 'hurt', 'angry', 'surprised', 'calm'];
const FACE_LETTERS = new Set([
  'O',
  '1',
  '2',
  '3',
  '4',
  'w',
  'i',
  'l',
  'm',
  't',
  'A',
  'B',
  'C',
  'D',
]);
const HAIR_LETTERS = new Set(['O', 'H', 'h', 'g', 'k']);
const GEAR_LETTERS = new Set(['O', 'W', 'E', 'F', 'G']);

const PARTS = [
  ...Object.entries(KIT_FACES).flatMap(([face, moods]) =>
    Object.entries(moods).map(([mood, text]) => [`${face} ${mood}`, text, FACE_LETTERS]),
  ),
  ...Object.entries(KIT_HAIR).map(([name, text]) => [name, text, HAIR_LETTERS]),
  ...Object.entries(KIT_GEAR).map(([name, text]) => [name, text, GEAR_LETTERS]),
];

describe('the face kit', () => {
  it('has every face in every mood, and a neutral face for all but the child', () => {
    for (const [face, moods] of Object.entries(KIT_FACES)) {
      const wanted = face === 'child' ? MOODS : ['neutral', ...MOODS];

      expect(Object.keys(moods).sort(), face).toEqual(wanted.sort());
    }
  });

  it.each(PARTS)('has %s as whole rows of its own letters', (name, text, letters) => {
    const part = decodePart(text);

    expect(part.cells).toHaveLength(part.width * part.height);
    expect(part.cells.filter(Boolean).every((cell) => letters.has(cell))).toBe(true);
    expect([...letters].every((letter) => LEGEND[letter])).toBe(true);
  });

  // a hairstyle that only grows at the back, like the receding one, has the skull's middle
  // outside its own box; a face never does
  it.each(PARTS.filter(([, , letters]) => letters === FACE_LETTERS))(
    'stands the %s face on a skull top inside its width',
    (name, text) => {
      const { width, anchor } = decodePart(text);

      expect(anchor.x).toBeGreaterThan(0);
      expect(anchor.x).toBeLessThan(width);
    },
  );

  it('knows which of its hats cover the hair', () => {
    expect([...COVERING_GEAR].every((gear) => KIT_GEAR[gear])).toBe(true);
  });
});
