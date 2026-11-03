import { describe, expect, it } from 'vitest';
import { FULL_FRAME } from '../../../src/art/dialogue/frame.js';
import { CHARACTERS } from '../../../src/data/characters.js';
import { sceneLayout } from '../../../src/render/dialogue/layout.js';
import { ART, mapWidth } from '../../../src/render/dialogue/pixel-map.js';
import { plateRect } from '../../../src/render/dialogue/plate.js';
import { textOf } from '../../../src/render/text.js';

// In a full-screen scene the speaker's name plate lay across the foot of their portrait, where
// Dara's keeper's gloves and Ta Sok's krama are drawn: it cut the gloves in half and hid the krama.
// The plate stands beside the speaker on the box's edge, and the portrait shows down to the edge.

// Silkscreen's bold capitals at 16 px are about this wide; Khmer letters are narrower, so a Khmer
// name comes out longer here than on screen
const LETTER = 14;
const context = { measureText: (text) => ({ width: [...text].length * LETTER }) };

const SIDES = ['left', 'right'];
// the longest name a line of the story gives its speaker
const LONGEST_LINE_NAMES = ['Riverside coach', 'គ្រូបង្វឹកសាលាមាត់ទន្លេ'];

const overlaps = (one, other) =>
  one.x < other.x + other.width &&
  one.x + one.width > other.x &&
  one.y < other.y + other.height &&
  one.y + one.height > other.y;

function crest(box) {
  const width = mapWidth(FULL_FRAME.crest) * ART;
  const x = box.x + Math.floor((box.width / ART - mapWidth(FULL_FRAME.crest)) / 2) * ART;

  return { x, y: 0, width, height: box.y + 16 };
}

const portraitRect = ({ portrait }) => ({
  x: portrait.x,
  y: portrait.y,
  width: portrait.size,
  height: portrait.size,
});

describe('a full-screen scene’s name plate', () => {
  it('leaves Dara’s gloves and Ta Sok’s krama in view, on either side, in either language', () => {
    for (const id of ['dara', 'ta-sok']) {
      for (const lang of ['en', 'km']) {
        for (const side of SIDES) {
          const layout = sceneLayout(side);
          const plate = plateRect(context, textOf(CHARACTERS[id].name, lang), layout.plate);

          expect(overlaps(plate, portraitRect(layout)), `${id} ${lang} ${side}`).toBe(false);
        }
      }
    }
  });

  it('shows the foot of a portrait down to the box’s edge, where hands and scarves are drawn', () => {
    for (const side of SIDES) {
      const { portrait, box } = sceneLayout(side);

      expect(portrait.y + portrait.size - box.y).toBeLessThanOrEqual(4);
      expect(portrait.y + portrait.size).toBeGreaterThan(box.y);
    }
  });

  it('never runs into the crest, however long the name', () => {
    const names = Object.values(CHARACTERS).flatMap((character) => [
      textOf(character.name, 'en'),
      textOf(character.name, 'km'),
    ]);

    for (const side of SIDES) {
      const layout = sceneLayout(side);

      for (const name of [...names, ...LONGEST_LINE_NAMES]) {
        expect(overlaps(plateRect(context, name, layout.plate), crest(layout.box)), name).toBe(
          false,
        );
      }
    }
  });
});
