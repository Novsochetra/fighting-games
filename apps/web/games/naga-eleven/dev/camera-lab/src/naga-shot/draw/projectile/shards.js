import { hash } from '../../../../../../src/render/duel/hash.js';

// which way what is left of it carries on: into the net on a goal, thrown back off a save
const PUSH = {
  goal: { x: 1.3, y: 0.1 },
  catch: { x: -0.8, y: -0.4 },
  punch: { x: -0.4, y: -1 },
  parry: { x: -0.9, y: 0.2 },
  post: { x: -0.5, y: -1.1 },
};

// The break runs down the body from where the head struck, `WAVE` pixels a tick, a shard flying
// off as it gets there, so the Naga comes apart head first like a whip cracking; the shards slow
// as they fly (`DRAG`, in ticks), and those far down the body come apart into sparks later.
const WAVE = 9;

const DRAG = 10;

const FARTHEST = 200;

function motionOf(shard, { contact, ending }) {
  const seed = (salt) => hash(shard.index, salt);
  const [dx, dy] = [shard.x - contact.x, shard.y - contact.y];
  const distance = Math.hypot(dx, dy) || 1;
  const near = Math.max(0, 1 - distance / 140);
  const speed = (1 + 3.6 * near) * (0.6 + 0.8 * seed(61));
  const turn = seed(63) * Math.PI * 2;
  const push = PUSH[ending];

  return {
    x: ((dx / distance) * 0.7 + Math.cos(turn) * 0.6) * speed + push.x * near * 1.6,
    y: ((dy / distance) * 0.7 + Math.sin(turn) * 0.6) * speed + push.y * near * 1.6 - 0.25,
    delay: distance / WAVE,
    crumble: 0.2 + 0.22 * seed(62) + 0.4 * Math.min(1, distance / FARTHEST),
  };
}

export function motionsOf(crash, ending) {
  crash.motions ??= crash.shards.map((shard) =>
    motionOf(shard, { contact: crash.contact, ending }),
  );

  return crash.motions;
}

export function shardStates(motions, broken) {
  return motions.map((motion) => {
    const ticks = broken.ticks - motion.delay;
    const flown = ticks > 0 ? DRAG * (1 - Math.exp(-ticks / DRAG)) : 0;
    const crumble = (broken.life - motion.crumble) / (0.97 - motion.crumble);

    return {
      ticks,
      dx: Math.round(motion.x * flown),
      dy: Math.round(motion.y * flown),
      crumble: Math.min(1, Math.max(0, crumble)),
    };
  });
}
