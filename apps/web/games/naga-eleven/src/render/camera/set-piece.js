import { FORMATS } from '../../data/formats.js';

// a corner is framed between the flag and the penalty spot until it is taken, so the box and the
// players waiting in it are seen with the taker, as television frames one
export function cornerFocus(match) {
  const { restart, pitch } = match;

  if (match.phase !== 'restart' || restart?.kind !== 'corner') {
    return null;
  }

  const spot = FORMATS[match.format]?.penaltySpot ?? pitch.length / 10;
  const penaltyX = restart.x < pitch.length / 2 ? spot : pitch.length - spot;

  return { x: (restart.x + penaltyX) / 2, y: (restart.y + pitch.width / 2) / 2 };
}
