import { storeSave } from '../../campaign/index.js';
import { CHAPTERS } from '../../data/story/index.js';
import { TEAMS } from '../../data/teams/index.js';
import { createSceneSession } from '../flow/scene-session.js';
import { completeStep, createStoryRun, currentStep, sceneOf } from '../flow/story-run.js';
import { createTrainingSession } from '../flow/training-session.js';
import {
  chapterCardScreen,
  closingCardScreen,
  matchScreen,
  sceneScreen,
  stillScreen,
  trainingScreen,
} from './canvas-screens.js';
import { postmatchData, prematchData } from './match-cards.js';
import { storyMatchSession } from './match-maker.js';

export const WORLD = { chapters: CHAPTERS, teams: TEAMS };

function advance(app, payload) {
  app.run = completeStep(app.run, WORLD, payload);
  storeSave(app.storage, app.run.save);
  showStep(app);
}

function showScene(app, step) {
  const scene = sceneOf(app.run, WORLD, step.scene);

  if (!scene) {
    advance(app);

    return;
  }

  const { lang } = app.settings;

  app.screens.hide();
  app.play(
    sceneScreen(createSceneSession(scene, { lang, heroAge: app.run.stage.at.heroAge }), {
      mood: scene.mood,
    }),
  );
}

function showTraining(app, step) {
  const { save, stage } = app.run;
  const seed = (save.seed + stage.at.chapter * 100 + stage.at.stage) >>> 0;
  const level = stage.at.chapterNumber;

  app.screens.hide();
  app.play(
    trainingScreen(createTrainingSession(step.drill, { seed, level, lang: app.settings.lang })),
  );
}

function showPrematch(app) {
  app.match = storyMatchSession(app, WORLD);
  app.play(stillScreen(app.match));
  app.screens.show('prematch', prematchData(app.run.stage, app.match));
}

function showMatch(app) {
  app.saveBeforeMatch = app.run.save;
  app.screens.hide();
  app.play(matchScreen(app.match));
}

function showPostmatch(app, step) {
  const data = postmatchData({
    session: app.match,
    result: step.result,
    stage: app.run.stage,
    before: app.saveBeforeMatch,
    after: app.run.save,
  });

  app.play(stillScreen(app.match));
  app.screens.show('postmatch', data);
  cheerResult(app, data);
}

// the result card's music, and a fanfare for a level gained or a move woken
const isWin = ({ score, penalties }) =>
  score[0] > score[1] || Boolean(penalties && penalties.for > penalties.against);

export function cheerResult(app, data) {
  const { xp, woken } = data;

  app.music?.(isWin(data) ? 'victory' : 'defeat');

  if (xp && xp.after.level > xp.before.level) {
    app.sound?.('levelUp');
  }

  if (woken?.length) {
    app.sound?.('moveUnlocked');
  }
}

const SHOW = {
  scene: showScene,
  training: showTraining,
  prematch: showPrematch,
  match: showMatch,
  postmatch: showPostmatch,
};

// each chapter opens on its card, once a visit, before its first screen
function showCard(app) {
  const chapter = WORLD.chapters[app.run.stage.at.chapter];

  app.shownChapter = chapter.id;
  app.cardDone = () => showStep(app);
  app.screens.hide();
  app.play(
    chapterCardScreen({ number: chapter.number, title: chapter.title, lang: app.settings.lang }),
  );
}

export function showClosing(app, then) {
  app.cardDone = then;
  app.screens.hide();
  app.play(closingCardScreen({ lang: app.settings.lang }));
}

export function showStep(app) {
  const step = currentStep(app.run);

  if (app.run.finished || !step) {
    app.finishStory();

    return;
  }

  if (app.shownChapter !== app.run.stage.at.chapterId) {
    showCard(app);

    return;
  }

  SHOW[step.kind](app, step);
}

export function beginStory(app, save) {
  app.mode = 'story';
  app.shownChapter = null;
  app.run = createStoryRun(save, WORLD);
  showStep(app);
}

// a canvas screen of the story is over (a scene, a drill, a match): what it gave settles it
export const storyCanvasDone = (app, result) => advance(app, result);

// the line-up card's Kick off and the result card's Continue each finish their own step
export const storyCardDone = (app) => advance(app);
