// what a hat cuts off a spike can leave a few pixels floating beside it
const SCRAP = 12;

function nearestColumn(columns, x) {
  return columns.reduce((best, column) =>
    Math.abs(column - x) < Math.abs(best - x) ? column : best,
  );
}

const NEIGHBOURS = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => [dx, dy]));

// the faces look right, so hair may hang below a brim only behind the face; a column beside the
// hat takes the nearest column's brim, or a spike would stick out sideways over it
export function hatCover(hatCells, frontX) {
  const bottoms = new Map();

  for (const { x, y } of hatCells) {
    bottoms.set(x, Math.max(bottoms.get(x) ?? y, y));
  }

  const columns = [...bottoms.keys()];
  const brim = (x) => bottoms.get(x) ?? bottoms.get(nearestColumn(columns, x));

  return ({ x, y }) => columns.length > 0 && (y <= brim(x) || x > frontX);
}

function groupFrom(start, left) {
  const group = [start];

  left.delete(`${start.x},${start.y}`);

  for (let i = 0; i < group.length; i += 1) {
    for (const [dx, dy] of NEIGHBOURS) {
      const key = `${group[i].x + dx},${group[i].y + dy}`;

      if (left.has(key)) {
        group.push(left.get(key));
        left.delete(key);
      }
    }
  }

  return group;
}

export function withoutScraps(cells) {
  const left = new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell]));
  const kept = [];

  for (const cell of cells) {
    if (left.has(`${cell.x},${cell.y}`)) {
      const group = groupFrom(cell, left);

      kept.push(...(group.length >= SCRAP ? group : []));
    }
  }

  return kept;
}
