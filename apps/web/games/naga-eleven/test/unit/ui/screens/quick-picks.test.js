import { describe, expect, it } from 'vitest';
import {
  firstPicks,
  opponentsOf,
  PLAIN_TEAMS,
  quickOptions,
  stepPick,
} from '../../../../src/ui/screens/quick-picks.js';
import { CHREY, HIGH_SCHOOL, NEIGHBOR, ROYAL } from '../../../support/screen-fixtures.js';

const ids = (teams) => teams.map((team) => team.id);
const SEVENS = [CHREY, ROYAL, NEIGHBOR];

describe('the quick match’s teams', () => {
  it('offers the plain two before the story has met anyone', () => {
    expect(quickOptions([])).toEqual(PLAIN_TEAMS);
    expect(quickOptions()).toEqual(PLAIN_TEAMS);
  });

  it('offers a team only with a side of its own format to play', () => {
    expect(ids(quickOptions([...SEVENS, HIGH_SCHOOL]))).toEqual(ids(SEVENS));
  });

  it('adds the plain two when no team has an opponent yet', () => {
    expect(ids(quickOptions([CHREY, HIGH_SCHOOL]))).toEqual(ids(PLAIN_TEAMS));
  });

  it('pairs a team with the others of its format only', () => {
    expect(ids(opponentsOf(SEVENS, 'chrey-school'))).toEqual(['royal-kids', 'neighbor-village']);
    expect(opponentsOf(SEVENS, 'nobody')).toEqual([]);
  });

  it('starts on the first team against the first that can meet it', () => {
    expect(firstPicks(SEVENS)).toEqual({ home: 'chrey-school', away: 'royal-kids' });
    expect(firstPicks(PLAIN_TEAMS)).toEqual({ home: 'plain-red', away: 'plain-blue' });
  });

  it('steps the opponent round the teams that can meet the home side', () => {
    const picks = { home: 'chrey-school', away: 'neighbor-village' };

    expect(stepPick(SEVENS, picks, { side: 'away', by: 1 }).away).toBe('royal-kids');
    expect(stepPick(SEVENS, picks, { side: 'away', by: -1 }).away).toBe('royal-kids');
  });

  it('keeps the opponent when the new home side can still meet it', () => {
    const picks = { home: 'chrey-school', away: 'neighbor-village' };

    expect(stepPick(SEVENS, picks, { side: 'home', by: 1 })).toEqual({
      home: 'royal-kids',
      away: 'neighbor-village',
    });
  });

  it('takes another opponent when the new home side is the old opponent', () => {
    const picks = { home: 'chrey-school', away: 'royal-kids' };

    expect(stepPick(SEVENS, picks, { side: 'home', by: 1 })).toEqual({
      home: 'royal-kids',
      away: 'chrey-school',
    });
  });
});
