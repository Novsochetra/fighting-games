import { HAIRS, SKINS, STAR_LOOKS, TEAM_LOOKS } from '../../art/actors.js';
import { matchKits } from './kit-clash.js';
import { numberColoursOf, numberFillOf } from './number-colours.js';

const kept = new WeakMap();

function faceOf(player, kitId) {
  const pool = TEAM_LOOKS[kitId] ?? TEAM_LOOKS.default;
  const star = STAR_LOOKS[player.star];
  const place = player.slotIndex ?? player.index;

  return {
    skin: star?.skin ?? pool.skins[place % pool.skins.length],
    hair: star?.hair ?? pool.hairs[(place * 2 + 1) % pool.hairs.length],
  };
}

// a look is a kit's ramps with a skin and a hair, and a key that names the sheet drawn in it
function lookOf(player, kits) {
  const kit = kits[player.team] ?? kits[0];
  const isKeeper = player.role === 'keeper';
  const face = faceOf(player, kit.id);
  const ramps = isKeeper ? kit.keeper : kit.outfield;
  const choice = isKeeper ? kit.keeperChoice : kit.choice;

  return {
    ...ramps,
    skin: SKINS[face.skin],
    hair: HAIRS[face.hair],
    numberColours: numberColoursOf(numberFillOf(kit.id, choice, ramps.shirt), ramps.shirt),
    key: `${kit.id}:${choice}:${face.skin}:${face.hair}`,
  };
}

export function looksOf(match) {
  const known = kept.get(match);

  if (known && known.count === match.players.length) {
    return known;
  }

  const kits = matchKits(match);
  const looks = {
    kits,
    count: match.players.length,
    players: match.players.map((player) => lookOf(player, kits)),
  };

  kept.set(match, looks);

  return looks;
}
