import { CHARACTERS } from '../../data/characters.js';
import { drawFullTime, drawHalfTime, drawIntro } from '../../render/cinematics/index.js';
import { drawFrame } from '../../render/draw-frame.js';
import { drawDuelShow, drawPenaltyShow } from '../../render/duel/index.js';
import { drawMinimap } from '../../render/minimap.js';
import { drawSaveCam } from '../../render/save-cam/index.js';
import { drawReplayChrome, replayCamera, replayFrameMatch } from '../../render/replay/index.js';
import { drawSceneSession } from './scene-session.js';

function drawReplay(context, session, { tick, actors }) {
  const { replay, replayEffects } = session.tv;

  drawFrame(context, replayFrameMatch(replay), replayCamera(replay), {
    venue: session.venue,
    tick,
    lang: session.lang,
    actors,
    effects: replayEffects,
  });
  drawReplayChrome(context, replay, { tick, lang: session.lang });
}

// the boards and cards television lays over the live match
function drawTv(context, session, tick) {
  const { tv, match, lang } = session;

  if (tv?.intro) {
    drawIntro(context, tv.intro, { tick });
  } else if (tv && match.phase === 'halfTime') {
    drawHalfTime(context, { match, stats: tv.stats, lang });
  } else if (tv && match.phase === 'over') {
    drawFullTime(context, { match, stats: tv.stats, lang, tick });
  }
}

// a story scene holds the match where it opened: what the frame times by the match's ticks (a
// goal's flash, a banner, television's boards) waits under it, unseen, to play once the scene is
// over, and the minimap, with nothing to say while play stands, leaves the scene the foot of the view
const frameOptionsOf = (session) =>
  session.overlay
    ? { effects: { ...session.effects, held: true }, minimap: null }
    : { effects: session.effects, minimap: drawMinimap };

// a frame of a match session: the shootout alone once it starts, a replay alone while it rolls,
// else the match with television's cards, a duel's cut-in or a story scene over it; `still` is the
// match standing behind its line-up or result card, which says what television's cards would
export function drawMatchSession(context, session, { tick, actors, still = false }) {
  const { match, camera, venue, lang } = session;

  if (session.penaltyShow) {
    drawPenaltyShow(context, session.penaltyShow, { lang, tick });

    return;
  }

  if (session.tv?.replay) {
    drawReplay(context, session, { tick, actors });

    return;
  }

  drawFrame(context, match, camera, {
    venue,
    tick,
    lang,
    actors,
    ...frameOptionsOf(session),
    tv: Boolean(session.tv),
  });

  if (!still && !session.overlay) {
    drawTv(context, session, tick);
  }

  if (session.duelShow) {
    drawDuelShow(context, session.duelShow, { lang, tick, actors });
  }

  if (session.saveCamShow) {
    drawSaveCam(context, session.saveCamShow, { lang, tick, actors });
  }

  if (session.overlay) {
    drawSceneSession(context, session.overlay, { tick, characters: CHARACTERS });
  }
}
