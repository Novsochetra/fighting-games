// the last few places of what a trail follows, kept in a ring that is never made again
export function createRing(length) {
  return {
    points: Array.from({ length }, () => ({ x: 0, y: 0, z: 0 })),
    next: 0,
    count: 0,
  };
}

export function pushPoint(ring, { x, y, z: height = 0 }) {
  Object.assign(ring.points[ring.next], { x, y, z: Math.max(0, height) });
  ring.next = (ring.next + 1) % ring.points.length;
  ring.count = Math.min(ring.points.length, ring.count + 1);
}

export function clearRing(ring) {
  ring.count = 0;
}

// oldest first, the newest last; `from` drops that many of the oldest
export function ringPoints(ring, from = 0) {
  const { length } = ring.points;
  const points = [];

  for (let i = Math.max(0, from); i < ring.count; i += 1) {
    points.push(ring.points[(ring.next - ring.count + i + length * 2) % length]);
  }

  return points;
}
