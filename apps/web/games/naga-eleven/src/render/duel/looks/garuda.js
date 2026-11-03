import { DUEL_UI } from '../../../art/duel/palette.js';
import { drawParts } from '../parts.js';
import { GROUND } from '../paths.js';
import { scatter, withFade } from './fade.js';
import { headAt } from './naga.js';

// a feather from the wing's root out along a turn, tapering to its tip
function feather({ root, turn, length, width, color }) {
  const tip = { x: root.x + Math.cos(turn) * length, y: root.y + Math.sin(turn) * length };
  const side = turn + Math.PI / 2;
  const half = { x: Math.cos(side) * width, y: Math.sin(side) * width };

  return {
    kind: 'poly',
    points: [
      [root.x + half.x * 0.5, root.y + half.y * 0.5],
      [root.x + (tip.x - root.x) * 0.6 + half.x, root.y + (tip.y - root.y) * 0.6 + half.y],
      [tip.x, tip.y],
      [
        root.x + (tip.x - root.x) * 0.6 - half.x * 0.4,
        root.y + (tip.y - root.y) * 0.6 - half.y * 0.4,
      ],
      [root.x - half.x * 0.5, root.y - half.y * 0.5],
    ],
    color,
  };
}

// a wing of three rows: long red flight feathers, orange ones over them, gold at the shoulder
function wing({ root, sweep, flap, art }) {
  const rows = [
    { count: 8, length: 62, width: 5, color: art.body[2], spread: 1.2 },
    { count: 7, length: 44, width: 5, color: art.body[3], spread: 1 },
    { count: 5, length: 24, width: 5, color: art.accent[2], spread: 0.8 },
  ];

  return rows.flatMap((row) =>
    Array.from({ length: row.count }, (_, i) => {
      const turn =
        sweep + flap + (i / (row.count - 1) - 0.5) * row.spread * Math.sign(sweep - Math.PI);

      return feather({
        root,
        turn,
        length: row.length * (0.75 + 0.25 * (i / row.count)),
        width: row.width,
        color: row.color,
      });
    }),
  );
}

// Garuda's great wings open behind the ball, beating once as it flies
function back(pen, scene) {
  const at = headAt(scene);
  const flap = Math.sin(scene.tick / 4) * 0.25;
  const root = { x: at.x - 6, y: at.y };

  withFade(pen, scene, () => {
    drawParts(pen, wing({ root, sweep: Math.PI + 1.2, flap: -flap, art: scene.art }));
    drawParts(pen, wing({ root, sweep: Math.PI - 1.2, flap, art: scene.art }));
    drawParts(pen, [
      { kind: 'ellipse', x: at.x - 4, y: at.y, radiusX: 12, radiusY: 7, color: scene.art.body[3] },
      {
        kind: 'poly',
        points: [
          [at.x + 4, at.y - 5],
          [at.x + 16, at.y],
          [at.x + 4, at.y + 4],
        ],
        color: scene.art.accent[2],
      },
      { kind: 'disc', x: at.x + 2, y: at.y - 3, radius: 1.5, color: DUEL_UI.white, ink: false },
    ]);
  });
  scatter(pen, {
    scene,
    points: [at, root, { x: at.x - 20, y: at.y - 20 }, { x: at.x - 20, y: at.y + 20 }],
    colors: [scene.art.body[4], scene.art.accent[3]],
  });
}

// a volley: struck in the air
function attacker(scene) {
  if (scene.t > 44) {
    return { pose: 'stand', x: 34, y: GROUND, facing: 1 };
  }

  return { pose: scene.t < 10 ? 'leap' : 'kick', x: 34, y: GROUND - 14, facing: 1 };
}

export const GARUDA = { back, attacker };
