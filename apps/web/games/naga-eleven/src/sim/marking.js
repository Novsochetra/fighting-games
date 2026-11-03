import { homeSpot } from './formation.js';
import { progressOf } from './pitch.js';
import { outfieldOf } from './squad.js';
import { distance } from './vector.js';

const MARK_RANGE = 0.26;
// an opponent further up than this, in the team's own terms, is left to the shape
const DEEPEST_THREAT = 0.62;

function nearestFree(markers, threat, range) {
  let best = null;
  let bestGap = range;

  for (const marker of markers) {
    const gap = distance(marker.home, threat);

    if (!marker.taken && gap < bestGap) {
      best = marker;
      bestGap = gap;
    }
  }

  return best;
}

// the other side's most advanced players are picked up first, each by the free defender or
// midfielder whose place is nearest them; forwards keep their shape
export function marksOf(match, team, busy) {
  const markers = outfieldOf(match, team)
    .filter((player) => player.role !== 'forward' && !busy.includes(player.index))
    .map((player) => ({ player, home: homeSpot(match, player), taken: false }));
  const threats = outfieldOf(match, 1 - team)
    .filter((player) => player.index !== match.ball.owner)
    .filter((player) => progressOf(match, team, player.x) < DEEPEST_THREAT)
    .sort((first, second) => progressOf(match, team, first.x) - progressOf(match, team, second.x));
  const marks = {};

  for (const threat of threats) {
    const marker = nearestFree(markers, threat, match.pitch.length * MARK_RANGE);

    if (marker) {
      marks[marker.player.index] = threat.index;
      marker.taken = true;
    }
  }

  return marks;
}
