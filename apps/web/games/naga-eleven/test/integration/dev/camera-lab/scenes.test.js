import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS } from '../../../../dev/camera-lab/src/options.js';
import { createPlayer, seek } from '../../../../dev/camera-lab/src/player.js';
import { createScene } from '../../../../dev/camera-lab/src/scenes.js';
import { strictContext } from '../../render/duel/strict-context.js';

const playerFor = (changes) => {
  const settings = { ...DEFAULT_SETTINGS, ...changes };

  return createPlayer(() => createScene(settings));
};

const stagesOf = (player) => player.stages.map((entry) => entry.stage);

function drawnThrough(player) {
  const { context, bad } = strictContext();

  for (let frame = 0; frame <= player.total; frame += 9) {
    seek(player, frame);
    player.scene.draw(context, { tick: frame });
  }

  return bad;
}

describe('the camera lab plays what it is asked', { timeout: 30000 }, () => {
  it.each([
    ['a special that scores', { outcome: 'goal' }],
    ['a catch', { outcome: 'catch' }],
    ['a punch with no skill', { outcome: 'punch', guard: '' }],
    ['a combo the keeper walls', { shot: 'flying-naga', outcome: 'wall', guard: 'angkor-wall' }],
    ['a one on one', { scene: 'clash', attack: 'pass', defend: 'intercept', word: 'cut' }],
    ['the save cam of open play', { scene: 'saveCam', outcome: 'parry' }],
  ])('%s, drawn from start to end', (_, changes) => {
    const player = playerFor(changes);

    expect(player.total).toBeGreaterThan(0);
    expect(drawnThrough(player)).toEqual([]);
  });

  it('plays the outcome picked, whatever the duel drew', () => {
    expect(stagesOf(playerFor({ outcome: 'goal' }))).toContain('finale');
    expect(stagesOf(playerFor({ outcome: 'catch' }))).not.toContain('finale');
  });

  it('rides the ball to the goal on a full camera only, and plays short once seen', () => {
    const full = playerFor({ camera: 'full' });
    const seen = playerFor({ camera: 'full', repeat: true });

    expect(stagesOf(full)).toContain('chase');
    expect(stagesOf(playerFor({ camera: 'off' }))).not.toContain('chase');
    expect(seen.total).toBeLessThan(full.total);
  });

  it('decides a one on one as asked', () => {
    const player = playerFor({ scene: 'clash', word: 'broke', attack: 'hanuman-leap' });

    expect(stagesOf(player)).toEqual([
      'intro',
      'versus',
      'wait',
      'cutin',
      'clash',
      'result',
      'outro',
      'done',
    ]);
  });
});
