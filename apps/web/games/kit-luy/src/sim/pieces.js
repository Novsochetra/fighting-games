const countOf = (count) => (Number.isInteger(count) && count > 0 ? count : 0);

export const clothCount = (cloth) =>
  Object.values(cloth || {}).reduce((sum, count) => sum + countOf(count), 0);

export const clothTotal = (cloth) =>
  Object.entries(cloth || {}).reduce((sum, [value, count]) => sum + value * countOf(count), 0);

export function clothPieces(cloth) {
  const values = Object.keys(cloth || {})
    .map(Number)
    .sort((one, other) => other - one);

  return values.flatMap((value) => Array(countOf(cloth[value])).fill(value));
}

const commonStep = (one, other) => (other === 0 ? one : commonStep(other, one % other));

const usable = (pieces) =>
  (Array.isArray(pieces) ? pieces : []).filter((value) => Number.isInteger(value) && value > 0);

// fewest[total] pieces make `total` steps, for every total up to `steps`
function fewestTable(steps, sizes) {
  const fewest = [0];

  for (let total = 1; total <= steps; total++) {
    let before = Infinity;

    for (const size of sizes) {
      if (size <= total && fewest[total - size] < before) {
        before = fewest[total - size];
      }
    }

    fewest.push(before + 1);
  }

  return fewest;
}

// Counting in the largest step every piece shares keeps the table a thousand cells for riel
// instead of a hundred thousand.
function counted(amount, pieces) {
  const values = usable(pieces);
  const step = values.reduce(commonStep, 0);

  if (!Number.isInteger(amount) || amount < 0 || step === 0 || amount % step !== 0) {
    return null;
  }

  const sizes = values.map((value) => value / step);

  return { step, sizes, fewest: fewestTable(amount / step, sizes) };
}

export function fewestPieces(amount, pieces) {
  if (amount === 0) {
    return 0;
  }

  const table = counted(amount, pieces);

  return table ? table.fewest[amount / table.step] : Infinity;
}

export function piecesFor(amount, pieces) {
  const table = counted(amount, pieces);
  const way = [];

  if (!table || table.fewest[amount / table.step] === Infinity) {
    return way;
  }

  const largestFirst = [...table.sizes].sort((one, other) => other - one);
  let left = amount / table.step;

  while (left > 0) {
    const size = largestFirst.find(
      (candidate) => candidate <= left && table.fewest[left - candidate] === table.fewest[left] - 1,
    );

    way.push(size * table.step);
    left -= size;
  }

  return way;
}
