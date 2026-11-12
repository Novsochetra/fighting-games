import { TUNING } from '../data/tuning.js';
import { stepFx, takeBanked } from '../fx/particles.js';
import { gulp, piggyPose, stepPiggy } from '../fx/piggy-mood.js';
import { paintPiggy } from '../render/paint-piggy.js';

const MENU_OF = { title: 'title', pause: 'pause', over: 'over' };
const HURRIED = 1.12;

function showScreen(stage) {
  const { game } = stage;

  if (game.screen === stage.screen) {
    return;
  }

  stage.screen = game.screen;
  stage.at.app.dataset.view = game.screen;
  stage.menus.showFor(MENU_OF[game.screen] ?? null);

  if (game.screen === 'title') {
    stage.showTitle(game, stage.text);
  }
}

function showRun(stage) {
  const { run } = stage.game;

  if (run) {
    stage.hud.update(run, stage.text);
    stage.audio.hurryMusic(run.timeLeft <= TUNING.lowTimeMs ? HURRIED : 1);
  }
}

function movePiggy(stage, seconds) {
  if (takeBanked(stage.fx) > 0) {
    gulp(stage.piggy);
  }

  stepPiggy(stage.piggy, seconds);

  const pose = piggyPose(stage.piggy);

  stage.piggies.forEach((context) => paintPiggy(context, pose));
}

export function drawFrame(stage, ms) {
  const seconds = ms / 1000;

  showScreen(stage);
  showRun(stage);

  if (stage.game.screen === 'over') {
    stage.results.roll(stage.text);
  }

  stage.seconds += seconds;
  stepFx(stage.fx, seconds);
  movePiggy(stage, seconds);
  stage.canvases.draw(stage.seconds, stage.fx);
}
