import { playMix } from './held-sway.js';

// what each mix of give in a road's trees has come to, kept from one frame to the next while the
// same raiders stay in them, so a frame plays on only the ticks since the last one instead of the
// whole drop again; a raider come or gone, or the drop played back from earlier, starts it afresh.
// It only saves work: every mix comes to just what playing it from the first tick would
const memories = new WeakMap();

const marksOf = (sources) => sources.map(({ mark, time }) => ({ mark, time }));

function continues(memory, sources, span) {
  return (
    span >= memory.span &&
    memory.marks.length === sources.length &&
    memory.marks.every(
      (last, i) =>
        last.mark === sources[i].mark && sources[i].time - last.time === span - memory.span,
    )
  );
}

// a memory of nothing yet: its mixes, keyed as sway-layout.js keys them, the layouts of the
// patches drawn from them, and the tick a mix last moved a part of the trees
export const freshMemory = (sources, span) => ({
  marks: marksOf(sources),
  span,
  mixes: new Map(),
  layouts: new Map(),
  changedAt: span,
});

// plays every mix on to the tick `lines` end on, noting whether any of them moved
function playOn(memory, lines) {
  for (const mix of memory.mixes.values()) {
    const { sway, sag } = mix;
    const swayWas = sway.offset;
    const sagWas = sag.offset;

    playMix(mix, lines, memory.span + 1);
    if (sway.offset !== swayWas || sag.offset !== sagWas) {
      memory.changedAt = lines[0].length - 1;
    }
  }
}

// the memory of the raiders now in `owner`'s trees, its mixes brought up to the tick `lines` end on
export function swayMemory(owner, sources, lines) {
  const span = lines[0].length - 1;
  const last = memories.get(owner);

  if (last && continues(last, sources, span)) {
    playOn(last, lines);
    Object.assign(last, { marks: marksOf(sources), span });

    return last;
  }

  const memory = freshMemory(sources, span);

  memories.set(owner, memory);

  return memory;
}
