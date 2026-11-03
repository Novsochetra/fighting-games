import { clamp } from '../../sim/vector.js';

// the camera looks where the ball is going, so a run keeps room ahead of it: a little along the
// ball's travel, eased slowly, and more toward the goal the side on the ball attacks, built up only
// while that side keeps it, so a turnover swings the view round in one slow pan and a pass or a
// loose ball moves it not at all; a lead that follows each pass and change of owner at once makes
// the view lurch both ways. Along the pitch only: a lead in depth would tilt the view.
const RUN = { ticks: 24, most: 56, ease: 0.025 };
const ATTACK = { room: 128, ease: 0.01 };

export const createLead = () => ({ x: 0, run: 0, attack: 0 });

export function resetLead(lead) {
  Object.assign(lead, createLead());
}

const runLead = (moving) => clamp(moving.vx * RUN.ticks, -RUN.most, RUN.most);

export function stepLead(lead, match) {
  const { ball, players } = match;
  const owner = ball.owner === null || ball.owner === undefined ? null : players[ball.owner];

  lead.run += (runLead(owner ?? ball) - lead.run) * RUN.ease;

  if (owner) {
    lead.attack += ((owner.team === 0 ? 1 : -1) * ATTACK.room - lead.attack) * ATTACK.ease;
  }

  lead.x = lead.run + lead.attack;
}
