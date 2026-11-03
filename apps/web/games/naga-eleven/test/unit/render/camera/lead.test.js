import { describe, expect, it } from 'vitest';
import { createLead, resetLead, stepLead } from '../../../../src/render/camera/lead.js';

const players = [
  { index: 0, team: 0, vx: 0 },
  { index: 1, team: 1, vx: 0 },
];

function leadAfter(lead, ticks, ball) {
  for (let i = 0; i < ticks; i += 1) {
    stepLead(lead, { ball, players });
  }

  return lead.x;
}

describe('where the camera leads', () => {
  it('runs a little ahead of a ball on the move, eased in and capped low', () => {
    const lead = createLead();
    const firstTick = leadAfter(lead, 1, { owner: null, vx: 13 });

    expect(firstTick).toBeGreaterThan(0);
    expect(firstTick).toBeLessThan(3);
    expect(leadAfter(lead, 600, { owner: null, vx: 13 })).toBeLessThanOrEqual(60);
  });

  it('builds toward the goal the side on the ball attacks, and keeps it while the ball is loose', () => {
    const lead = createLead();

    leadAfter(lead, 400, { owner: 0, vx: 0 });

    const built = lead.attack;

    leadAfter(lead, 100, { owner: null, vx: 0 });

    expect(built).toBeGreaterThan(80);
    expect(lead.attack).toBe(built);
    expect(leadAfter(createLead(), 400, { owner: 1, vx: 0 })).toBeLessThan(-80);
  });

  it('swings round slowly when the other side wins the ball', () => {
    const lead = createLead();

    leadAfter(lead, 400, { owner: 0, vx: 0 });

    const steps = [];

    for (let i = 0; i < 30; i += 1) {
      const before = lead.x;

      steps.push(Math.abs(leadAfter(lead, 1, { owner: 1, vx: 0 }) - before));
    }

    expect(Math.max(...steps)).toBeLessThan(3);
    expect(lead.x).toBeGreaterThan(0);
  });

  it('starts again from nothing', () => {
    const lead = createLead();

    leadAfter(lead, 50, { owner: 0, vx: 0 });
    resetLead(lead);

    expect(lead).toEqual(createLead());
  });
});
