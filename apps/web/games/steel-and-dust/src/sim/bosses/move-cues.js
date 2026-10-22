import { activeEnd } from '../../data/moves/define-move.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { shake } from '../fx/camera-fx.js';
import { setBlazes } from '../hazards/blazes.js';
import { lobBoulder } from '../hazards/boulders.js';
import { spawnCrescent } from '../hazards/crescents.js';
import { raiseDustDevils } from '../hazards/dust-devils.js';
import { releaseScarabs } from '../hazards/scarabs.js';
import { headAt, spitHead } from '../hazards/naga-bolts.js';
import { spawnShockwave } from '../hazards/shockwaves.js';
import { lobSlagPot } from '../hazards/slag-pots.js';
import { spitVenom } from '../hazards/venom-globs.js';
import { raiseSpikes } from '../hazards/spikes.js';
import { fireThunderBolt } from '../hazards/thunder-bolts.js';
import { conjureOrb } from '../hazards/rainbow-orb.js';
import { releaseTide } from '../hazards/tides.js';
import { releaseWasp, slamPincers, waspAt } from '../hazards/wasps.js';
import { addBurst } from '../summons/bursts.js';
import { announceBossUltimate } from './announce.js';
import { BAYON_CUES } from './bayon-cues.js';
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
import { callGreatStrike, callStormWave, stormWaveAt } from './eye-of-storm.js';
import { fireLance, lanceAt, roar, roarsAt, vent, ventsAt } from './furnace.js';
import { circleHeldHero, flashGaze, warnOfGaze, whileHeld } from './hypnotic-gaze.js';
import { blinkEndToEnd, castMirages } from './mirage.js';
import { callSerpent, callSpirit, crashCoil, serpentRisesAt, sweepAt } from './naga.js';
import { feed, howl, leap, smashBones, trailEyes } from './pack-hunt.js';
import { dropRockfall, rockfallIndex } from './rockfall.js';
import { castCurse, curseReleases, cursingNow, releaseCurse, watchJars } from './sun-curse.js';
import { blowWarHorn } from './war-horn.js';

// the blade drawn back behind him, his head, and the size of what sparkles there, in his own units
const BLADE_BEHIND = { ahead: -18, up: 14 };
const SPARKLE_SIZE = 1;

// the light catches the blade drawn back behind the boss, a beat before it springs
function glint(game, fighter) {
  const at = bodyPoint(fighter, BLADE_BEHIND);
  addBurst(game, { sprite: 'glint', ...at, scale: bodySize(fighter, SPARKLE_SIZE) });
}

// stars circle the head of a dazed boss, a new ring every so often while the daze lasts
function circleStars(game, fighter, move) {
  const at = bodyPoint(fighter, { ahead: 4, up: move.stars.up });
  addBurst(game, { sprite: 'stars', ...at, scale: bodySize(fighter, SPARKLE_SIZE) });
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
  [(move, time) => Boolean(move.howls?.includes(time)), howl],
  [(move, time) => time === move.leapAt, leap],
  [atStrike('bones'), smashBones],
  [
    (move, time) => Boolean(move.eyeTrail) && time >= move.startup && time < activeEnd(move),
    trailEyes,
  ],
  [(move) => Boolean(move.heals), feed],
  [atStrike('thunderBolt'), fireThunderBolt],
  [atStrike('devils'), raiseDustDevils],
  [
    (move, time) => Boolean(stormWaveAt(move, time)),
    (game, fighter, move, time) => callStormWave(game, fighter, stormWaveAt(move, time)),
  ],
  [(move, time) => time === move.storm?.bigAt, callGreatStrike],
  [atStrike('blaze'), (game, fighter, move) => setBlazes(game, fighter, move.blaze)],
  [atStrike('slagPot'), lobSlagPot],
  [roarsAt, roar],
  [lanceAt, fireLance],
  [ventsAt, vent],
  [atStrike('mirages'), castMirages],
  [atStrike('blink'), blinkEndToEnd],
  [atStrike('scarabs'), releaseScarabs],
  [atStrike('curse'), castCurse],
  [cursingNow, watchJars],
  [curseReleases, releaseCurse],
  [atStrike('splash'), crashCoil],
  [(move, time) => Boolean(move.tides?.includes(time)), releaseTide],
  [
    (move, time) => Boolean(headAt(move, time)),
    (game, fighter, move, time) => spitHead(game, fighter, headAt(move, time)),
  ],
  [(move, time) => time === move.rainbow?.orbAt, conjureOrb],
  [
    (move, time) => Boolean(sweepAt(move, time)),
    (game, fighter, move, time) => callSpirit(game, fighter, sweepAt(move, time)),
  ],
  [serpentRisesAt, callSerpent],
  [
    (move, time) => move.rockfall && rockfallIndex(move, time) >= 0,
    (game, fighter, move, time) => dropRockfall(game, fighter, rockfallIndex(move, time)),
  ],
  ...BAYON_CUES,
];

export function playMoveCues(game, fighter, move, time) {
  for (const [isNow, play] of CUES) {
    if (isNow(move, time)) {
      play(game, fighter, move, time);
    }
  }
}
