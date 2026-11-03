import { matchSeedFor, matchSidesFor } from '../../campaign/index.js';
import { TEAMS } from '../../data/teams/index.js';
import { prepareMatchArt } from '../../render/actors/index.js';
import { prepareVenue } from '../../render/venues/index.js';
import { createMatch } from '../../sim/create-match.js';
import { attachDuels } from '../../sim/duel/index.js';
import { createMatchSession } from '../flow/match-session.js';
import { createPlayedMatch } from '../flow/match-setup.js';
import { createTv } from '../flow/match-tv.js';
import { sceneOf } from '../flow/story-run.js';
import { rivalOf } from './match-cards.js';

const QUICK_VENUE = 'national-stadium';

const newSeed = () => Math.floor(Math.random() * 2 ** 32);

// the sheets for both kits and the venue's ground are drawn now, while a card is up, so the
// first frame of play doesn't stall
function readyArt(app, session) {
  prepareMatchArt(app.actors, session.match);
  prepareVenue(session.camera, session.match, {
    venue: session.venue,
    createCanvas: app.createCanvas,
  });

  return session;
}

export function storyMatchSession(app, world) {
  const { save, stage } = app.run;
  const specs = matchSidesFor(save, stage, TEAMS);
  const match = createPlayedMatch({
    seed: matchSeedFor(save, stage),
    format: stage.at.format,
    teams: specs,
    length: app.settings.matchLength,
    input: app.input,
  });
  const session = createMatchSession({
    match,
    venue: stage.venue,
    triggers: stage.triggers,
    sceneOf: (id) => (id ? sceneOf(app.run, world, id) : null),
    heroAge: stage.at.heroAge,
    lang: app.settings.lang,
    knockout: stage.rule === 'knockout',
  });

  Object.assign(session, { specs });
  session.tv = createTv(session, {
    cup: stage.at.cup?.name ?? null,
    round: stage.round ?? null,
    rival: rivalOf(specs[1], stage.at.heroAge),
  });

  return readyArt(app, session);
}

// two teams the player has met, of one format; else two plain sides
function quickMatch(app, specs) {
  const playable = specs.every((spec) => spec?.players) && specs[0].format === specs[1].format;

  if (playable) {
    return createPlayedMatch({
      seed: newSeed(),
      format: specs[0].format,
      teams: specs,
      length: app.settings.matchLength,
      input: app.input,
    });
  }

  const match = createMatch({ seed: newSeed(), humanTeam: 0, input: app.input });

  attachDuels(match);

  return match;
}

export function quickMatchSession(app, specs) {
  const match = quickMatch(app, specs);
  const session = createMatchSession({ match, venue: QUICK_VENUE, lang: app.settings.lang });

  session.specs = match.teams.map((team, i) => (specs[i]?.players ? specs[i] : team));
  session.tv = createTv(session, { rival: rivalOf(session.specs[1], 'adult') });

  return readyArt(app, session);
}
