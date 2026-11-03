import { describe, expect, it } from 'vitest';
import { EYE_CODE, OUTLINE_CODE } from '../../../../src/render/actors/figure/buffer.js';
import {
  drawnDirections,
  FIGURE_SPRITES,
} from '../../../../src/render/actors/figure/figure-sprites.js';
import { figureFrame } from '../../../../src/render/actors/figure/frames.js';

const allFrames = () =>
  Object.entries(FIGURE_SPRITES.animations).flatMap(([animation, { frames }]) =>
    drawnDirections(animation).flatMap(({ direction }) =>
      Array.from({ length: frames }, (_, frame) => ({ animation, direction, frame })),
    ),
  );

function paintedRows(buffer) {
  const rows = [];

  for (let y = 0; y < buffer.height; y += 1) {
    if (buffer.codes.subarray(y * buffer.width, (y + 1) * buffer.width).some((code) => code > 0)) {
      rows.push(y);
    }
  }

  return rows;
}

const edgeCodes = ({ codes, width, height }) => [
  ...codes.subarray(0, width),
  ...codes.subarray((height - 1) * width),
  ...Array.from({ length: height }, (_, y) => codes[y * width]),
  ...Array.from({ length: height }, (_, y) => codes[y * width + width - 1]),
];

describe('the block figure', () => {
  it('fits every frame of every animation inside its frame, outline and all', () => {
    for (const { animation, direction, frame } of allFrames()) {
      const buffer = figureFrame(animation, direction, frame);

      expect(
        edgeCodes(buffer).every((code) => code === 0),
        `${animation} ${direction} ${frame}`,
      ).toBe(true);
    }
  });

  it('stands with its boots on the ground point, the anchor, the near one a little nearer', () => {
    for (const direction of ['south', 'east', 'north']) {
      const rows = paintedRows(figureFrame('idle', direction, 0));

      expect(rows.at(-1) - FIGURE_SPRITES.anchor.y).toBeGreaterThanOrEqual(0);
      expect(rows.at(-1) - FIGURE_SPRITES.anchor.y).toBeLessThanOrEqual(2);
      expect(rows.at(-1) - rows[0] + 1).toBeGreaterThanOrEqual(FIGURE_SPRITES.standHeight - 1);
    }
  });

  it('outlines what it paints', () => {
    const { codes } = figureFrame('run', 'east', 2);

    expect(codes.filter((code) => code === OUTLINE_CODE).length).toBeGreaterThan(40);
  });

  it('shows its eyes facing the camera and the back of its head facing away', () => {
    expect(figureFrame('idle', 'south', 0).codes.filter((code) => code === EYE_CODE)).toHaveLength(
      2,
    );
    expect(figureFrame('idle', 'east', 0).codes.filter((code) => code === EYE_CODE)).toHaveLength(
      1,
    );
    expect(figureFrame('idle', 'north', 0).codes.includes(EYE_CODE)).toBe(false);
  });

  it('works a frame out once and keeps it', () => {
    expect(figureFrame('kick', 'east', 1)).toBe(figureFrame('kick', 'east', 1));
  });

  it('lies low when floored and stands tall when it celebrates', () => {
    const lying = paintedRows(figureFrame('fall', 'east', 2));
    const jumping = paintedRows(figureFrame('celebrate', 'south', 1));

    expect(lying.at(-1) - lying[0]).toBeLessThan(FIGURE_SPRITES.standHeight * 0.45);
    expect(jumping[0]).toBeLessThan(paintedRows(figureFrame('idle', 'south', 0))[0]);
  });
});
