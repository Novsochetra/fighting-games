import { HUD } from '../../art/hud.js';

// a team's kit as a little shirt over shorts: O ink, L S D the shirt lit to shaded, T the trim,
// P Q the shorts
const ICON = [
  '.OOO.OOO.',
  'OLLLTSSSO',
  'OLLSSSSDO',
  '.OLSSSDO.',
  '.OLSSSDO.',
  '.OPPPPQO.',
  '.OPQOPQO.',
  '.OOO.OOO.',
];

export const ICON_SIZE = { width: ICON[0].length, height: ICON.length };

function colourOf(code, kit) {
  const { shirt, shorts, trim } = kit;
  const colours = {
    O: HUD.ink,
    L: shirt[3],
    S: shirt[2],
    D: shirt[1],
    T: trim[2],
    P: shorts[2],
    Q: shorts[1],
  };

  return colours[code];
}

const kept = new WeakMap();

function runsOf(kit) {
  if (!kept.has(kit)) {
    const runs = ICON.flatMap((row, y) =>
      [...row.matchAll(/([^.])\1*/g)].map((match) => ({
        x: match.index,
        y,
        width: match[0].length,
        colour: colourOf(match[1], kit),
      })),
    );

    kept.set(kit, runs);
  }

  return kept.get(kit);
}

export function drawKitIcon(context, kit, { x, y }) {
  for (const run of runsOf(kit)) {
    context.fillStyle = run.colour;
    context.fillRect(x + run.x, y + run.y, run.width, 1);
  }
}
