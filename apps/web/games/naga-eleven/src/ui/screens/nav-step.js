const DIRECTIONS = {
  up: { axis: 'move', by: -1 },
  down: { axis: 'move', by: 1 },
  left: { axis: 'adjust', by: -1 },
  right: { axis: 'adjust', by: 1 },
};

const AXES = new Set(['move', 'adjust']);

// a step is a direction, a number (up or down the list), or the pad's menu step,
// ['move', ±1] or ['adjust', ±1] (packages/input/src/menu-repeat.js)
export function stepOf(step) {
  if (typeof step === 'string') {
    return DIRECTIONS[step] ?? null;
  }

  if (typeof step === 'number' && step !== 0) {
    return { axis: 'move', by: Math.sign(step) };
  }

  if (Array.isArray(step) && AXES.has(step[0]) && step[1]) {
    return { axis: step[0], by: Math.sign(step[1]) };
  }

  return null;
}

export const wrapIndex = (at, by, count) => (count ? (((at + by) % count) + count) % count : -1);
