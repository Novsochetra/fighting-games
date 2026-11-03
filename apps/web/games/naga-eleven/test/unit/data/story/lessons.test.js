import { describe, expect, it } from 'vitest';
import { DUO_COMBOS, SYSTEMS_FROM } from '../../../../src/data/combos.js';
import { CHAPTERS } from '../../../../src/data/story/index.js';

// README "The story brings them in": the coach teaches each system where it starts to play
const STAGES = CHAPTERS.flatMap((chapter) => chapter.stages.map((stage) => ({ chapter, stage })));

const matchOf = (id) => STAGES.find(({ stage }) => stage.id === id);

const sceneOf = (id) => CHAPTERS.find((chapter) => chapter.scenes[id]).scenes[id];

const englishOf = (id) => sceneOf(id).lines.map((line) => line.text.en);

const triggerOf = (matchId, when) =>
  matchOf(matchId).stage.triggers.find((trigger) => trigger.when === when);

const duoFrom = (move) => DUO_COMBOS.find((duo) => duo.move === move).from;

// the stage just before a match, where a training scene says what the match will play
const stageBefore = (matchId) => STAGES[STAGES.indexOf(matchOf(matchId)) - 1].stage;

describe('the lessons in the story', () => {
  it('teach pass combos at the kickoff of the match they start in, and cheer the first x3', () => {
    const { stage } = matchOf(SYSTEMS_FROM.passCombo);
    const kickoff = triggerOf(stage.id, 'kickoff').scene;

    expect(englishOf(kickoff)).toContain('Quick passes build a COMBO. Watch the count: x2, x3!');
    expect(englishOf(kickoff)).toContain('Every good pass, tackle and save fills your spirit.');
    expect(triggerOf(stage.id, 'combo')).toMatchObject({ level: 3, scene: 'ch1-friendly-combo' });
    expect(englishOf('ch1-friendly-combo').join(' ')).toMatch(/Mekong Current/);
  });

  it('give every Chrey child a skill before the match skills start in, and cheer the first', () => {
    const { stage } = matchOf(SYSTEMS_FROM.roleSkills);
    const before = englishOf(stage.before).join(' ');

    for (const skill of ['Apsara Curl', 'Kite Cross', 'Elephant Guard', 'Belly Block']) {
      expect(before).toContain(skill);
    }

    expect(triggerOf(stage.id, 'skill')).toMatchObject({ first: true, scene: 'ch1-semi-skill' });
  });

  it('teach a chain in training, before the match chains start in', () => {
    const lesson = STAGES.findIndex(({ stage }) => stage.after === 'ch2-temple-after');
    const chains = STAGES.indexOf(matchOf(SYSTEMS_FROM.chains));

    expect(STAGES[lesson].stage.kind).toBe('training');
    expect(lesson).toBeLessThan(chains);
    expect(englishOf('ch2-temple-after')).toContain(
      'Hanuman Leap into Naga Shot... the Flying Naga!',
    );
  });

  it('teach each of Sochetra’s duos where it wakes, and cheer its goal', () => {
    const kite = matchOf(duoFrom('kite-header')).stage;
    const lightning = matchOf(duoFrom('chrey-lightning')).stage;

    expect(englishOf(kite.before).join(' ')).toMatch(/the Kite Header/);
    expect(triggerOf(kite.id, 'specialGoal')).toMatchObject({ move: 'kite-header' });
    expect(englishOf(stageBefore(lightning.id).scene)).toContain('Chrey Lightning!');
    expect(triggerOf(lightning.id, 'specialGoal')).toMatchObject({ move: 'chrey-lightning' });
    expect(sceneOf('ch4-nigeria-lightning').backdrop).toBe('village-tv');
  });

  it('say what a duo needs before Twin Naga wakes, and how to strike it when it does', () => {
    expect(englishOf('ch3-pass-before')).toContain(
      'A duo needs two gauges and two hearts. Rithy, stay near him.',
    );
    expect(englishOf('ch3-final-twin').join(' ')).toMatch(/DUO: with Rithy near you/);
  });
});
