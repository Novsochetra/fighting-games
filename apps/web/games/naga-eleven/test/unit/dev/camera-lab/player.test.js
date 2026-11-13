import { describe, expect, it } from 'vitest';

import { advance, createPlayer, seek, stageAt } from '../../../../dev/camera-lab/src/player.js';

// a show of three stages, two ticks, three and one, noting how often it was made
function counting() {
  const made = { count: 0 };
  const STAGES = ['intro', 'intro', 'cutin', 'cutin', 'cutin', 'result'];

  const build = () => {
    made.count += 1;

    let ticks = 0;

    return {
      step: () => {
        ticks += 1;
      },
      isDone: () => ticks >= STAGES.length,
      stage: () => STAGES[Math.max(0, ticks - 1)],
      stageTicks: () => ticks,
      ticks: () => ticks,
    };
  };

  return { made, build };
}

describe("the camera lab's player", () => {
  it('knows every stage of the show, where each starts and how long it runs', () => {
    const player = createPlayer(counting().build);

    expect(player.total).toBe(6);
    expect(player.stages).toEqual([
      { stage: 'intro', from: 0, length: 2 },
      { stage: 'cutin', from: 2, length: 3 },
      { stage: 'result', from: 5, length: 1 },
    ]);
    expect(stageAt(player, 4).stage).toBe('cutin');
  });

  it('goes on by playing, and back by playing again from the start', () => {
    const { made, build } = counting();
    const player = createPlayer(build);

    seek(player, 4);
    expect(player.scene.ticks()).toBe(4);
    expect(made.count).toBe(2);

    seek(player, 2);
    expect(player.scene.ticks()).toBe(2);
    expect(made.count).toBe(3);

    seek(player, 99);
    expect(player.frame).toBe(6);
  });

  it('plays at its speed, holds still when paused, and goes round at the end', () => {
    const player = createPlayer(counting().build);

    player.speed = 0.5;
    advance(player);
    advance(player);
    expect(player.frame).toBe(1);

    player.playing = false;
    advance(player);
    expect(player.frame).toBe(1);

    player.playing = true;
    player.speed = 1;
    seek(player, 6);
    advance(player);
    expect(player.frame).toBe(0);
  });
});
