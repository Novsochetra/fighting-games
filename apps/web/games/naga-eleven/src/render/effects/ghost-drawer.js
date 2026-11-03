import { animationOf } from '../actors/animation.js';
import { drawActor } from '../actors/draw-actor.js';
import { looksOf } from '../actors/looks.js';
import { startsOf } from '../actors/memory.js';

// a player's sprite as it is now, its feet at a point of the view, for his afterimages
export function ghostDrawer(art, match, { scoringTeam = null } = {}) {
  const { players: looks } = looksOf(match);

  return (context, player, foot) => {
    const starts = startsOf(art.memory, match, player);
    const state = animationOf(player, match, { scoringTeam, starts, kick: art.kick });

    drawActor(context, art, { look: looks[player.index], state, x: foot.x, y: foot.y });
  };
}
