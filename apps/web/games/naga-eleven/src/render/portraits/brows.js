import { setCell, mirrorX } from './grid.js';

// lift moves a brow up, tilt drops its inner end, arch raises its middle
const BROW_MOODS = {
  neutral: { lift: 0, tilt: 0, arch: 1 },
  happy: { lift: -1, tilt: 0, arch: 1 },
  determined: { lift: 0, tilt: 2, arch: 0 },
  shocked: { lift: -3, tilt: 0, arch: 1 },
  sad: { lift: -1, tilt: -2, arch: 0 },
  angry: { lift: 0, tilt: 3, arch: 0 },
  smirk: { lift: 0, tilt: 1, arch: 0, other: { lift: -2, tilt: 0, arch: 1 } },
  cry: { lift: -1, tilt: -3, arch: 0 },
  cocky: { lift: 0, tilt: 1, arch: 0, other: { lift: -1, tilt: 0, arch: 1 } },
  stern: { lift: 1, tilt: 1, arch: 0 },
};

function browHeights({ lift, tilt, arch }, width) {
  return Array.from({ length: width }, (_, step) => {
    const inMiddle = step > 0 && step < width - 2;

    return lift + Math.round((tilt * step) / (width - 1)) - (arch && inMiddle ? 1 : 0);
  });
}

function paintBrow(grid, { heights, outer, direction, y, look }) {
  heights.forEach((height, step) => {
    const x = outer + step * direction;

    setCell(grid, x, y + height, look.top);

    if (look.thickness > 1 && step >= look.taper) {
      setCell(grid, x, y + height + 1, look.under);
    }
  });
}

export function paintBrows(grid, { mood, y, gap, width, look, moods = {} }) {
  const shape = BROW_MOODS[moods[mood] ?? mood] ?? BROW_MOODS.neutral;
  const outer = 32 - gap - width;

  paintBrow(grid, { heights: browHeights(shape, width), outer, direction: 1, y, look });
  paintBrow(grid, {
    heights: browHeights(shape.other ?? shape, width),
    outer: mirrorX(outer),
    direction: -1,
    y,
    look,
  });
}
