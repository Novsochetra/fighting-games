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

// the mixes of give played so far for the raiders now in `owner`'s trees, brought up to the tick
// `lines` end on, keyed as sway-patch.js keys them
export function mixesFor(owner, sources, lines) {
  const span = lines[0].length - 1;
  const last = memories.get(owner);

  if (last && continues(last, sources, span)) {
    for (const mix of last.mixes.values()) {
      playMix(mix, lines, last.span + 1);
    }

    Object.assign(last, { marks: marksOf(sources), span });

    return last.mixes;
  }

  const memory = { marks: marksOf(sources), span, mixes: new Map() };

  memories.set(owner, memory);

  return memory.mixes;
}
