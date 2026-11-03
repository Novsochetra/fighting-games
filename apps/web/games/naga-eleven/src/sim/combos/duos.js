import { DUO_COMBOS } from '../../data/combos.js';
import { DUELS } from '../../data/duels.js';
import { goalShareOf } from '../duel/geometry.js';
import { isRested } from '../skills/fire.js';
import { distance } from '../vector.js';
import { sideOf } from '../squad.js';

// the striker has this long after the partner played it to strike it first time
const PASS_TICKS = 150;

export const DUO_MOVES = new Set(DUO_COMBOS.map((duo) => duo.move));

export const duoOf = (move) => DUO_COMBOS.find((duo) => duo.move === move) ?? null;

const isOn = (match, duo) => match.systems?.duos?.includes(duo.move) ?? true;

export const fitsPartner = (player, duo) =>
  duo.partner.star ? player.star === duo.partner.star : player.post === duo.partner.post;

const reaches = (match, from, to, duo) => distance(from, to) <= duo.reach * match.pitch.length;

const inRange = (match, striker, duo) =>
  goalShareOf(match, striker) < (duo.range ?? DUELS.specialRange);

// a ball laid back to a striker deeper than the partner is no cross for a header or an overhead
// kick, so a duo's pass goes toward goal
const isAhead = (match, partner, striker) =>
  goalShareOf(match, striker) < goalShareOf(match, partner);

// the striker: on, his, a move he knows if it needs one, his share, in range and rested
function canStrike(match, striker, duo) {
  return (
    isOn(match, duo) &&
    striker.star === duo.striker &&
    (!duo.needs || striker.moves.includes(duo.needs)) &&
    striker.spirit >= duo.shares.striker &&
    isRested(striker) &&
    striker.stun === 0 &&
    inRange(match, striker, duo)
  );
}

const canPartner = (partner, duo) =>
  fitsPartner(partner, duo) && partner.stun === 0 && partner.spirit >= duo.shares.partner;

function partnerOf(match, striker, duo) {
  const mates = sideOf(match, striker.team).filter(
    (mate) => mate !== striker && canPartner(mate, duo) && reaches(match, striker, mate, duo),
  );

  mates.sort((first, second) => distance(first, striker) - distance(second, striker));

  return mates[0] ?? null;
}

// the duos he may strike with the ball at his feet: those struck by two, his partner near
export function strikeDuosOf(match, striker) {
  return DUO_COMBOS.filter((duo) => duo.entry === 'strike' && canStrike(match, striker, duo))
    .map((duo) => ({ duo, partner: partnerOf(match, striker, duo) }))
    .filter((entry) => entry.partner !== null);
}

// the duo a partner's full-charge PASS plays: to a striker in reach who can strike it
export function duoPassOf(match, partner) {
  for (const duo of DUO_COMBOS) {
    const ready = duo.entry === 'pass' && isRested(partner) && canPartner(partner, duo);
    const striker = ready
      ? sideOf(match, partner.team).find(
          (mate) =>
            mate !== partner &&
            canStrike(match, mate, duo) &&
            reaches(match, partner, mate, duo) &&
            isAhead(match, partner, mate),
        )
      : null;

    if (striker) {
      return { duo, striker };
    }
  }

  return null;
}

// a duo's pass on its way to him, still the partner's ball: struck first time it is the duo
export function duoStrikeOf(match, striker) {
  const pass = match.duoPass;
  const live =
    pass?.striker === striker.index &&
    match.ball.lastTouch === pass.partner &&
    match.tick - pass.tick <= PASS_TICKS;
  const duo = live ? duoOf(pass.move) : null;

  if (!duo || striker.spirit < duo.shares.striker || !inRange(match, striker, duo)) {
    return null;
  }

  return { duo, partner: match.players[pass.partner] };
}
