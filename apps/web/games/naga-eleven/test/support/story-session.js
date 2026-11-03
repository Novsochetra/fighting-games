import { newSave, stageOf, teamSpecFor } from '../../src/campaign/index.js';
import { VIEW } from '../../src/config.js';
import { CHAPTERS } from '../../src/data/story/index.js';
import { TEAMS } from '../../src/data/teams/index.js';
import { createInput } from '../../src/sim/input-state.js';
import { createMatchSession, stepMatchSession } from '../../src/ui/flow/match-session.js';
import { createPlayedMatch } from '../../src/ui/flow/match-setup.js';
import { createTv } from '../../src/ui/flow/match-tv.js';
import { createPixelCanvas } from './pixel-canvas.js';

// the chapter 1 final against Royal Kids and Rithy, as the story sets it up, television and all;
// `triggers` stands in for the stage's own
export function finalSession({ triggers, seed = 9 } = {}) {
  const save = {
    ...newSave({ seed: 4 }),
    stage: CHAPTERS[0].stages.findIndex((stage) => stage.id === 'ch1-final'),
  };
  const stage = stageOf(save, CHAPTERS, TEAMS);
  const teams = [teamSpecFor(save, stage.at.team, TEAMS), teamSpecFor(save, stage.opponent, TEAMS)];
  const match = createPlayedMatch({ seed, format: stage.at.format, teams, length: 'short' });
  const session = createMatchSession({
    match,
    venue: stage.venue,
    triggers: triggers ?? stage.triggers,
    sceneOf: (id) => CHAPTERS[0].scenes[id] ?? null,
    heroAge: stage.at.heroAge,
    lang: 'en',
    knockout: stage.rule === 'knockout',
  });

  session.specs = teams;
  session.tv = createTv(session, { cup: stage.at.cup?.name, round: stage.round, rival: 'rithy' });

  return session;
}

export function stepSession(session, { ticks = 1, input = createInput() } = {}) {
  for (let i = 0; i < ticks; i += 1) {
    stepMatchSession(session, input);
  }
}

// presses of pass send television's opening card off and end it, as a player skips it
export function skipIntro(session) {
  const input = createInput();

  while (session.tv?.intro) {
    input.sources.keys.held.pass = !input.sources.keys.held.pass;
    stepMatchSession(session, input);
  }
}

// a UI-sized pixel canvas that also keeps each fill and text drawn on it, with the colour, the
// alpha and the font it was drawn in
export function spiedCanvas() {
  const canvas = createPixelCanvas(VIEW.width, VIEW.height);
  const inner = canvas.getContext('2d');
  const calls = [];
  const context = new Proxy(inner, {
    get(target, name) {
      const value = target[name];

      if (typeof value !== 'function') {
        return value;
      }

      return (...args) => {
        calls.push({
          name,
          args,
          fillStyle: target.fillStyle,
          alpha: target.globalAlpha,
          font: target.font,
        });

        return value(...args);
      };
    },
    set(target, name, value) {
      target[name] = value;

      return true;
    },
  });

  return { canvas, context, calls };
}

export const textsOf = (calls) =>
  calls.filter((call) => call.name === 'fillText').map((call) => call.args[0]);

export const fillsIn = (calls, colour) =>
  calls.filter((call) => call.name === 'fillRect' && call.fillStyle === colour && call.alpha > 0);
