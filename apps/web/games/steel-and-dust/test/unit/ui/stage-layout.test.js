import { describe, expect, it } from 'vitest';
import {
  arrangeStage,
  isPortrait,
  stickRestPosition,
} from '../../../src/ui/screen/stage-layout.js';

const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const screen = (width, height, more = {}) => ({
  width,
  height,
  safe: noInsets,
  touch: true,
  buttonScale: 1,
  hinge: null,
  ...more,
});
const bottomOf = (rect) => rect.y + rect.height;

describe('stage layout', () => {
  it('letterboxes the 16:9 screen in landscape', () => {
    expect(arrangeStage(screen(1000, 400, { touch: false }))).toEqual({
      rect: { x: 144, y: 0, width: 711, height: 400 },
      controlsBelow: false,
    });
  });

  it('stands the screen at the top of an upright phone, under the status bar, over the buttons', () => {
    const { rect, controlsBelow } = arrangeStage(
      screen(390, 844, { safe: { ...noInsets, top: 47 } }),
    );

    expect(controlsBelow).toBe(true);
    expect(rect).toEqual({ x: 0, y: 47, width: 390, height: 219 });
  });

  it('keeps the touch buttons over the fight on a phone held sideways', () => {
    expect(arrangeStage(screen(844, 390))).toEqual(
      arrangeStage(screen(844, 390, { touch: false })),
    );
    expect(arrangeStage(screen(844, 390)).controlsBelow).toBe(false);
  });

  it('moves the touch buttons under the stage on an unfolded foldable', () => {
    const letterboxed = arrangeStage(screen(1104, 884, { touch: false })).rect;
    const { rect, controlsBelow } = arrangeStage(screen(1104, 884));

    expect(controlsBelow).toBe(true);
    expect(rect.width).toBeGreaterThanOrEqual(letterboxed.width * 0.8);
    expect(bottomOf(rect)).toBeLessThanOrEqual(884 - 260);
    expect(rect.x).toBe(Math.floor((1104 - rect.width) / 2));
  });

  it('keeps the buttons over a tablet held sideways, where moving them would shrink the stage', () => {
    const iPadAir = screen(1180, 820, { safe: { ...noInsets, top: 24, bottom: 20 } });

    expect(arrangeStage(iPadAir).controlsBelow).toBe(false);
  });

  it('shows the game on the top half of a phone on a table, the buttons on the bottom half', () => {
    const top = { x: 0, y: 0, width: 1104, height: 442 };
    const bottom = { x: 0, y: 442, width: 1104, height: 442 };
    const { rect, controlsBelow } = arrangeStage(
      screen(1104, 884, { hinge: { stacked: true, game: top, controls: bottom } }),
    );

    expect(controlsBelow).toBe(true);
    expect(rect).toEqual({ x: 159, y: 0, width: 785, height: 442 });
  });

  it('keeps the game off the hinge of a phone folded like a book', () => {
    const left = { x: 0, y: 0, width: 540, height: 720 };
    const { rect, controlsBelow } = arrangeStage(
      screen(1114, 720, { hinge: { stacked: false, game: left } }),
    );

    expect(controlsBelow).toBe(true);
    expect(rect.x + rect.width).toBeLessThanOrEqual(540);
    expect(rect).toMatchObject({ x: 0, width: 540, height: 304 });
  });

  it('keeps the game off the hinge without touch buttons too', () => {
    const left = { x: 0, y: 0, width: 540, height: 720 };
    const { rect } = arrangeStage(
      screen(1114, 720, { touch: false, hinge: { stacked: false, game: left } }),
    );

    expect(rect).toEqual({ x: 0, y: 208, width: 540, height: 303 });
  });

  it('tells upright screens apart', () => {
    expect(isPortrait(390, 844)).toBe(true);
    expect(isPortrait(844, 390)).toBe(false);
  });

  it('rests the stick in the bottom-left corner, inside the safe area', () => {
    const position = stickRestPosition({
      zoneHeight: 375,
      safe: { ...noInsets, left: 44 },
      stageBottom: 375,
      controlsBelow: false,
      buttonScale: 1,
    });

    expect(position).toEqual({ x: 44 + 64 + 26, y: 375 - 64 - 26 });
  });

  it('rests the stick under the stage when the buttons stand there', () => {
    const position = stickRestPosition({
      zoneHeight: 884,
      safe: noInsets,
      stageBottom: 442,
      controlsBelow: true,
      buttonScale: 1,
    });

    expect(position.y).toBeGreaterThan(442 + 64);
  });
});
