export function countGridColumns(trackList) {
  const value = typeof trackList === 'string' ? trackList : '';
  const repeated = /repeat\(\s*(\d+)/.exec(value);
  if (repeated) {
    return Math.max(1, Number(repeated[1]));
  }
  const tracks = value
    .replace(/\[[^\]]*\]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((track) => track !== '' && track !== 'none');
  return Math.max(1, tracks.length);
}

export function clampIndex(index, count) {
  return Math.min(Math.max(0, index), count - 1);
}

// Left and right wrap through the whole shelf like a console menu; up and down stay in bounds.
export function moveSelection({ index, count, columns, direction }) {
  if (count <= 0) {
    return -1;
  }
  const current = clampIndex(index, count);
  const step = Math.max(1, Math.floor(columns) || 1);
  if (direction === 'left') {
    return (current - 1 + count) % count;
  }
  if (direction === 'right') {
    return (current + 1) % count;
  }
  if (direction === 'up') {
    return current - step >= 0 ? current - step : current;
  }
  return direction === 'down' ? moveDown(current, count, step) : current;
}

function moveDown(index, count, columns) {
  const target = index + columns;
  if (target < count) {
    return target;
  }
  const isOnLastRow = Math.floor(index / columns) === Math.floor((count - 1) / columns);
  return isOnLastRow ? index : count - 1;
}
