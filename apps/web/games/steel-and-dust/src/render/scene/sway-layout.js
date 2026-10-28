import { GIVE_STEPS, playMix, stillMix } from './held-sway.js';

// layouts kept for a road's trees at once: the patch the raiders shake, the cover over each one
// letting go, and the last few the camera has moved on from
const KEPT = 4;

// each raider's give at every column of the patch: none outside its own stretch of the trees
function columnGives(patch) {
  const width = patch.right - patch.left;

  return patch.sources.map((source) => {
    const gives = new Float64Array(width);

    for (let i = 0; i < width; i++) {
      const x = patch.left + i;

      gives[i] = x >= source.left && x < source.right ? source.across(x) : 0;
    }

    return gives;
  });
}

// runs of columns every raider gives alike, worked out once a row for the whole run
function columnGroups(columns, width) {
  const groups = [];

  for (let i = 0; i < width; i++) {
    const last = groups.at(-1);

    if (last && columns.every((gives) => gives[i] === gives[last.from])) {
      last.width++;
    } else {
      groups.push({ from: i, width: 1 });
    }
  }

  return groups;
}

const rowGive = (source, y) => (y >= source.top && y < source.bottom ? source.down(y) : 0);
const sameGive = (downs, last) => downs.every((down, i) => down === last[i]);

// the key of the mix the part of the trees at the group of columns `from` comes to: the steps it
// gives each raider, by how much each one's tree gives across it and down it
function keyAt({ columns, downs }, from) {
  let key = 0;

  for (let source = 0; source < columns.length; source++) {
    key = key * (GIVE_STEPS + 1) + Math.round(columns[source][from] * downs[source] * GIVE_STEPS);
  }

  return key;
}

// that mix, played through from the first tick the first time it is met
function mixAt(memory, row, { key, from }) {
  const kept = memory.mixes.get(key);

  if (kept) {
    return kept;
  }

  const { columns, downs, lines } = row;
  const steps = columns.map((gives, source) =>
    Math.round(gives[from] * downs[source] * GIVE_STEPS),
  );
  const mix = playMix(stillMix(steps), lines, 0);

  memory.mixes.set(key, mix);

  return mix;
}

// the mix every run of a row's columns comes to; runs side by side mostly come to the same one
function rowMixes(memory, row, groups) {
  let lastKey = -1;
  let lastMix = null;

  return groups.map(({ from }) => {
    const key = keyAt(row, from);

    if (key !== lastKey) {
      lastKey = key;
      lastMix = mixAt(memory, row, { key, from });
    }

    return lastMix;
  });
}

// the patch's rows, in bands of rows that give alike, each with the mix every run of its columns
// comes to
function bandsOf(patch, { columns, groups }, { memory, lines }) {
  const bands = [];
  let last = null;

  for (let y = patch.top; y < patch.bottom; y++) {
    const downs = patch.sources.map((source) => rowGive(source, y));

    if (last && sameGive(downs, last.downs)) {
      last.height++;
      continue;
    }

    last = { y, height: 1, downs, mixes: rowMixes(memory, { columns, downs, lines }, groups) };
    bands.push(last);
  }

  return bands;
}

function buildLayout(patch, played) {
  const columns = columnGives(patch);
  const groups = columnGroups(columns, patch.right - patch.left);

  return { groups, bands: bandsOf(patch, { columns, groups }, played), plan: null, at: -1 };
}

// a patch is laid out alike for as long as it and the trees in it stay put on the screen; a source
// without a `shape` (the inputs its give is worked out from) is laid out afresh every frame
function signatureOf(patch) {
  const { sources, left, right, top, bottom, keepStill } = patch;

  if (sources.some((source) => source.shape === undefined)) {
    return null;
  }

  const places = sources.map((one) => [one.left, one.right, one.top, one.bottom, one.shape]);

  return [left, right, top, bottom, Boolean(keepStill), ...places.flat()].join(',');
}

// how the patch is laid out over the mixes of `memory`, played up to the tick `lines` end on
export function swayLayout(patch, { memory, lines }) {
  const signature = signatureOf(patch);
  const kept = signature && memory.layouts.get(signature);

  if (kept) {
    return kept;
  }

  const layout = buildLayout(patch, { memory, lines });

  if (signature) {
    if (memory.layouts.size >= KEPT) {
      memory.layouts.delete(memory.layouts.keys().next().value);
    }

    memory.layouts.set(signature, layout);
  }

  return layout;
}
