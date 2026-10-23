import { BOSS_KITS } from '../enemies/boss-kits/index.js';
import { ENEMY_MOVES } from '../enemies/enemy-moves.js';
import { ENEMY_TYPES } from '../enemies/enemy-types.js';
import { missionAt } from './index.js';

function kitMoves(kit) {
  const skills = kit.skills.map((skill) => skill.move);
  const swaps = Object.values(kit.phaseTwo?.swaps ?? {});
  const opener = kit.phaseTwo?.opener ? [kit.phaseTwo.opener] : [];
  return [...kit.close.moves, ...skills, ...swaps, kit.ultimate.move, ...opener];
}

// the raiders a boss calls onto the road itself, as the Gnoll Packlord's howls bring hounds
function calledIn(kind) {
  const kit = BOSS_KITS[kind];
  return kit ? kitMoves(kit).flatMap((id) => ENEMY_MOVES[id].packKind ?? []) : [];
}

// every kind that can walk onto a mission's road: its waves (its mid-bosses and boss among them),
// the reinforcements its raiders and a war horn call, and a pack a boss howls in
export function missionEnemyKinds(index) {
  const mission = missionAt(index);
  const waves = mission.zones.flatMap((zone) => zone.waves.flatMap((wave) => wave.kinds));
  const kinds = new Set([...waves, ...mission.reinforcements]);
  for (const kind of [...kinds]) {
    calledIn(kind).forEach((called) => kinds.add(called));
  }
  return kinds;
}

// the sprite sheets those kinds are drawn from
export function missionEnemySheets(index) {
  return new Set([...missionEnemyKinds(index)].map((kind) => ENEMY_TYPES[kind].sprite));
}
