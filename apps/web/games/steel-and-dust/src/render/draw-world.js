import { HERO_THEMES } from '../art/hero-themes.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../config.js';
import { heroById } from '../data/heroes.js';
import { dimForBossUltimate, isBossUltimate } from './fighters/boss-ultimate.js';
import { drawFighter } from './fighters/draw-fighter.js';
import { heroSheetFor } from './fighters/hero-sheets.js';
import { drawSinking } from './fighters/sinking.js';
import { drawTrail } from './fighters/trail.js';
import { drawCarvings } from './fx/carvings.js';
import { drawDebugBoxes } from './fx/debug-boxes.js';
import { drawEchoes } from './fx/echoes.js';
import { drawEffects } from './fx/effects.js';
import { drawFloaters } from './fx/floaters.js';
import { drawGroundHazards, drawProjectiles, drawShockwaves } from './fx/hazards.js';
import { drawParticles } from './fx/particles.js';
import { drawSoldiers } from './fx/soldiers.js';
import { drawBehindBursts, drawSummons } from './fx/summons.js';
import { drawCrates } from './scene/crate.js';
import { drawGround } from './scene/ground.js';
import { drawMoats } from './scene/moats.js';
import { drawNestTrees } from './scene/nest-trees.js';
import { drawPlatforms } from './scene/platforms.js';
import { drawOverheadProps, drawRoadProps } from './scene/road-props.js';
import { drawTrees } from './scene/trees.js';
import { drawGroundLoot, drawLootSparkles } from './scene/loot.js';
import { drawChests } from './scene/loot-chest.js';
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

// relief soldiers, carvings, the hero's echoes and the bursts rising behind him
function drawBehindFighters(painter, { game, view }) {
  drawSoldiers(painter, { summons: game.summons, view });
  drawCarvings(painter, { summons: game.summons, view });
  drawEchoes(painter, { summons: game.summons, view });
  drawBehindBursts(painter, game.summons, view.fxSheets);
}

function drawOne(painter, { game, view, fighter, sheet, cameraX }) {
  if (isBossUltimate(fighter)) {
    dimForBossUltimate(painter, fighter, cameraX);
  }
  drawSinking(painter, fighter, () =>
    drawFighter(painter, {
      fighter,
      sheet,
      enemySheets: view.enemySheets,
      tickCount: game.tickCount,
      floor: floorBelow(game.terrain, fighter.x, fighter.y),
    }),
  );
  drawTrail(painter, { fighter, sheet });
}

// loot lies on the road over the fallen but under everyone still standing
function drawLootOnRoad(painter, { game, view, cameraX }) {
  drawChests(painter, { game, sheets: view.lootSheets });
  drawGroundLoot(painter, { game, sheets: view.lootSheets, cameraX });
}

// what stands behind the fighters stands there, but in the ultimate it stands in the hero's light,
// over the dimmed world
function drawFighters(painter, { game, view, cameraX }) {
  const sheet = heroSheetFor(view, game.settings.hero);
  const ultimate = game.ultFreeze > 0 || game.player.state === 'ult';
  if (!ultimate) {
    drawBehindFighters(painter, { game, view });
  }
  let lootDrawn = false;
  for (const fighter of drawOrder(game.fighters)) {
    if (!lootDrawn && fighter.state !== 'ko') {
      drawLootOnRoad(painter, { game, view, cameraX });
      lootDrawn = true;
    }
    if (fighter === game.player && ultimate) {
      dimForUltimate(painter, game, cameraX);
      drawBehindFighters(painter, { game, view });
    }
    drawOne(painter, { game, view, fighter, sheet, cameraX });
  }
  if (!lootDrawn) {
    drawLootOnRoad(painter, { game, view, cameraX });
  }
}

export function drawWorld(painter, { game, view, cameraX }) {
  const mission = missionOf(game);
  const palette = scenePalette(mission.theme);
  const colors = palette.ground;
  const backdrop = view.backdrops[mission.theme];
  const { terrain, tickCount: tick } = game;
  // the water lies behind the road, so each bank's rock face stands over its edge and runs on
  // down into it
  drawMoats(painter, { water: terrain.water, cameraX, tick, glints: palette.ambient.glints });
  drawGround(painter, { cameraX, colors, tick, terrain, backdrop });
  drawProps(painter, { cameraX, props: mission.props, sheets: view.propSheets });
  drawTrees(painter, view.fxSheets, { trees: game.trees, cameraX });
  drawNestTrees(painter, view.fxSheets, { nests: game.nests, backdrop, cameraX });
  drawPlatforms(painter, { cameraX, terrain: game.terrain, sheets: view.platformSheets });
  drawCrates(painter, game.crates, cameraX);
  drawRoadProps(painter, { game, view, cameraX });
  drawPickups(painter, game.pickups);
  drawGroundHazards(painter, game.projectiles, view.fxSheets);
  drawFighters(painter, { game, view, cameraX });
  drawOverheadProps(painter, { game, view, cameraX });
  drawSummons(painter, game.summons, view.fxSheets);
  drawShockwaves(painter, game.shockwaves);
  drawProjectiles(painter, game.projectiles, view.fxSheets);
  drawParticles(painter, game.particles);
  drawEffects(painter, game.effects);
  drawLootSparkles(painter, { game, sheets: view.lootSheets });
  drawFloaters(painter, game.floaters);
  if (game.settings.hitboxes) {
    drawDebugBoxes(painter, game);
  }
}
