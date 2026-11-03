import { hero, member, starPlayer, team, withSpirit } from './squad.js';

const youth = ({ id, kit, en, km, short, players }) =>
  team({ id, name: { en, km }, short, kit, format: '11', players });

// youth internationals: stats around 60 to 75, each rival above Sochetra at nineteen. Cambodia's
// side stands at the foot of the band and Japan at its top; the group opener plays Japan above even
// that (its `opponentForm`), so Haruto's Japan usually beats a decent player there, and the final
// meets them as they are here (test/integration/data/story-balance.test.js)
export const CHAPTER_3_TEAMS = [
  youth({
    id: 'cambodia-youth',
    kit: 'cambodia',
    en: 'Cambodia Youth',
    km: 'កម្ពុជា យុវជន',
    short: 'CAM',
    players: [
      starPlayer('dara', 1, [58, 40, 52, 44, 50, 70, 62], ['angkor-wall']),
      member({ en: 'Kosal', km: 'កុសល' }, 2, [56, 38, 50, 46, 60, 12, 58]),
      member({ en: 'Visal', km: 'វិសាល' }, 4, [54, 40, 50, 44, 62, 12, 58]),
      member({ en: 'Sovannara', km: 'សុវណ្ណារ៉ា' }, 5, [54, 38, 52, 46, 61, 12, 56]),
      member({ en: 'Chanra', km: 'ចាន់រ៉ា' }, 3, [58, 40, 50, 48, 60, 12, 58]),
      member({ en: 'Pisey', km: 'ពិសី' }, 6, [56, 48, 60, 54, 52, 12, 58]),
      member({ en: 'Vichea', km: 'វិជ្ជា' }, 8, [56, 50, 60, 56, 50, 12, 60]),
      member({ en: 'Sokheng', km: 'សុខហេង' }, 16, [60, 50, 58, 58, 48, 12, 58]),
      member({ en: 'Tola', km: 'តុលា' }, 11, [60, 54, 50, 58, 40, 12, 56]),
      hero(),
      starPlayer('rithy', 7, [70, 72, 66, 70, 46, 12, 66], ['preah-khan-strike']),
    ],
  }),
  youth({
    id: 'japan-youth',
    kit: 'japan',
    en: 'Japan Youth',
    km: 'ជប៉ុន យុវជន',
    short: 'JPN',
    players: [
      member('Sato', 1, [60, 40, 58, 44, 52, 75, 75]),
      member('Kimura', 2, [75, 62, 75, 70, 75, 12, 75]),
      member('Takahashi', 4, [75, 62, 75, 68, 75, 12, 75]),
      member('Inoue', 5, [75, 60, 75, 70, 75, 12, 75]),
      member('Fujii', 3, [75, 64, 75, 72, 75, 12, 75]),
      member('Mori', 6, [75, 70, 75, 75, 75, 12, 75]),
      // his duel scene is written for him and Sochetra face to face (src/sim/hunts.js)
      {
        ...withSpirit(
          starPlayer('haruto', 10, [86, 92, 94, 90, 70, 12, 86], ['silent-moon', 'mirror-step']),
          170,
        ),
        hunts: 'sochetra',
      },
      member('Kato', 8, [75, 74, 75, 75, 72, 12, 75]),
      member('Ishida', 11, [75, 75, 74, 75, 62, 12, 75]),
      member('Nakano', 9, [75, 75, 72, 75, 60, 12, 75]),
      member('Ogawa', 7, [75, 75, 74, 75, 60, 12, 75]),
    ],
  }),
  youth({
    id: 'thailand-youth',
    kit: 'thailand',
    en: 'Thailand Youth',
    km: 'ថៃ យុវជន',
    short: 'THA',
    players: [
      member('Somchai', 1, [58, 38, 56, 42, 50, 66, 60]),
      member('Narongrit', 2, [62, 42, 56, 50, 64, 12, 64]),
      member('Kittisak', 4, [60, 42, 56, 48, 65, 12, 64]),
      member('Anucha', 5, [60, 40, 56, 48, 64, 12, 62]),
      member('Prasert', 3, [64, 44, 56, 52, 62, 12, 64]),
      member('Weerapong', 6, [62, 50, 64, 58, 56, 12, 66]),
      member('Sarawut', 8, [64, 52, 64, 60, 54, 12, 66]),
      member('Thanakorn', 16, [64, 52, 62, 60, 54, 12, 66]),
      member('Pichit', 7, [66, 58, 54, 62, 44, 12, 62]),
      member('Jakkrit', 9, [64, 64, 54, 60, 42, 12, 62]),
      member('Nattapong', 11, [66, 58, 54, 62, 44, 12, 62]),
    ],
  }),
  youth({
    id: 'korea-youth',
    kit: 'korea',
    en: 'Korea Youth',
    km: 'កូរ៉េ យុវជន',
    short: 'KOR',
    players: [
      member('Seojun', 1, [60, 40, 56, 44, 52, 66, 62]),
      member('Jihoon', 2, [62, 42, 56, 50, 64, 12, 66]),
      member('Woojin', 4, [60, 42, 56, 48, 65, 12, 66]),
      member('Hyunwoo', 5, [60, 40, 56, 48, 64, 12, 66]),
      member('Dohyun', 3, [64, 44, 56, 52, 62, 12, 66]),
      member('Jaemin', 6, [62, 50, 64, 58, 56, 12, 68]),
      {
        ...withSpirit(
          starPlayer('minjun', 8, [76, 70, 74, 74, 72, 12, 88], ['hwarang-charge']),
          150,
        ),
        hunts: 'sochetra',
      },
      member('Sungmin', 14, [64, 52, 62, 60, 54, 12, 68]),
      member('Junho', 7, [66, 58, 54, 62, 42, 12, 64]),
      member('Dongwook', 9, [64, 64, 54, 60, 42, 12, 64]),
      member('Gunwoo', 11, [66, 58, 54, 62, 42, 12, 64]),
    ],
  }),
  youth({
    id: 'iran-youth',
    kit: 'iran',
    en: 'Iran Youth',
    km: 'អ៊ីរ៉ង់ យុវជន',
    short: 'IRN',
    players: [
      starPlayer('farhad', 1, [62, 40, 60, 44, 56, 82, 70], ['mountain-guard']),
      member('Amir', 2, [68, 50, 62, 56, 72, 12, 70]),
      member('Reza', 4, [66, 50, 62, 54, 74, 12, 72]),
      member('Mehdi', 5, [66, 48, 64, 54, 73, 12, 72]),
      member('Saeed', 3, [70, 52, 62, 58, 71, 12, 70]),
      member('Arash', 6, [68, 58, 70, 64, 64, 12, 72]),
      member('Kian', 8, [70, 60, 72, 66, 62, 12, 74]),
      member('Dariush', 16, [68, 58, 70, 64, 64, 12, 72]),
      member('Omid', 7, [74, 66, 62, 70, 50, 12, 70]),
      member('Pouya', 9, [72, 73, 60, 68, 50, 12, 70]),
      member('Navid', 11, [74, 66, 62, 70, 50, 12, 70]),
    ],
  }),
];
