// the hand-off between two missions, in ticks: the title cards stamped in a letter at a time and
// the wipe that closes over a cleared road; the pictures and the sounds both keep to these
export const CARD_STAGGER = 3;
export const CARD_DROP_TICKS = 9;
// a letter's fall overshoots its place and bounces back: this is the tick it first strikes it
export const CARD_HIT_TICK = 4;
export const CARD_HOT_TICKS = 4;
// the clear card waits out the slow motion of the boss's fall, a mission's own card the wipe
// opening past the middle of the screen
const CLEAR_CARD_DELAY = 19;
const OPEN_CARD_DELAY = 12;
export const WIPE_TICKS = 44;
// the clear's call starts while the boss still falls in slow motion, so its "Complete!" is said as
// the letters stamp in and is over before the wipe comes; a mission's own call starts with its card
export const CLEAR_CALL_TICK = 8;

export function cardLetterCount(text) {
  return text.replaceAll(' ', '').length;
}

// how long the letters of a stamp banner have been falling
export function cardAge(banner, clearing) {
  return banner.age - (clearing ? CLEAR_CARD_DELAY : OPEN_CARD_DELAY);
}

export function letterHitsAt(index) {
  return index * CARD_STAGGER + CARD_HIT_TICK;
}

// once every letter is down and has cooled from the stamp
export function cardDoneAt(letterCount) {
  return (letterCount - 1) * CARD_STAGGER + CARD_DROP_TICKS + CARD_HOT_TICKS;
}

// the announcer's calls, one recorded clip each in assets/audio/announcer/ (voiced by
// tools/announcer_voice.py); the last mission's clear call ends "All clear!"
function call(missionNumber, kind) {
  return `mission-${String(missionNumber).padStart(2, '0')}-${kind}`;
}

export function startCall(missionNumber) {
  return call(missionNumber, 'start');
}

export function clearCall(missionNumber) {
  return call(missionNumber, 'complete');
}
