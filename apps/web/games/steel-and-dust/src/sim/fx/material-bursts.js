import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';

// what flies off an enemy when it is struck: metal sparks, rust and temple stone chips, shell
// shards, sand
const MATERIALS = {
  metal: { kind: 'spark', colors: [COLORS.white, COLORS.gold], count: 4 },
  stone: { kind: 'chunk', colors: [FX_COLORS.stone, FX_COLORS.stoneDark], count: 5 },
  sandstone: {
    kind: 'chunk',
    colors: [FX_COLORS.sandstone, FX_COLORS.sandstoneDark, FX_COLORS.sandstoneGold],
    count: 5,
  },
  shell: { kind: 'chunk', colors: [FX_COLORS.shell, FX_COLORS.shellGlint], count: 4 },
  sand: { kind: 'mote', colors: [FX_COLORS.mirage, FX_COLORS.mirageLight], count: 5 },
};

export function burstMaterial(game, { target, x, y }, direction) {
  const material = MATERIALS[target.def?.material];
  if (!material) {
    return;
  }
  for (let i = 0; i < material.count; i++) {
    game.particles.push({
      kind: material.kind,
      x,
      y,
      vx: direction * randomBetween(0.6, 2.4),
      vy: -randomBetween(0.8, 2.6),
      life: randomBetween(14, 24) | 0,
      maxLife: 24,
      color: material.colors[i % material.colors.length],
    });
  }
}
