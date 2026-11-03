import {
  actorDrawables,
  createActorArt,
  drawActorOverlays,
  drawPointers,
  drawShadows,
} from './actors/index.js';
import {
  drawEffects,
  drawFlash,
  drawOverPlayers,
  drawUnderPlayers,
  scoringTeamOf,
} from './effects/index.js';
import { drawHud, drawOverHeads } from './hud/index.js';
import { bannerTopFor } from './hud/banner-slot.js';
import { comboAlphas } from './hud/combo-fade.js';
import { minimapAlpha } from './hud/minimap-fade.js';
import { inWorldSpace } from './spaces.js';
import { drawVenue, drawVenueFront, venueDrawables } from './venues/index.js';

let fallbackArt = null;

// a frame drawn with no art of its own gets the block figure, painted on the page's canvases
function defaultArt() {
  fallbackArt ??= createActorArt();

  return fallbackArt;
}

const venueOptionsOf = ({ venue, tick, createCanvas }) =>
  createCanvas ? { venue, tick, createCanvas } : { venue, tick };

// what stands on the pitch is drawn back to front, so the nearer covers the further
export function sceneOf(match, camera, { art = defaultArt(), scoringTeam = null, venue } = {}) {
  return [
    ...venueDrawables(camera, match, venue),
    ...actorDrawables(match, camera, { art, scoringTeam }),
  ].sort((first, second) => first.depth - second.depth);
}

function drawWorld(context, match, camera, { art, venue, effects, tick }) {
  const scoringTeam = scoringTeamOf(match, effects);

  drawVenue(context, camera, match, venue);
  drawShadows(context, match, camera);
  drawUnderPlayers(context, effects, { camera, match, art, scoringTeam });

  for (const drawable of sceneOf(match, camera, { art, scoringTeam, venue })) {
    drawable.draw(context);
  }

  drawVenueFront(context, camera, match, venue);
  drawEffects(context, effects, { camera, match });
  drawOverPlayers(context, effects, { camera, match, art });
  drawActorOverlays(context, match, camera, { art, tick });
}

// `actors` is createActorArt's (src/render/actors/index.js), with the loaded sprites in it;
// `effects` is createEffects', fed once a tick by updateEffects; `minimap` draws the minimap in
// the corner the HUD keeps for it; `tv` is true when television's cards are drawn over the frame
// (the HUD then leaves them its moments); `createCanvas` is the venue's, else the actors'. The
// world is drawn at the canvas's pixels; the names, pointers, flash and HUD in the context's own
// (UI) space.
export function drawFrame(context, match, camera, options = {}) {
  const { tick = match.tick, lang = 'en', effects = null } = options;
  const art = options.actors ?? defaultArt();
  // the app bakes the venue ahead (prepareVenue) on the canvases it makes the actors' on; drawn on
  // any other, the first frame of play would bake the whole venue again
  const createCanvas = options.createCanvas ?? art.createCanvas;
  const venue = venueOptionsOf({ ...options, tick, createCanvas });

  inWorldSpace(context, () => drawWorld(context, match, camera, { art, venue, effects, tick }));
  context.imageSmoothingEnabled = false;
  drawPointers(context, match, camera, { art, tick, lang });
  drawOverHeads(context, effects, { match, camera, lang, standHeight: art.standHeight });
  drawFlash(context, effects, match.tick);
  drawHud(context, match, {
    lang,
    tick,
    effects,
    minimap: options.minimap,
    minimapAlpha: options.minimap ? minimapAlpha(camera, match) : 1,
    comboAlpha: comboAlphas(camera, match),
    bannerTop: bannerTopFor(camera, match),
    tv: options.tv,
  });
}
