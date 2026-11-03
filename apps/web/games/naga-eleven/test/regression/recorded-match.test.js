import { describe, expect, it } from 'vitest';
import { createMatch } from '../../src/sim/create-match.js';
import { tick } from '../../src/sim/tick.js';
import { playTicks } from '../support/match-driver.js';

const EVERY = 120;
const round = (value) => Math.round(value * 1000) / 1000;

function snapshotOf(match) {
  const { ball } = match;

  return {
    tick: match.tick,
    phase: match.phase,
    half: match.half,
    minute: match.minute,
    score: [...match.score],
    controlled: match.controlled,
    restart: match.restart?.kind ?? null,
    ball: [round(ball.x), round(ball.y), round(ball.z), ball.owner],
    players: match.players.map((player) => [round(player.x), round(player.y)]),
  };
}

function record(match, ticks, step = () => tick(match)) {
  const frames = [];

  for (let i = 1; i <= ticks; i += 1) {
    step(i);

    if (i % EVERY === 0) {
      frames.push(snapshotOf(match));
    }
  }

  return `${JSON.stringify(frames, null, 1)}\n`;
}

// a player who runs at goal along the top of the pitch, shoots every second and a half, lofts a
// pass now and then and slides in whenever they lose it
function scriptedPlayer(match) {
  return (i) => {
    const shooting = i % 90 < 20;
    const lofting = i % 200 < 16;
    const held = {
      right: true,
      up: i % 240 < 60,
      sprint: i % 300 < 150,
      shoot: shooting,
      pass: lofting,
    };
    const pressed = { shoot: i % 90 === 0, pass: i % 200 === 0 };

    playTicks(match, 1, { held, pressed });
  };
}

// Any change to the sim's arithmetic or the order it draws its random numbers shows up here; a
// change meant to play differently records them again with npm run test:regression -- -u
describe('recorded matches', () => {
  it('replays an 11 v 11 the computer plays both sides of', async () => {
    await expect(record(createMatch({ seed: 2026 }), 3600)).toMatchFileSnapshot(
      './fixtures/computer-match.json',
    );
  });

  it('replays a 7 v 7 the computer plays both sides of, through half time', async () => {
    await expect(
      record(createMatch({ seed: 7, format: '7', halfSeconds: 40 }), 6000),
    ).toMatchFileSnapshot('./fixtures/computer-match-7.json');
  });

  it('replays a match against a scripted player', async () => {
    const match = createMatch({ seed: 77, humanTeam: 0 });

    await expect(record(match, 3600, scriptedPlayer(match))).toMatchFileSnapshot(
      './fixtures/scripted-player.json',
    );
  });
});
