import { HERO_THEMES } from '../art/hero-themes.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../config.js';
import { heroById } from '../data/heroes.js';
import { dimForBossUltimate, isBossUltimate } from './fighters/boss-ultimate.js';
import { drawFighter } from './fighters/draw-fighter.js';
import { heroSheetFor } from './fighters/hero-sheets.js';
import { drawTrail } from './fighters/trail.js';
import { drawDebugBoxes } from './fx/debug-boxes.js';
import { drawEffects } from './fx/effects.js';
import { drawFloaters } from './fx/floaters.js';
import { drawProjectiles, drawShockwaves } from './fx/hazards.js';
import { drawParticles } from './fx/particles.js';
import { drawSoldiers } from './fx/soldiers.js';
import { drawSummons } from './fx/summons.js';
import { drawCrates } from './scene/crate.js';
import { drawGround } from './scene/ground.js';
import { drawPlatforms } from './scene/platforms.js';
import { drawPickups } from './scene/pickups.js';
import { drawProps } from './scene/props/index.js';
import { scenePalette } from './scene/scene-palette.js';
import { missionOf } from '../sim/stage/mission.js';
import { floorBelow } from '../sim/stage/terrain.js';

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

// the world dims around the hero during the ultimate, in the Shade's own night color
function dimForUltimate(painter, game, cameraX) {
  const { dim } = HERO_THEMES[heroById(game.settings.hero).id].ult;
  painter
    .alpha(game.ultFreeze > 0 ? 0.6 : 0.4)
    .use(dim)
    .rect(cameraX - 8, -8, VIEW_WIDTH + 16, VIEW_HEIGHT + 16);
  painter.alpha(1);
}

// relief soldiers stand behind the fighters, but the ultimate's ranks stand in the hero's light, over
// the dimmed world
function drawFighters(painter, { game, view, cameraX }) {
  const sheet = heroSheetFor(view, game.settings.hero);
  const ultimate = game.ultFreeze > 0 || game.player.state === 'ult';
  if (!ultimate) {
    drawSoldiers(painter, { summons: game.summons, view });
  }
  for (const fighter of drawOrder(game.fighters)) {
    if (fighter === game.player && ultimate) {
      dimForUltimate(painter, game, cameraX);
      drawSoldiers(painter, { summons: game.summons, view });
    }
    if (isBossUltimate(fighter)) {
      dimForBossUltimate(painter, fighter, cameraX);
    }
    drawFighter(painter, {
      fighter,
      sheet,
      enemySheets: view.enemySheets,
      tickCount: game.tickCount,
      floor: floorBelow(game.terrain, fighter.x, fighter.y),
    });
    drawTrail(painter, { fighter, sheet });
  }
}

export function drawWorld(painter, { game, view, cameraX }) {
  const mission = missionOf(game);
  const colors = scenePalette(mission.theme).ground;
  const backdrop = view.backdrops[mission.theme];
  const { terrain, tickCount: tick } = game;
  drawGround(painter, { cameraX, colors, tick, terrain, backdrop });
  drawProps(painter, { cameraX, props: mission.props, sheets: view.propSheets });
  drawPlatforms(painter, { cameraX, terrain: game.terrain, sheets: view.platformSheets });
  drawCrates(painter, game.crates, cameraX);
  drawPickups(painter, game.pickups);
  drawFighters(painter, { game, view, cameraX });
  drawSummons(painter, game.summons, view.fxSheets);
  drawShockwaves(painter, game.shockwaves);
  drawProjectiles(painter, game.projectiles, view.fxSheets);
  drawParticles(painter, game.particles);
  drawEffects(painter, game.effects);
  drawFloaters(painter, game.floaters);
  if (game.settings.hitboxes) {
    drawDebugBoxes(painter, game);
  }
}
