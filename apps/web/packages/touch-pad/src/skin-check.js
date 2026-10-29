// A skin is data a game ships, never code (its format is in docs/architecture.md, Touch pad and
// skins), so a game's tests check every skin it ships with skinProblems.
const KINDS = ['button', 'dpad', 'stick'];
const DIRECTIONS = ['up', 'right', 'down', 'left'];
const ORIENTATIONS = ['landscape', 'portrait'];

const isName = (value) => typeof value === 'string' && value.length > 0;
const isFraction = (value) => Number.isFinite(value) && value >= 0 && value <= 1;

function inputsProblem({ kind, inputs }) {
  if (kind === 'button') {
    return Array.isArray(inputs) && inputs.length > 0 && inputs.every(isName)
      ? null
      : 'a button needs a list of inputs';
  }

  return DIRECTIONS.every((direction) => isName(inputs?.[direction]))
    ? null
    : `a ${kind} needs an input for up, right, down and left`;
}

const isOffset = (value) => value === undefined || Number.isFinite(value);

// a stick rests by its centre alone (its zone is the half of the layer it stands on)
function atProblem({ at, kind }) {
  if (!at) {
    return null;
  }

  if (!isFraction(at.x) || !isFraction(at.y)) {
    return 'at must be fractions of the layer';
  }

  if (!isOffset(at.dx) || !isOffset(at.dy)) {
    return 'dx and dy must be px';
  }

  return kind === 'stick' && (at.dx || at.dy) ? 'a stick stands by x and y alone' : null;
}

function itemProblems(item) {
  const problems = [];

  if (!KINDS.includes(item.kind)) {
    return [`kind must be one of ${KINDS.join(', ')}`];
  }

  problems.push(inputsProblem(item));

  problems.push(atProblem(item));

  if (item.size !== undefined && !(Number.isFinite(item.size) && item.size > 0)) {
    problems.push('size must be px above 0');
  }

  if (item.class !== undefined && !/^[\w-]+( [\w-]+)*$/.test(item.class)) {
    problems.push('class must be class names');
  }

  return problems.filter(Boolean);
}

function layoutProblems(layout) {
  const items = Array.isArray(layout?.items) ? layout.items : null;

  if (!items || items.length === 0) {
    return ['it lists no controls'];
  }

  const ids = items.map((item) => item.id);
  const placed = items.filter((item) => item.at).length;
  const problems = items.flatMap((item) =>
    itemProblems(item).map((problem) => `${item.id ?? '?'}: ${problem}`),
  );

  if (!ids.every(isName) || new Set(ids).size !== ids.length) {
    problems.push('every control needs an id of its own');
  }

  if (items.filter((item) => item.kind === 'stick').length > 1) {
    problems.push('it has more than one stick');
  }

  if (placed !== 0 && placed !== items.length) {
    problems.push('at places all its controls or none');
  }

  return problems;
}

export function skinProblems(skin) {
  const named = isName(skin?.id) && isName(skin?.name) ? [] : ['a skin needs an id and a name'];
  const problems = ORIENTATIONS.flatMap((orientation) =>
    layoutProblems(skin?.layouts?.[orientation]).map((problem) => `${orientation}: ${problem}`),
  );

  return [...named, ...problems];
}
