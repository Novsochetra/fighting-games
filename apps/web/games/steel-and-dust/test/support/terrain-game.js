import { layoutTerrain } from '../../src/data/missions/terrain.js';
import { groundAt } from '../../src/sim/stage/terrain.js';
import { createPlayingGame } from './test-game.js';

// one zone that starts at x = 0, so ground points and platform spots are world x
export function buildTerrain({ length = 1200, ground = [], platforms = [] } = {}) {
  return layoutTerrain([{ ground, platforms }], [{ left: 0, right: length }], length);
}

// a mission's own zones, each with a bank before it (a sheer face up, a slope down), a hill
// inside it and a log above the hill
export function hillyTerrain(mission) {
  const zoneSpec = {
    ground: [
      [-230, 0],
      [-230, 16],
      [-150, 16],
      [-100, 0],
      [150, 0],
      [210, 24],
      [290, 24],
      [350, 0],
    ],
    platforms: [{ at: 220, width: 60, rise: 36, kind: 'log' }],
  };
  return layoutTerrain(
    mission.zones.map(() => zoneSpec),
    mission.zones,
    mission.length,
  );
}

// swaps a terrain into a running game and stands the hero and the crates on it
export function useTerrain(game, terrain) {
  game.terrain = terrain;
  game.player.y = groundAt(terrain, game.player.x);
  for (const crate of game.crates) {
    crate.y = groundAt(terrain, crate.x);
  }
  return game;
}

export function createTerrainGame(spec, options) {
  return useTerrain(createPlayingGame(options), buildTerrain(spec));
}

export function placeFighter(game, fighter, { x, y }) {
  Object.assign(fighter, { x, y: y ?? groundAt(game.terrain, x), vx: 0, vy: 0 });
}
