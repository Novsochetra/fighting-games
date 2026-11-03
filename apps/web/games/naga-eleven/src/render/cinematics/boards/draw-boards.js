import { easeOut, shareOf } from '../shared/ease.js';
import { kitsOf, teamCard } from '../shared/kits.js';
import { LABELS } from '../shared/labels.js';
import { dimView } from '../shared/panel.js';
import { wordsOf } from '../shared/words.js';
import { drawBoardFrame, drawDivider, drawHeader } from './board-frame.js';
import { confettiColours, drawConfetti } from './confetti.js';
import { BOARD, BOARD_MOTION, STATS } from './layout.js';
import { drawWinRibbon } from './ribbon.js';
import { drawScoreRow } from './score-row.js';
import { drawScorers } from './scorers.js';
import { drawStatRows } from './stat-rows.js';
import { createMatchStats } from './stats.js';

const DIM = 0.55;
const SHOWN = 600;
const CONFETTI_DELAY = 10;

// how long the board has been up: the phase's own ticks while the match is in it
const ageOf = (match, phase, age) => age ?? (match.phase === phase ? match.phaseTicks : SHOWN);

// the side that won, on goals or else on penalties; null for a draw
export function winnerOf(match, penalties = null) {
  const [home, away] =
    match.score[0] === match.score[1] ? (penalties?.goals ?? [0, 0]) : match.score;

  return home === away ? null : Number(away > home);
}

// a win is cheered when it is the player's, or anyone's when the computer plays both sides
function cheeredSide(match, winner) {
  const human = match.humanTeam ?? null;

  return winner !== null && (human === null || human === winner) ? winner : null;
}

function setUp(context, { match, phase, age }) {
  const shown = ageOf(match, phase, age);
  const teams = [0, 1].map((side) => teamCard(match.teams?.[side], side));

  context.imageSmoothingEnabled = false;
  dimView(context, DIM * easeOut(shareOf(shown, 0, BOARD_MOTION.drop)));

  return { shown, teams, kits: kitsOf(teams) };
}

function drawBoard(context, { match, stats, lang, title, look, penalties }) {
  const { shown, teams, kits, header } = look;
  const y = BOARD.y - Math.round((1 - easeOut(shareOf(shown, 0, BOARD_MOTION.drop))) * 40);
  const counted = stats ?? createMatchStats();
  const minute = `${Math.floor(match.minute ?? 0)}'`;

  drawBoardFrame(context, { y });
  drawHeader(context, { y, words: wordsOf(title, lang), minute, ramp: header });
  drawScoreRow(context, { teams, kits, score: match.score, y, lang, penalties });
  drawScorers(context, { stats: counted, y, age: shown, lang });
  drawDivider(context, { y: y + (STATS.y - BOARD.y) - 10 });
  drawStatRows(context, { stats: counted, kits, y, age: shown, lang });

  return y;
}

// over the frame of the venue while the teams are off: the score, who scored and when, and the
// numbers of the half; `age` is how long it has been up, else the half-time phase's ticks
export function drawHalfTime(context, { match, stats, lang = 'en', age } = {}) {
  const look = setUp(context, { match, phase: 'halfTime', age });

  drawBoard(context, { match, stats, lang, title: LABELS.halfTime, look });
}

// as half time, at the end; a win rains confetti in the winners' colours, the header and the sash
// across the board's foot wear them; `penalties` is { goals: [home, away] } after a shootout
export function drawFullTime(context, options = {}) {
  const { match, stats, lang = 'en', tick = 0, age, penalties = null } = options;
  const look = setUp(context, { match, phase: 'over', age });
  const winner = cheeredSide(match, winnerOf(match, penalties));
  const kit = look.kits[winner];
  const fall = kit && {
    colours: confettiColours(kit),
    age: Math.max(0, look.shown - CONFETTI_DELAY),
  };

  if (fall) {
    drawConfetti(context, { ...fall, layer: 0 });
  }

  const title = LABELS.fullTime;
  const y = drawBoard(context, {
    match,
    stats,
    lang,
    title,
    look: { ...look, header: kit?.band },
    penalties,
  });

  if (fall) {
    const words = `${wordsOf(look.teams[winner].name, lang)} ${wordsOf(LABELS.win, lang)}`;

    drawWinRibbon(context, { y, kit, words, age: look.shown, tick });
    drawConfetti(context, { ...fall, layer: 1 });
  }
}
