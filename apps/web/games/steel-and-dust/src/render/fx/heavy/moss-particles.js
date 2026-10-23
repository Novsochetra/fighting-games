import { MOSS_HEAVY_ART as ART } from '../../../art/heavy-fx/moss.js';
import { point } from '../../painter.js';
import { drawSpike } from './moss-spike.js';

// a leaf turning as it falls: flat, tipped one way, edge on, tipped the other; each pixel is lit (1)
// or in shade (0)
const LEAF_TURNS = [
  [
    [1, 0, 1],
    [2, 0, 1],
    [0, 1, 0],
    [1, 1, 0],
  ],
  [
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 0],
    [0, 2, 0],
  ],
  [
    [0, 0, 1],
    [0, 1, 0],
  ],
  [
    [0, 0, 1],
    [0, 1, 0],
    [1, 1, 1],
    [1, 2, 0],
  ],
];
const THORN_LENGTH = 6;

function fade(particle) {
  return Math.min(1, (particle.life / particle.maxLife) * 2);
}

// spores twinkle: every few ticks a dim cross of light opens round the speck
function spore(painter, particle) {
  const alpha = fade(particle);
  if (particle.life % 6 < 2) {
    painter.alpha(alpha * 0.6).use(ART.sporeHalo);
    painter.rect(particle.x - 1, particle.y, 3, 1).rect(particle.x, particle.y - 1, 1, 3);
  }
  painter.alpha(alpha).use(particle.color).rect(particle.x, particle.y, 1, 1);
  painter.alpha(1);
}

function leaf(painter, particle) {
  const turning = particle.landed ? 0 : Math.floor(particle.life / 3);
  const pixels = LEAF_TURNS[(particle.turn + turning) % LEAF_TURNS.length];
  painter.alpha(fade(particle));
  for (const [dx, dy, lit] of pixels) {
    painter.use(lit ? particle.color : ART.leafShade).rect(particle.x + dx, particle.y + dy, 1, 1);
  }
  painter.alpha(1);
}

// a thorn grows out to its length as it flies, thick and dark at its root, lit and sharp at its point
function thorn(painter, particle) {
  const length = Math.min(THORN_LENGTH, 2 + (particle.maxLife - particle.life) * 2);
  const tip = point(particle.x, particle.y);
  const base = point(particle.x - particle.dx * length, particle.y - particle.dy * length);
  const middle = point((tip.x + base.x) / 2, (tip.y + base.y) / 2);
  painter.alpha(fade(particle));
  painter.use(ART.outline).line(base, middle, 2);
  painter.use(ART.thornLight).line(middle, tip, 1);
  painter.use(ART.thornTip).rect(tip.x, tip.y, 1, 1);
  painter.alpha(1);
}

// a bramble pushes up, stands and sinks back into the ground
function bramble(painter, particle) {
  const age = particle.maxLife - particle.life;
  const share = Math.min(1, (age + 1) / 3, particle.life / 5);
  const height = Math.max(1, Math.round(particle.height * share));
  drawSpike(painter, { x: particle.x, y: particle.y, height, lean: particle.lean, art: ART });
}

export const MOSS_PARTICLE_DRAWS = {
  mossSpore: spore,
  mossLeaf: leaf,
  mossThorn: thorn,
  mossBramble: bramble,
};
