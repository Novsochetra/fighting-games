import { COLORS } from '../art/colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../config.js';
import { drawFighter } from './fighters/draw-fighter.js';
import { drawTrail } from './fighters/trail.js';
import { drawDebugBoxes } from './fx/debug-boxes.js';
import { drawEffects } from './fx/effects.js';
import { drawFloaters } from './fx/floaters.js';
import { drawProjectiles, drawShockwaves } from './fx/hazards.js';
import { drawParticles } from './fx/particles.js';
import { drawCrates } from './scene/crate.js';
import { drawGround } from './scene/ground.js';
import { drawPickups } from './scene/pickups.js';
import { drawProps } from './scene/props/index.js';

// knocked-out fighters go behind the living, and the hero goes in front of the raiders
function drawOrder(fighters) {
  return fighters
    .slice()
    .sort(
      (first, second) =>
        (first.state === 'ko' ? 0 : 1) - (second.state === 'ko' ? 0 : 1) ||
        (first.side === 'player' ? 1 : 0) - (second.side === 'player' ? 1 : 0),
    );
}

// the world dims around the hero during the ultimate
function dimForUltimate(painter, game, cameraX) {
  painter
    .alpha(game.ultFreeze > 0 ? 0.6 : 0.35)
    .use(COLORS.night)
    .rect(cameraX - 8, -8, VIEW_WIDTH + 16, VIEW_HEIGHT + 16);
  painter.alpha(1);
}

function drawFighters(painter, { game, view, cameraX }) {
  for (const fighter of drawOrder(game.fighters)) {
    if (fighter === game.player && (game.ultFreeze > 0 || game.player.state === 'ult')) {
      dimForUltimate(painter, game, cameraX);
    }
    drawFighter(painter, { fighter, sheet: view.sheet, tickCount: game.tickCount });
    drawTrail(painter, { fighter, sheet: view.sheet });
  }
}

export function drawWorld(painter, { game, view, cameraX }) {
  drawGround(painter, cameraX);
  drawProps(painter, cameraX);
  drawCrates(painter, game.crates, cameraX);
  drawPickups(painter, game.pickups);
  drawFighters(painter, { game, view, cameraX });
  drawShockwaves(painter, game.shockwaves);
  drawProjectiles(painter, game.projectiles);
  drawParticles(painter, game.particles);
  drawEffects(painter, game.effects);
  drawFloaters(painter, game.floaters);
  if (game.settings.hitboxes) {
    drawDebugBoxes(painter, game);
  }
}
