// the most frames a scene may run, should one never end
const MOST_FRAMES = 5000;

export function timelineOf(scene) {
  const stages = [];
  let frame = 0;

  for (; frame < MOST_FRAMES && !scene.isDone(); frame += 1) {
    scene.step();

    const stage = scene.stage();
    const last = stages[stages.length - 1];

    if (last?.stage === stage) {
      last.length += 1;
    } else {
      stages.push({ stage, from: frame, length: 1 });
    }
  }

  return { stages, total: frame };
}

// a scene played back: frame by frame, at a speed, and taken to any frame by playing it again
// from the start, as a show runs one way only
export function createPlayer(build) {
  const { stages, total } = timelineOf(build());

  return { build, scene: build(), frame: 0, stages, total, playing: true, speed: 1, carry: 0 };
}

export function seek(player, frame) {
  const target = Math.max(0, Math.min(player.total, Math.round(frame)));

  if (target < player.frame) {
    player.scene = player.build();
    player.frame = 0;
  }

  while (player.frame < target) {
    player.scene.step();
    player.frame += 1;
  }
}

export function advance(player) {
  if (!player.playing) {
    return;
  }

  player.carry += player.speed;

  while (player.carry >= 1) {
    player.carry -= 1;
    seek(player, player.frame >= player.total ? 0 : player.frame + 1);
  }
}

export const stageAt = (player, frame) =>
  player.stages.find((entry) => frame > entry.from && frame <= entry.from + entry.length) ??
  player.stages[0];
