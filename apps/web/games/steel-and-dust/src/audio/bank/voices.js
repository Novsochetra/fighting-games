import { shoutBuilder } from './shout.js';
import { BOSS_KO_SHOUTS, BOSS_SHOUTS } from './shouts-boss.js';
import { DEATH_SHOUTS } from './shouts-death.js';
import { HERO_SHOUTS, HURT_SHOUTS } from './shouts-hurt.js';

export const VOICE_SOUNDS = {
  voiceHurt: {
    group: 'voice',
    level: 0.22,
    takes: 6,
    seconds: 0.27,
    priority: 1,
    build: shoutBuilder(HURT_SHOUTS, 1.5),
  },
  voiceDie: {
    group: 'voice',
    level: 0.35,
    takes: 5,
    seconds: 0.9,
    priority: 3,
    build: shoutBuilder(DEATH_SHOUTS, 1.5),
  },
  voiceHero: {
    group: 'voice',
    level: 0.36,
    takes: 3,
    seconds: 0.24,
    priority: 2,
    build: shoutBuilder(HERO_SHOUTS, 1.5),
  },
  voiceBoss: {
    group: 'voice',
    level: 0.5,
    takes: 2,
    seconds: 0.4,
    priority: 2,
    build: shoutBuilder(BOSS_SHOUTS, 2),
  },
  voiceBossKo: {
    group: 'voice',
    level: 0.55,
    takes: 1,
    seconds: 1.25,
    priority: 3,
    build: shoutBuilder(BOSS_KO_SHOUTS, 2),
  },
};
