import { describe, expect, it } from 'vitest';
import { newSave } from '../../../src/campaign/index.js';
import { CHAPTER_MIN_LEVEL } from '../../../src/data/progression.js';
import {
  buildChapter,
  makeTeam,
  matchResult,
  playCampaign,
  trainingResult,
} from '../../support/campaign-fixtures.js';

const rivals = ['a', 'b', 'c', 'd', 'e'];

const teamsOf = (number, format) => [
  makeTeam({ id: `hero-${number}`, format, hero: true }),
  ...rivals.map((name, index) =>
    makeTeam({ id: `${name}-${number}`, format, strength: 30 + number * 12 + index * 2 }),
  ),
];

const groupOf = (number, size) => ({
  name: { en: 'Group', km: 'Group' },
  kind: 'group',
  teams: [`hero-${number}`, ...rivals.slice(0, size - 1).map((name) => `${name}-${number}`)],
  advance: 2,
});

const cupsOf = (number, size) => ({
  group: groupOf(number, size),
  knockout: { name: { en: 'Cup', km: 'Cup' }, kind: 'knockout' },
});

const opponent = (number, index) => `${rivals[index]}-${number}`;

// the README's chapters: matches, cup groups and about as many trainings as the story has
const STORY = [
  { number: 1, format: '7', heroAge: 'child', group: 0, trainings: 2 },
  { number: 2, format: '11', heroAge: 'teen', group: 3, trainings: 3 },
  { number: 3, format: '11', heroAge: 'young', group: 4, trainings: 2 },
  { number: 4, format: '11', heroAge: 'adult', group: 4, trainings: 2 },
];

const DRILLS = ['cone-dribble', 'target-shot', 'spirit-focus'];

function planOf({ number, group, trainings }) {
  const groupMatches = Array.from({ length: Math.max(0, group - 1) }, (_, index) => [
    'group',
    opponent(number, index),
    'group',
  ]);
  const opening = group === 0 ? [['friendly', opponent(number, 0)]] : groupMatches;
  const training = (index) => ['training', DRILLS[index % DRILLS.length]];
  const extra = Array.from({ length: trainings - 1 }, (_, index) => training(index + 1));

  return [
    ['scene'],
    training(0),
    ...opening,
    ...extra,
    ['knockout', opponent(number, 3), 'knockout'],
    ['knockout', opponent(number, 4), 'knockout'],
    ['scene'],
  ];
}

const CHAPTERS = STORY.map((chapter) =>
  buildChapter({
    ...chapter,
    team: `hero-${chapter.number}`,
    cups: cupsOf(chapter.number, chapter.group || 2),
    plan: planOf(chapter),
  }),
);

const TEAMS = STORY.flatMap(({ number, format }) => teamsOf(number, format));

const isOpener = (stage) => stage.rule === 'group' && stage.at.group.round === 0;

function typicalPlay(stage) {
  if (stage.kind === 'training') {
    return trainingResult(stage.drill, 'A', 1500);
  }

  if (stage.kind === 'match' && isOpener(stage) && stage.at.chapterNumber >= 3) {
    return matchResult(0, 2, { duelsWon: 1 });
  }

  return matchResult(2, 1, { goalsBySochetra: 1, duelsWon: 2 });
}

const lastFinal = (log) => log.findLast((entry) => entry.stage.kind === 'match');

const levelAsChapterStarts = (log, chapter) =>
  log.find((entry) => entry.stage.at.chapter === chapter).before.hero.level;

const playStory = (play) =>
  playCampaign({ save: newSave(), chapters: CHAPTERS, teams: TEAMS, play });

describe("a campaign of the story's shape", () => {
  it('takes Sochetra from level 1 to about level 40 by the last final when played once', () => {
    const { save, log } = playStory(typicalPlay);
    const starts = [0, 1, 2, 3].map((chapter) => levelAsChapterStarts(log, chapter));

    expect(save.chapter).toBe(CHAPTERS.length);
    expect(starts[0]).toBe(1);
    expect(lastFinal(log).before.hero.level).toBeGreaterThanOrEqual(38);
    expect(lastFinal(log).before.hero.level).toBeLessThanOrEqual(42);

    for (const [index, level] of starts.slice(1).entries()) {
      expect(level - starts[index]).toBeGreaterThanOrEqual(7);
      expect(level - starts[index]).toBeLessThanOrEqual(12);
    }
  });

  it('ends with his gift in shot, dribble and speed above every other stat', () => {
    const { stats } = playStory(typicalPlay).save.hero;
    const gift = Math.min(stats.shot, stats.dribble, stats.speed);

    expect(gift).toBeGreaterThan(Math.max(stats.pass, stats.tackle, stats.keeping, stats.stamina));
    expect(Math.max(...Object.values(stats))).toBeLessThanOrEqual(99);
  });

  it("lifts a player who skips every training and scrapes 1-0 wins to each chapter's floor", () => {
    const play = (stage) =>
      stage.kind === 'training' ? trainingResult(stage.drill, 'C', 0) : matchResult(1, 0);
    const { log } = playStory(play);

    for (const chapter of [0, 1, 2, 3]) {
      const floor = CHAPTER_MIN_LEVEL[chapter + 1];

      expect(levelAsChapterStarts(log, chapter)).toBeGreaterThanOrEqual(floor);
    }

    expect(levelAsChapterStarts(log, 3)).toBe(CHAPTER_MIN_LEVEL[4]);
  });
});
