import { metFlag, withFlags } from './flags.js';
import { growHero } from './growth.js';
import { judgeMatch } from './match-rules.js';
import { outcomeOf, unlockedOf } from './outcome.js';
import { goBackTo, moveOn, stayOn } from './position.js';
import { claimRewards } from './rewards.js';
import { matchXp, trainingXp } from './xp.js';

const present = (scenes) => scenes.filter((scene) => typeof scene === 'string' && scene);

function placeAfter(save, at, judged) {
  if (judged.passed) {
    return moveOn(save, at);
  }

  return Number.isInteger(judged.backTo) ? goBackTo(save, at, judged.backTo) : stayOn(save, at);
}

function settleMatch(save, stage, result) {
  const { at } = stage;
  const outcome = outcomeOf(result);
  const judged = judgeMatch({ save, stage, result, outcome });
  const reward = claimRewards(judged.save, stage, judged.passed);
  const hero = growHero(reward.save.hero, {
    xp: matchXp(result, outcome, at.chapterNumber) + reward.xp,
    moves: [...unlockedOf(result), ...reward.moves],
  });
  const met = withFlags({ ...reward.save, hero }, [metFlag(at.team), metFlag(stage.opponent)]);

  return {
    save: placeAfter(met, at, judged),
    scenes: present(judged.scenes),
    passed: judged.passed,
    outcome,
  };
}

function settleTraining(save, stage, result) {
  const reward = claimRewards(save, stage, true);
  const hero = growHero(reward.save.hero, {
    xp: trainingXp(result, stage.at.chapterNumber) + reward.xp,
    moves: [...unlockedOf(result), ...reward.moves],
    drill: result.drill ?? stage.drill,
    grade: result.grade,
  });

  return {
    save: moveOn({ ...reward.save, hero }, stage.at),
    scenes: present([stage.after]),
    passed: true,
    outcome: null,
  };
}

export function settleStage(save, stage, result = {}) {
  if (!stage?.at) {
    throw new Error('A stage is finished with the stage stageOf(save, chapters) gave');
  }

  if (stage.kind === 'match') {
    return settleMatch(save, stage, result);
  }

  if (stage.kind === 'training') {
    return settleTraining(save, stage, result);
  }

  return { save: moveOn(save, stage.at), scenes: [], passed: true, outcome: null };
}

export const finishScene = (save, stage) => settleStage(save, stage).save;

export const finishTraining = (save, stage, result) => settleStage(save, stage, result).save;

export const finishMatch = (save, stage, result) => settleStage(save, stage, result).save;

export const nextScenes = (save, stage, result) => settleStage(save, stage, result).scenes;

export function beforeScenes(save, stage) {
  if (stage.kind === 'scene') {
    return present([stage.scene]);
  }

  return save.attempts === 0 ? present([stage.before]) : [];
}
