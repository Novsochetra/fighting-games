import { describe, expect, it } from 'vitest';
import { HEAD_ROOM, PROMPT_ROOM, titleSpots } from '../../../../src/ui/screens/title-spots.js';
import {
  clashesOf,
  IPHONE_SIDEWAYS,
  IPHONE_UPRIGHT,
  NO_INSETS,
  stageFor,
} from '../../../support/title-stage.js';

const SIZES = [
  { name: 'a phone held sideways', width: 844, height: 390 },
  { name: 'a small phone held sideways', width: 667, height: 375 },
  { name: 'an iPhone held sideways', width: 844, height: 390, safe: IPHONE_SIDEWAYS },
  { name: 'an upright phone', width: 390, height: 844 },
  { name: 'an upright phone with touch controls', width: 390, height: 844, touch: true },
  { name: 'an upright iPhone', width: 390, height: 844, touch: true, safe: IPHONE_UPRIGHT },
  { name: 'a laptop', width: 1280, height: 800 },
  { name: 'a big screen', width: 1600, height: 1000 },
  { name: 'a wide window', width: 1600, height: 700 },
  { name: 'a tablet held sideways', width: 1366, height: 1024, touch: true },
];

function spotsAt({ width, height, touch, safe = NO_INSETS }) {
  const stage = stageFor({ width, height, touch, safe });

  return { stage, spots: titleSpots({ stage, screen: { width, height }, safe }) };
}

describe('where the title’s words stand', () => {
  it.each(SIZES)('keep clear of the Naga and the boy on $name', (size) => {
    const { stage, spots } = spotsAt(size);

    expect(clashesOf(spots, stage)).toEqual({ logoOnNaga: false, promptOnBoy: false });
    expect(spots.head.height).toBeGreaterThanOrEqual(HEAD_ROOM);
    expect(spots.prompt.height).toBeGreaterThanOrEqual(PROMPT_ROOM);
  });

  it.each(SIZES)('stay inside the screen’s safe area on $name', (size) => {
    const { spots } = spotsAt(size);
    const safe = size.safe ?? NO_INSETS;

    for (const spot of [spots.head, spots.prompt]) {
      expect(spot.x).toBeGreaterThanOrEqual(safe.left);
      expect(spot.y).toBeGreaterThanOrEqual(safe.top);
      expect(spot.x + spot.width).toBeLessThanOrEqual(size.width - safe.right);
      expect(spot.y + spot.height).toBeLessThanOrEqual(size.height - safe.bottom);
    }
  });

  it('puts the logo in the art’s sky held sideways, and the prompt under the stage when it can', () => {
    expect(spotsAt({ width: 1280, height: 800 }).spots.head.place).toBe('sky');
    expect(spotsAt({ width: 1280, height: 800 }).spots.prompt.place).toBe('below');
    expect(spotsAt({ width: 1280, height: 720 }).spots.prompt.place).toBe('feet');
  });

  it('stands the prompt past the ball where the causeway under the boy is too low', () => {
    const { stage, spots } = spotsAt({ width: 844, height: 390 });

    expect(spots.prompt.place).toBe('beside');
    expect(spots.prompt.x).toBeGreaterThan(stage.x + stage.width / 2);
  });

  it('stands the logo over an upright stage, or under it when the stage keeps the top', () => {
    const centred = spotsAt({ width: 390, height: 844 });
    const atTop = spotsAt({ width: 390, height: 844, touch: true });

    expect(centred.spots.head.place).toBe('above');
    expect(centred.spots.head.y + centred.spots.head.height).toBeLessThan(centred.stage.y);
    expect(atTop.spots.head.place).toBe('below');
    expect(atTop.spots.head.y).toBeGreaterThan(atTop.stage.y + atTop.stage.height);
    expect(atTop.spots.prompt.y).toBeGreaterThanOrEqual(
      atTop.spots.head.y + atTop.spots.head.height,
    );
  });

  it('takes the tallest room there is when none is enough', () => {
    const { spots } = spotsAt({ width: 400, height: 225 });

    expect(spots.head.place).toBe('sky');
    expect(spots.head.height).toBeGreaterThan(0);
  });
});
