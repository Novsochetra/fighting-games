import { ventSteam } from '../../bosses/furnace.js';
import { stomp } from '../../bosses/stomp.js';
import { slipAway } from './blink.js';
import { glider } from './glider.js';
import { illusionist } from './illusionist.js';
import { standStill, walk } from './movement.js';
import { warden } from './warden.js';

const FEINT_TICKS = 12;
const SCUTTLE_TICKS = 30;
const PROWL_TICKS = 22;
const DRIFT_TICKS = 50;
const VENT_TICKS = 200;

// a duelist keeps a sword's length and a step away: he backs off a hero who crowds him, closes on
// one who keeps away, and in between stands his ground or feints a step in
function duelist(boss, { distance, pace }) {
  const ai = boss.ai;
  if (distance > 96) {
    walk(boss, 1, pace);
  } else if (distance < 44) {
    walk(boss, -1, 0.8 * pace);
  } else if (ai.feint > 0) {
    ai.feint--;
    walk(boss, 1, 1.6 * pace);
  } else if (Math.random() < 0.02) {
    ai.feint = FEINT_TICKS;
  } else {
    standStill(boss);
  }
}

// a bulldozer walks at the hero and never steps back, only stopping once in reach
function bulldozer(boss, { distance, pace }) {
  if (distance > 40) {
    walk(boss, 1, pace);
  } else {
    standStill(boss);
  }
}

// a bull keeps room to run: he backs off a hero who comes close, closes on one far away and
// otherwise stands pawing the ground
function bull(boss, { distance, pace }) {
  if (distance > 170) {
    walk(boss, 1, pace);
  } else if (distance < 70) {
    walk(boss, -1, 0.7 * pace);
  } else {
    standStill(boss);
  }
}

// a serpent keeps the middle distance: she slithers back from a hero who crowds her, closes on one
// far off and otherwise sways where she is
function slither(boss, { distance, pace }) {
  if (distance > 180) {
    walk(boss, 1, pace);
  } else if (distance < 90) {
    walk(boss, -1, 0.9 * pace);
  } else {
    standStill(boss);
  }
}

// a scorpion never stands still: she closes on a hero far off, backs from one in her face and in
// between scuttles to and fro at the edge of her sting's reach
function scuttle(boss, { distance, pace }) {
  const ai = boss.ai;
  if (distance > 120) {
    walk(boss, 1, pace);
  } else if (distance < 50) {
    walk(boss, -1, pace);
  } else {
    ai.scuttle = (ai.scuttle ?? 0) + 1;
    walk(boss, Math.floor(ai.scuttle / SCUTTLE_TICKS) % 2 ? -1 : 1, 1.3 * pace);
  }
}

// a pack hunter is quick on his feet: he runs down a hero far off, springs back from one in his
// face and in between darts in and out, never where he was a moment ago
function packHunter(boss, { distance, pace }) {
  const ai = boss.ai;
  if (distance > 110) {
    walk(boss, 1, 1.25 * pace);
  } else if (distance < 46) {
    walk(boss, -1, 1.2 * pace);
  } else {
    ai.prowl = (ai.prowl ?? 0) + 1;
    walk(boss, Math.floor(ai.prowl / PROWL_TICKS) % 2 ? -1 : 1, 1.5 * pace);
  }
}

// a floater hangs at the edge of his reach and drifts slowly to and fro; a hero who crowds him
// finds him gone in a whirl of sand, back where there is room
function floater(boss, { game, distance, pace }) {
  const ai = boss.ai;
  if (distance < 44 && slipAway(game, boss)) {
    return;
  }
  if (distance > 160) {
    walk(boss, 1, pace);
  } else if (distance < 80) {
    walk(boss, -1, 0.9 * pace);
  } else {
    ai.drift = (ai.drift ?? 0) + 1;
    walk(boss, Math.floor(ai.drift / DRIFT_TICKS) % 2 ? -1 : 1, 0.6 * pace);
  }
}

// a juggernaut walks at the hero behind his guard and never steps back, venting steam now and then
function juggernaut(boss, { game, distance, pace }) {
  const ai = boss.ai;
  ai.vent = (ai.vent ?? 0) + 1;
  if (ai.vent % VENT_TICKS === 0) {
    ventSteam(game, boss);
  }
  if (distance > 44) {
    walk(boss, 1, pace);
  } else {
    standStill(boss);
  }
}

// a colossus stomps at the hero and never steps back, the road shaking under each footfall
function colossus(boss, { game, distance, pace }) {
  if (distance > 44) {
    walk(boss, 1, pace);
    stomp(game, boss);
  } else {
    standStill(boss);
  }
}

export const BOSS_MOVEMENT = {
  duelist,
  bulldozer,
  bull,
  slither,
  scuttle,
  packHunter,
  floater,
  juggernaut,
  illusionist,
  colossus,
  glider,
  warden,
};
