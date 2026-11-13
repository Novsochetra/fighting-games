import { DUEL_INK, DUEL_UI } from '../../art/duel/palette.js';
import { LOOK_ART } from '../../art/duel/looks.js';
import { clippedPen } from './clip.js';
import { castOf } from './cutin-cast.js';
import { drawCutinName } from './cutin-names.js';
import { drawCutinStamp } from './cutin-stamp.js';
import { easeOut, hash, phaseOf } from './hash.js';
import { ART, CUTIN_BAND as BAND, INNER } from './layout.js';
import { cutinView } from './lens/cutin-view.js';
import { lensPen } from './lens/lens-pen.js';
import { lookOf } from './looks/index.js';
import { reliefArt } from './looks/relief.js';
import { tagOf } from './menu-rows.js';
import { drawPortraitAt, portraitOf } from './portrait-card.js';
import { polygon } from './shapes.js';
import { shownRound } from './show.js';
import { drawStrike, strikeFrameAt, strikesIn } from './strike.js';

// diagonal light runs along the band the way the move is going
function bandFill(pen, { art, offset, facing, tick }) {
  const [deep, dark, mid, light] = art.body;
  const { top, height } = BAND;

  pen.rect([offset, top, ART.width, height], dark);

  for (let i = 0; i < 9; i += 1) {
    const x = offset + ((tick * 5 * facing + i * 34 + hash(i, 61) * 20) % 300) - 22;

    polygon(
      pen,
      [
        [x, top],
        [x + 10, top],
        [x - 12, top + height],
        [x - 22, top + height],
      ],
      mid,
    );
  }

  pen.rect([offset, top, ART.width, 3], light);
  pen.rect([offset, top + height - 3, ART.width, 3], deep);
  pen.rect([offset, top - 2, ART.width, 2], art.accent[2]);
  pen.rect([offset, top + height, ART.width, 2], art.accent[1]);
  pen.rect([offset, top - 3, ART.width, 1], DUEL_INK);
  pen.rect([offset, top + height + 2, ART.width, 1], DUEL_INK);
}

// the striker in the band, and a duo's partner sliding in behind him a beat later
function portraits(pen, { show, cast, side, offset, ticks }) {
  const home = side === 'attack' ? 14 : ART.width - 78;
  const facing = side === 'attack' ? 1 : -1;
  const look = (player) =>
    portraitOf(player, { mood: 'shout', heroAge: show.heroAge, match: show.match });

  if (cast.partner) {
    const slide = Math.round(-facing * 90 * (1 - easeOut(phaseOf(ticks, 4, 10))));

    drawPortraitAt(pen, {
      x: home + facing * 44 + slide + offset * 1.3,
      y: BAND.top + 2,
      look: look(cast.partner),
      flip: side === 'defend',
    });
  }

  drawPortraitAt(pen, {
    x: home + offset * 1.3,
    y: BAND.top + 6,
    look: look(cast.striker),
    flip: side === 'defend',
  });
}

// a striker drawn whole bursts out over the band's edges, as the old anime cut-ins did
function strike(pen, { show, cast, offset, ticks }) {
  drawStrike(pen, {
    feet: { x: 52 + Math.round(offset * 1.3), y: BAND.top + BAND.height + 8 },
    look: portraitOf(cast.striker, { mood: 'shout', heroAge: show.heroAge, match: show.match }),
    index: strikeFrameAt(ticks),
  });
}

function nameRoom(side, cast) {
  const portraitsWidth = cast.partner ? 128 : 92;

  return side === 'attack'
    ? { left: portraitsWidth, room: ART.width - portraitsWidth - 8 }
    : { left: 8, room: ART.width - portraitsWidth - 8 };
}

// the move's owner thrown across the screen in a band of its colour, the look's own figure in it
function drawFilm(film, { show, option, cast, side, art, offset, tick }) {
  const facing = side === 'attack' ? 1 : -1;
  const ticks = show.stageTicks;
  const band = clippedPen(film, { x: 0, y: BAND.top, width: ART.width, height: BAND.height });

  film.rect([0, INNER.top, ART.width, INNER.bottom - INNER.top], art.sky[0]);
  bandFill(film, { art, offset, facing, tick });
  lookOf(option.look).band?.(band, {
    art,
    relief: reliefArt(art),
    offset,
    facing,
    tick,
    side,
    ticks,
    ...BAND,
  });

  if (strikesIn(cast, option)) {
    strike(film, { show, cast, offset, ticks });
  } else {
    portraits(band, { show, cast, side, offset, ticks });
  }
}

// the band as the camera sees it; the move's name and a combo's stamp hold still over it, as a
// film's titles do, so they read however close the camera goes
export function drawCutin(pen, show, { lang, tick }) {
  const side = show.cutins[show.cutin];
  const round = shownRound(show);
  const option = round.picked[side];
  const tag = tagOf(option);
  const art = LOOK_ART[option.look] ?? LOOK_ART.plain;
  const ticks = show.stageTicks;
  const facing = side === 'attack' ? 1 : -1;
  const offset = Math.round(-facing * ART.width * (1 - easeOut(phaseOf(ticks, 0, 9))));
  const cast = castOf(show, round, side, { option, tag });
  const film = lensPen(pen, cutinView(show, { side, strikes: strikesIn(cast, option) }));

  drawFilm(film, { show, option, cast, side, art, offset, tick });

  if (ticks >= 10) {
    drawCutinName(pen, { option, tag, lang, ...nameRoom(side, cast), art, band: BAND });
  }

  if (ticks < 13 && ticks >= 9) {
    pen.rect([0, BAND.top, ART.width, BAND.height], DUEL_UI.white);
  }

  drawCutinStamp(pen, { tag, option, match: show.match, side, ticks, tick, lang });
}
