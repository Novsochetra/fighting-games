import { describe, expect, it } from 'vitest';
import {
  ART_MAX_WIDTH,
  ART_SIDE_MARGIN,
  CAPTION_GAP,
  CAPTION_ROOM,
  HOME_ZOOM,
  captionTop,
  homeKeyframes,
  iconFrame,
  isMeasurable,
  launchArtRect,
  launchKeyframes,
  panelFrame,
  radiusAt,
  rectAt,
  resolveRadius,
  reverseKeyframes,
  toRect,
} from '@/screens/home/launch/launch-geometry.js';

const icon = { x: 40, y: 100, width: 60, height: 60 };
const viewport = { width: 400, height: 800 };

const parseTransform = (transform) => transform.match(/-?[\d.]+(?:e-?\d+)?/g).map(Number);

describe('isMeasurable and toRect', () => {
  it('needs a box with an area', () => {
    expect(isMeasurable(icon)).toBe(true);
    expect(isMeasurable({ x: 0, y: 0, width: 0, height: 60 })).toBe(false);
    expect(isMeasurable(null)).toBe(false);
  });

  it('turns a DOMRect into x, y, width and height', () => {
    expect(toRect({ left: 1, top: 2, width: 3, height: 4, right: 9 })).toEqual({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });
  });
});

describe('resolveRadius', () => {
  it.each([
    ['30%', 60, 18],
    ['13.5px', 60, 13.5],
    ['20% 10%', 50, 10],
    ['0px', 60, 0],
    ['', 60, 0],
    [undefined, 60, 0],
  ])('reads %j on a %ipx icon as %ipx', (value, size, expected) => {
    expect(resolveRadius(value, size)).toBeCloseTo(expected);
  });
});

describe('rectAt', () => {
  it('moves from one box to the other', () => {
    const screen = { x: 0, y: 0, ...viewport };
    expect(rectAt(icon, screen, 0)).toEqual(icon);
    expect(rectAt(icon, screen, 1)).toEqual(screen);
    expect(rectAt(icon, screen, 0.5)).toEqual({ x: 20, y: 50, width: 230, height: 430 });
  });
});

describe('panelFrame', () => {
  it('scales the full-screen panel onto a box with round corners', () => {
    const frame = panelFrame(icon, viewport, 12);
    expect(parseTransform(frame.transform)).toEqual([40, 100, 0.15, 0.075]);
    expect(frame.borderRadius).toBe('80px / 160px');
  });

  it('is the bare screen at full size', () => {
    const frame = panelFrame({ x: 0, y: 0, ...viewport }, viewport, 0);
    expect(parseTransform(frame.transform)).toEqual([0, 0, 1, 1]);
    expect(frame.borderRadius).toBe('0px / 0px');
  });
});

describe('iconFrame', () => {
  it('starts exactly on the icon', () => {
    expect(parseTransform(iconFrame(icon, icon).transform)).toEqual([0, 0, 1]);
  });

  it('moves the art and scales it evenly onto a box of the same shape', () => {
    const card = { x: 50, y: 300, width: 320, height: 180 };
    const larger = { x: 10, y: 20, width: 640, height: 360 };
    expect(parseTransform(iconFrame(larger, card).transform)).toEqual([-40, -280, 2]);
  });
});

describe('launchArtRect and captionTop', () => {
  const card = { x: 50, y: 300, width: 320, height: 180 };

  it('rests a wide card in the middle of a phone, as wide as its margins let it be', () => {
    const art = launchArtRect({ width: 375, height: 812 }, card);
    expect(art.width).toBe(375 - 2 * ART_SIDE_MARGIN);
    expect(art.width / art.height).toBeCloseTo(320 / 180);
    expect(art.x).toBe(ART_SIDE_MARGIN);
    expect(art.y).toBeCloseTo((812 - art.height - CAPTION_ROOM) / 2);
  });

  it('stops growing at a large card on a wide screen', () => {
    const art = launchArtRect({ width: 1440, height: 900 }, card);
    expect(art.width).toBe(ART_MAX_WIDTH);
    expect(art.x).toBe((1440 - ART_MAX_WIDTH) / 2);
  });

  it('keeps clear of the top and bottom of a short, wide window', () => {
    const art = launchArtRect({ width: 1200, height: 420 }, card);
    expect(art.height).toBeLessThan(420 / 2);
    expect(art.y).toBeGreaterThan(0);
  });

  it('puts the game name just under the art', () => {
    expect(captionTop({ x: 0, y: 100, width: 320, height: 180 })).toBe(280 + CAPTION_GAP);
  });
});

describe('radiusAt', () => {
  it('starts at the icon corner, rounds out mid-flight and ends square', () => {
    expect(radiusAt(0, 10)).toBe(10);
    expect(radiusAt(0.5, 10)).toBeGreaterThan(10);
    expect(radiusAt(1, 10)).toBe(0);
  });
});

describe('launchKeyframes', () => {
  const frames = launchKeyframes({ from: icon, viewport, radius: 12, steps: 4 });

  it('has matching panel, corner and icon frames from offset 0 to 1', () => {
    for (const track of [frames.panel, frames.corners, frames.icon]) {
      expect(track.map((frame) => frame.offset)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    }
  });

  it('keeps the corners in their own track, apart from the compositor-friendly transform', () => {
    expect(Object.keys(frames.panel[0]).sort()).toEqual(['offset', 'transform']);
    expect(Object.keys(frames.corners[0]).sort()).toEqual(['borderRadius', 'offset']);
  });

  it('starts on the icon and ends filling the screen', () => {
    const start = panelFrame(icon, viewport, 12);
    expect(frames.panel[0].transform).toBe(start.transform);
    expect(frames.corners[0].borderRadius).toBe(start.borderRadius);
    expect(parseTransform(frames.panel[4].transform)).toEqual([0, 0, 1, 1]);
    expect(frames.corners[4].borderRadius).toBe('0px / 0px');
  });

  it('keeps the art sharp, from the icon to its resting place in the middle', () => {
    expect(frames.icon.every((frame) => !('opacity' in frame))).toBe(true);
    expect(frames.icon[0].transform).toBe(iconFrame(icon, icon).transform);
    const rest = launchArtRect(viewport, icon);
    expect(frames.icon[4].transform).toBe(iconFrame(rest, icon).transform);
  });
});

describe('homeKeyframes', () => {
  it('zooms the home in and fades it, with nothing the compositor cannot run', () => {
    expect(homeKeyframes()).toEqual([
      { offset: 0, transform: 'scale(1)', opacity: 1 },
      { offset: 1, transform: `scale(${HOME_ZOOM})`, opacity: 0 },
    ]);
  });
});

describe('reverseKeyframes', () => {
  it('plays the frames backwards on the same offsets', () => {
    const reversed = reverseKeyframes([
      { offset: 0, opacity: 1 },
      { offset: 0.25, opacity: 0.5 },
      { offset: 1, opacity: 0 },
    ]);
    expect(reversed).toEqual([
      { offset: 0, opacity: 0 },
      { offset: 0.75, opacity: 0.5 },
      { offset: 1, opacity: 1 },
    ]);
  });

  it('leaves the input alone', () => {
    const frames = [{ offset: 0 }, { offset: 1 }];
    reverseKeyframes(frames);
    expect(frames).toEqual([{ offset: 0 }, { offset: 1 }]);
  });
});
