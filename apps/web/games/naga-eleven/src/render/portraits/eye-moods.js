const IRIS = new Set(['i', 'j', 'l', 'L']);

const setAt = (row, column, letter) =>
  column < 0 || column >= row.length ? row : row.slice(0, column) + letter + row.slice(column + 1);

// a lid drop per column: the covered rows turn to skin and the lash line comes down with it
export function lowerLid(rows, drops) {
  return rows.map((row, rowIndex) =>
    [...row]
      .map((letter, column) => {
        const drop = drops[column] ?? 0;

        if (letter === '.' || drop === 0) {
          return letter;
        }

        if (rowIndex < drop) {
          return '2';
        }

        return rowIndex === drop ? 'O' : letter;
      })
      .join(''),
  );
}

function irisBox(rows) {
  const cells = rows.flatMap((row, y) =>
    [...row].flatMap((letter, x) => (IRIS.has(letter) ? [{ x, y }] : [])),
  );
  const xs = cells.map((cell) => cell.x);
  const ys = cells.map((cell) => cell.y);

  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys) };
}

// anime shock: the iris shrinks to a dot in an eye opened wider than calm
export function wideOpen(rows) {
  const box = irisBox(rows);
  const column = Math.floor((box.left + box.right) / 2);
  const middle = rows.slice(1, -1).map((row) => row.replace(/(?<=.)[^.]/g, 'w'));
  const tall = [middle[0], ...middle];
  const centre = Math.floor(tall.length / 2);
  const pupil = (row) => setAt(setAt(row, column, 'j'), column + 1, 'j');

  tall[centre - 1] = pupil(tall[centre - 1]);
  tall[centre] = pupil(tall[centre]);

  return [rows[0], ...tall, rows.at(-1)];
}

export function addShine(rows) {
  const box = irisBox(rows);

  return rows.map((row, y) => (y === box.top + 2 ? setAt(row, box.right - 1, 'L') : row));
}

export function dropShine(rows) {
  return rows.map((row) => row.replace(/L/g, 'j'));
}

export function happyArc(width) {
  const inner = Math.max(1, width - 4);

  return [
    `..${'O'.repeat(inner)}..`,
    `.OO${'.'.repeat(Math.max(0, inner - 2))}OO.`,
    `OO${'.'.repeat(width - 4)}OO`,
  ];
}

export function squeezedShut(width) {
  const half = Math.floor(width / 2);

  return [
    `OO${'.'.repeat(width - 2)}`,
    `..${'O'.repeat(half)}${'.'.repeat(width - half - 2)}`,
    `${'.'.repeat(half)}${'O'.repeat(width - half)}`,
    `..${'O'.repeat(half)}${'.'.repeat(width - half - 2)}`,
  ];
}

// mirrored, the shine would land on the iris's far side; light comes from the left for both eyes
export function mirrorEye(rows) {
  return rows.map((row) => {
    const mirrored = [...row].reverse();
    const shine = mirrored.indexOf('L');

    if (shine < 0) {
      return mirrored.join('');
    }

    let start = shine;
    let end = shine;

    while (IRIS.has(mirrored[start - 1])) {
      start -= 1;
    }

    while (IRIS.has(mirrored[end + 1])) {
      end += 1;
    }

    const target = start + (end - shine);

    [mirrored[shine], mirrored[target]] = [mirrored[target], mirrored[shine]];

    return mirrored.join('');
  });
}
