import { describe, expect, it } from 'vitest';
import { checkTriggers, createWatch } from '../../../src/story/watch.js';
import { fakeMatch } from '../../support/story-fixtures.js';

// the events job A's sim pushes (README "Contract additions"), made by hand
const combo = (team, level, player = 4) => ({ type: 'combo', team, level, player });

const skill = (player, move = 'apsara-curl') => ({ type: 'skill', player, move });

const scenesFired = (triggers, match, events) =>
  checkTriggers(createWatch(triggers), match, events).map((fired) => fired.scene);

const play = { phase: 'play', minute: 6 };

describe('a combo trigger', () => {
  const trigger = [{ when: 'combo', level: 3, scene: 'mekong' }];

  it('fires when the player’s side climbs to the level asked for', () => {
    expect(scenesFired(trigger, fakeMatch(play), [combo(0, 3)])).toEqual(['mekong']);
    expect(scenesFired(trigger, fakeMatch(play), [combo(0, 2)])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch(play), [])).toEqual([]);
  });

  it('fires on a climb past the level, as a one-two climbs two at once', () => {
    expect(scenesFired(trigger, fakeMatch(play), [combo(0, 4)])).toEqual(['mekong']);
  });

  it('waits out a combo the other side builds, read from the side the human plays', () => {
    expect(scenesFired(trigger, fakeMatch(play), [combo(1, 5, 10)])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch({ ...play, humanTeam: 1 }), [combo(1, 3, 10)])).toEqual([
      'mekong',
    ]);
  });

  it('ignores the end of a combo', () => {
    const ended = { type: 'comboEnd', team: 0, level: 4, reason: 'lost' };

    expect(scenesFired(trigger, fakeMatch(play), [ended])).toEqual([]);
  });
});

describe('a skill trigger', () => {
  const first = [{ when: 'skill', first: true, scene: 'skills' }];

  it('fires on the player’s side’s first skill, never on the other side’s', () => {
    expect(scenesFired(first, fakeMatch(play), [skill(4)])).toEqual(['skills']);
    expect(scenesFired(first, fakeMatch(play), [skill(10, 'elephant-guard')])).toEqual([]);
    expect(scenesFired(first, fakeMatch({ ...play, humanTeam: 1 }), [skill(10)])).toEqual([
      'skills',
    ]);
  });

  it('fires once a match, on the tick the first skill is played', () => {
    const watch = createWatch(first);
    const match = fakeMatch(play);

    expect(checkTriggers(watch, match, [skill(10)])).toEqual([]);
    expect(checkTriggers(watch, match, [skill(4)])).toHaveLength(1);
    expect(checkTriggers(watch, match, [skill(5)])).toEqual([]);
  });

  it('with first, never fires for a skill after the side’s opening one', () => {
    const watch = createWatch([{ when: 'skill', first: true, by: 'dara', scene: 'belly' }]);
    const match = fakeMatch(play);

    expect(checkTriggers(watch, match, [skill(4)])).toEqual([]);
    expect(checkTriggers(watch, match, [skill(0, 'belly-block')])).toEqual([]);
  });

  it('without first, waits for the skill or the player it names', () => {
    const watch = createWatch([
      { when: 'skill', move: 'belly-block', scene: 'belly' },
      { when: 'skill', by: 'sochetra', scene: 'hero' },
    ]);
    const match = fakeMatch(play);
    const scenesOf = (events) => checkTriggers(watch, match, events).map((fired) => fired.scene);

    expect(scenesOf([skill(4)])).toEqual([]);
    expect(scenesOf([skill(4), skill(0, 'belly-block')])).toEqual(['belly']);
    expect(scenesOf([skill(6, 'hanuman-leap')])).toEqual(['hero']);
  });

  it('takes only the first of two skills played on one tick as the opening one', () => {
    const trigger = [{ when: 'skill', first: true, move: 'belly-block', scene: 'belly' }];

    expect(scenesFired(trigger, fakeMatch(play), [skill(4), skill(0, 'belly-block')])).toEqual([]);
    expect(scenesFired(trigger, fakeMatch(play), [skill(0, 'belly-block'), skill(4)])).toEqual([
      'belly',
    ]);
  });
});
