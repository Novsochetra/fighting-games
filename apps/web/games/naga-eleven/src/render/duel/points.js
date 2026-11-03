// a list of points written 'x,y x,y …', which keeps a shape's corners on one line
export const pointsOf = (text) =>
  text
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number));
