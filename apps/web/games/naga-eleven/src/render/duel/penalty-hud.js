import { DUEL_INK, DUEL_UI, PENALTY_ART } from '../../art/duel/palette.js';
import { drawText } from '../text.js';
import { toCanvas } from './layout.js';
import { aimPoint, AIM_KEYS, KEEPER_SPOT } from './penalty-layout.js';
import { panel } from './plates.js';
import { disc, polygon } from './shapes.js';

const SHOWN_KICKS = 5;

// the kicks so far, side by side: gold for a goal, red for a miss, empty for one to come; past
// five each it shows the last five rounds
function marks(pen, { kicks, team }) {
  const own = kicks.filter((kick) => kick.team === team);
  const rounds = Math.max(SHOWN_KICKS, Math.ceil(kicks.length / 2));
  const first = rounds - SHOWN_KICKS;

  for (let i = 0; i < SHOWN_KICKS; i += 1) {
    const kick = own[first + i];
    const color =
      { scored: PENALTY_ART.scored, saved: PENALTY_ART.missed, missed: PENALTY_ART.missed }[
        kick?.result
      ] ?? PENALTY_ART.empty;
    const at = { x: SCOREBOARD.marks[team] + i * 9, y: SCOREBOARD.row };

    disc(pen, { ...at, radius: 3.5, color: DUEL_INK });
    disc(pen, { ...at, radius: 2.5, color });
  }
}

// one row, its foot clear of the crossbar, so the keeper's head and the bar stay in sight
const SCOREBOARD = {
  panel: { x: 67, y: 17, width: 122, height: 10 },
  row: 22,
  marks: [85, 135],
  names: [69, 179],
};

export function drawScoreboard(pen, { shootout, names }) {
  panel(pen, SCOREBOARD.panel);
  pen.rect([127, SCOREBOARD.row - 3, 2, 7], DUEL_UI.muted);
  [0, 1].forEach((team) => {
    drawText(pen.context, names[team], {
      x: pen.origin.x + toCanvas(SCOREBOARD.names[team]),
      y: pen.origin.y + toCanvas(SCOREBOARD.row) - 4,
      color: team === shootout.humanTeam ? DUEL_UI.gold : DUEL_UI.text,
      size: 8,
    });
    marks(pen, { kicks: shootout.kicks, team });
  });
}

function crosshair(pen, { x, y, lit, bob }) {
  const color = lit ? DUEL_UI.gold : DUEL_UI.muted;
  const reach = lit ? 7 + bob : 4;

  pen.rect([x - reach, y, reach - 2, 1], color);
  pen.rect([x + 3, y, reach - 2, 1], color);
  pen.rect([x, y - reach, 1, reach - 2], color);
  pen.rect([x, y + 3, 1, reach - 2], color);

  if (lit) {
    pen.rect([x - 1, y - 1, 3, 3], DUEL_UI.white);
  }
}

export function drawAimMarks(pen, { cursor, tick }) {
  AIM_KEYS.forEach((aim, i) =>
    crosshair(pen, { ...aimPoint(aim), lit: i === cursor, bob: Math.floor(tick / 6) % 2 }),
  );
}

export function drawDiveMarks(pen, { cursor, tick }) {
  const y = KEEPER_SPOT.y - 66 - (Math.floor(tick / 6) % 2);

  AIM_KEYS.forEach((aim, i) => {
    const x = KEEPER_SPOT.x + aim * 30;
    const color = i === cursor ? DUEL_UI.gold : DUEL_UI.muted;
    const points =
      aim === 0
        ? [
            [x - 4, y - 3],
            [x + 4, y - 3],
            [x, y + 3],
          ]
        : [
            [x + aim * 5, y],
            [x - aim * 3, y - 5],
            [x - aim * 3, y + 5],
          ];

    polygon(
      pen,
      points.map(([px, py]) => [px, py + 1]),
      DUEL_INK,
    );
    polygon(pen, points, color);
  });
}

// the power gauge: a sweet band in the middle, too hard at the top where kicks fly over
export function drawPowerGauge(pen, { power }) {
  const [back, sweet, strong, wild] = PENALTY_ART.gauge;
  const x = 232;
  const top = 44;
  const height = 60;

  pen.rect([x - 2, top - 2, 10, height + 4], DUEL_INK);
  pen.rect([x, top, 6, height], back);
  pen.rect([x, top, 6, height * 0.2], wild);
  pen.rect([x, top + height * 0.2, 6, height * 0.25], strong);
  pen.rect([x, top + height * 0.45, 6, height * 0.3], sweet);

  const markY = top + height * (1 - power);

  pen.rect([x - 4, markY - 1, 14, 3], DUEL_INK);
  pen.rect([x - 3, markY, 12, 1], DUEL_UI.white);
}
