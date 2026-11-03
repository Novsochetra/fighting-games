import { describe, expect, it } from 'vitest';
import { DEFAULT_STRENGTH, teamStrength } from '../../../src/campaign/team-strength.js';
import { makeTeam } from '../../support/campaign-fixtures.js';

const player = (role, stats) => ({ role, stats });

describe("a team's strength", () => {
  it("is its players' average", () => {
    expect(teamStrength(makeTeam({ id: 'even', strength: 64 }))).toBe(64);
  });

  it('rates a keeper by his keeping and an outfield player by his other stats', () => {
    const team = {
      players: [
        player('keeper', { keeping: 80, shot: 10 }),
        player('forward', {
          speed: 60,
          shot: 60,
          pass: 60,
          dribble: 60,
          tackle: 60,
          stamina: 60,
          keeping: 1,
        }),
      ],
    };

    expect(teamStrength(team)).toBe(70);
  });

  it('is average for a team with no players or none at all', () => {
    expect(teamStrength(null)).toBe(DEFAULT_STRENGTH);
    expect(teamStrength({ players: [] })).toBe(DEFAULT_STRENGTH);
  });
});
