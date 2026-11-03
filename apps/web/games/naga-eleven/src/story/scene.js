import { textOf } from '../render/text.js';
import { isNarration, portraitFor } from './portrait.js';
import { forgetSkip, freshSkip, holdSkip, tapEndsScene } from './skip.js';
import { createStage, placeOnStage } from './stage.js';
import { createTyping, finishTyping, isTyped, shownText, typeTick } from './typewriter.js';
import { villagerFaces } from './villagers.js';

export { SKIP_ASK_TICKS, SKIP_TICKS, isSkipAsked, skipProgress } from './skip.js';

function viewOf(line, { lang, heroAge, faces }) {
  const narration = isNarration(line);

  return {
    speaker: narration ? 'narrator' : line.speaker,
    mood: line.mood ?? 'neutral',
    side: narration ? null : (line.side ?? 'left'),
    text: textOf(line.text, lang),
    name: line.name ?? null,
    portrait: portraitFor(line, heroAge, faces),
  };
}

function enterLine(state, index) {
  const line = state.lines[index];

  if (!line) {
    state.done = true;

    return;
  }

  state.index = index;
  state.lineTick = 0;
  state.view = viewOf(line, state);
  state.typing = createTyping(state.view.text);
  placeOnStage(state.stage, state.view, state.tick);
}

// a button already down when the scene comes up (the shot being charged as an overlay opens) is
// let go of before it can rush a line or skip the scene
export function createScene(scene, { lang = 'en', heroAge = 'child' } = {}) {
  const state = {
    scene,
    lang,
    heroAge,
    lines: scene?.lines ?? [],
    faces: villagerFaces(scene?.lines ?? []),
    index: 0,
    tick: 0,
    lineTick: 0,
    view: null,
    typing: null,
    stage: createStage(),
    confirmDown: true,
    ...freshSkip(),
    done: false,
  };

  enterLine(state, 0);

  return state;
}

export const isSceneDone = (state) => state.done;

export function endScene(state) {
  state.done = true;

  return state;
}

function advance(state) {
  if (isTyped(state.typing)) {
    enterLine(state, state.index + 1);
  } else {
    finishTyping(state.typing);
  }
}

export function askSkip(state) {
  return tapEndsScene(state) ? endScene(state) : state;
}

export function updateScene(state, { confirm = false, skip = false } = {}) {
  if (state.done) {
    return state;
  }

  const pressed = confirm && !state.confirmDown;

  state.tick += 1;
  state.lineTick += 1;
  state.confirmDown = confirm;

  if (holdSkip(state, skip)) {
    return endScene(state);
  }

  if (pressed) {
    forgetSkip(state);
    advance(state);
  } else {
    typeTick(state.typing);
  }

  return state;
}

export function currentLine(state) {
  if (state.done) {
    return null;
  }

  return {
    ...state.view,
    shown: shownText(state.typing),
    typed: isTyped(state.typing),
    index: state.index,
    count: state.lines.length,
  };
}
