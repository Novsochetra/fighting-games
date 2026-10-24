import { LOOT_VALUES } from './loot.js';

// the summary of what the hero gathered on a road, in ticks into its clear: it opens once the clear
// card's letters are down, brings in each kind of loot in turn with its count rolling up a step at a
// time, then the purse's take, and holds a moment to be read before the wipe; the pictures
// (render/hud/mission-summary.js) and the sounds (sim/stage/summary-cues.js) both keep to it
export const SUMMARY = {
  openAt: 100,
  openTicks: 10,
  rowTicks: 26,
  popTicks: 8,
  countFrom: 4,
  stepTicks: 3,
  maxSteps: 7,
  holdTicks: 70,
};

export const SUMMARY_KINDS = ['coin', 'gem', 'apple'];

// the purse's take comes in as one more row after the kinds
export const TOTAL_ROW = SUMMARY_KINDS.length;

export function rowStartsAt(row) {
  return SUMMARY.openAt + SUMMARY.openTicks + row * SUMMARY.rowTicks;
}

// once the take has rolled up and been read; the clear's wipe starts here
export const SUMMARY_TICKS = rowStartsAt(TOTAL_ROW + 1) + SUMMARY.holdTicks;

// a count rolls up one step a piece, up to a few steps for a big one
export function stepCount(value) {
  return Math.min(value, SUMMARY.maxSteps);
}

// how many of a row's steps have landed `since` ticks after it started
function stepsLanded(value, since) {
  const landed = Math.floor((since - SUMMARY.countFrom) / SUMMARY.stepTicks) + 1;
  return Math.max(0, Math.min(stepCount(value), landed));
}

// the step that lands on this tick, or -1
export function stepNow(value, since) {
  const sinceFirst = since - SUMMARY.countFrom;
  const step = sinceFirst / SUMMARY.stepTicks;
  return sinceFirst >= 0 && Number.isInteger(step) && step < stepCount(value) ? step : -1;
}

export function shownValue(value, since) {
  const steps = stepCount(value);
  return steps ? Math.round((value * stepsLanded(value, since)) / steps) : 0;
}

// the tick after its row starts that a count's last step lands on
export function countDoneAt(value) {
  return SUMMARY.countFrom + Math.max(0, stepCount(value) - 1) * SUMMARY.stepTicks;
}

// what the road's loot came to in the purse
export function purseTake(taken) {
  return SUMMARY_KINDS.reduce((sum, kind) => sum + taken[kind] * LOOT_VALUES[kind].coins, 0);
}

// each row's value, the take last
export function summaryValues(taken) {
  return [...SUMMARY_KINDS.map((kind) => taken[kind]), purseTake(taken)];
}
