import { DUEL_UI, WORD_RAMPS } from '../../art/duel/palette.js';
import { easeOut, overshoot, phaseOf } from './hash.js';
import { ART, PORTRAITS } from './layout.js';
import { drawPixelWord } from './pixel-word.js';
import { drawPortraitCard, portraitOf } from './portrait-card.js';
import { ring } from './shapes.js';
import { playerIn, shownRound } from './show.js';
import { drawSplashGround } from './splash-ground.js';

const SLIDE_TICKS = 16;
const VS_LANDS = 18;
const VS_Y = 36;

function card(pen, { show, side, lang, ticks }) {
  const round = shownRound(show);
  const player = playerIn(show, round, side);
  const home = PORTRAITS[side];
  const from = side === 'attack' ? -80 : ART.width + 16;
  const share = overshoot(phaseOf(ticks, side === 'attack' ? 0 : 4, SLIDE_TICKS));
  const x = from + (home.x - from) * share;
  const look = portraitOf(player, { mood: 'determined', heroAge: show.heroAge, match: show.match });

  drawPortraitCard(pen, { player, side, x, y: home.y, look, lang });
}

// VS drops in big and lands with a ring of light
function versusWord(pen, ticks) {
  if (ticks < 8) {
    return;
  }

  const size = Math.max(4, 12 - Math.floor((ticks - 8) * 0.8));

  drawPixelWord(pen, {
    text: 'VS',
    x: ART.width / 2,
    y: VS_Y - size * 3.5,
    size,
    ramp: WORD_RAMPS.gold,
  });

  if (ticks >= VS_LANDS && ticks < VS_LANDS + 14) {
    const grow = easeOut(phaseOf(ticks, VS_LANDS, 14));

    ring(pen, {
      x: ART.width / 2,
      y: VS_Y,
      radius: 14 + grow * 40,
      width: 2,
      color: DUEL_UI.white,
    });
  }
}

export function drawVersus(pen, show, { lang, tick }) {
  const ticks = show.stage === 'versus' ? show.stageTicks : 99;

  drawSplashGround(pen, tick);
  card(pen, { show, side: 'attack', lang, ticks });
  card(pen, { show, side: 'defend', lang, ticks });
  versusWord(pen, ticks);
}
