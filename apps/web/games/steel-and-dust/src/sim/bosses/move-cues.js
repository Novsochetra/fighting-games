import { shake } from '../fx/camera-fx.js';
import { lobBoulder } from '../hazards/boulders.js';
import { spawnCrescent } from '../hazards/crescents.js';
import { spawnShockwave } from '../hazards/shockwaves.js';
import { spitVenom } from '../hazards/venom-globs.js';
import { raiseSpikes } from '../hazards/spikes.js';
import { releaseWasp, slamPincers, waspAt } from '../hazards/wasps.js';
import { addBurst } from '../summons/bursts.js';
import { announceBossUltimate } from './announce.js';
import {
  digIn,
  erupt,
  halt,
  isTunnelling,
  stopsTunnelling,
  surface,
  surfacesNow,
  tunnelAfterHero,
} from './burrow.js';
import { circleHeldHero, flashGaze, warnOfGaze, whileHeld } from './hypnotic-gaze.js';
import { dropRockfall, rockfallIndex } from './rockfall.js';
import { blowWarHorn } from './war-horn.js';

// the light catches the blade drawn back behind the boss, a beat before it springs
function glint(game, fighter) {
  const x = fighter.x - fighter.facing * 18;
  addBurst(game, { sprite: 'glint', x, y: fighter.y - 14, scale: 1 });
}

// stars circle the head of a dazed boss, a new ring every so often while the daze lasts
function circleStars(game, fighter, move) {
  const x = fighter.x + fighter.facing * 4;
  addBurst(game, { sprite: 'stars', x, y: fighter.y + move.stars.y, scale: 1 });
}

const whileDazed = (move, time) =>
  Boolean(move.stars) && time % move.stars.every === 0 && time < move.startup + move.active;

function quake(game, fighter) {
  spawnShockwave(game, fighter);
  shake(game, 4, 14);
}

const atStrike = (field) => (move, time) => Boolean(move[field]) && time === move.startup;

// [is it this tick of the move, what happens]: a boss move's own beats, on the ticks its data names
const CUES = [
  [(move, time) => time === move.glint, glint],
  [(move, time) => time === 0 && move.bossUltimate && !move.continues, announceBossUltimate],
  [whileDazed, circleStars],
  [atStrike('horn'), (game, fighter, move) => blowWarHorn(game, fighter, move.horn)],
  [(move, time) => move.crescents?.includes(time), spawnCrescent],
  [atStrike('boulder'), lobBoulder],
  [atStrike('spikes'), (game, fighter, move) => raiseSpikes(game, fighter, move.spikes)],
  [(move, time) => move.quakes?.includes(time), quake],
  [atStrike('globs'), (game, fighter, move) => spitVenom(game, fighter, move.globs)],
  [(move, time) => time === move.gaze?.warnAt, warnOfGaze],
  [(move, time) => time === move.gaze?.flashAt, flashGaze],
  [whileHeld, circleHeldHero],
  [(move, time) => time === 0 && Boolean(move.underground), digIn],
  [isTunnelling, tunnelAfterHero],
  [stopsTunnelling, halt],
  [surfacesNow, surface],
  [atStrike('erupts'), erupt],
  [
    (move, time) => Boolean(waspAt(move, time)),
    (game, fighter, move, time) => releaseWasp(game, fighter, waspAt(move, time)),
  ],
  [(move, time) => time === move.slamAt, slamPincers],
  [
    (move, time) => move.rockfall && rockfallIndex(move, time) >= 0,
    (game, fighter, move, time) => dropRockfall(game, fighter, rockfallIndex(move, time)),
  ],
];

export function playMoveCues(game, fighter, move, time) {
  for (const [isNow, play] of CUES) {
    if (isNow(move, time)) {
      play(game, fighter, move, time);
    }
  }
}
