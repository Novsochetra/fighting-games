import { hero, member, starPlayer, team, withSpirit } from './squad.js';

const nation = ({ id, en, km, short, players }) =>
  team({ id, name: { en, km }, short, format: '11', players });

// the world's best: stats around 75 to 90, Rafael and Lukas above even that. Cambodia's side
// stands at the foot of the band and Brazil near its top; the group opener plays Brazil above even
// that and Cambodia a little below (its `opponentForm` and `teamForm`), so Rafael's Brazil usually
// beats a decent player there, and the final meets both as they are here
// (test/integration/data/story-balance.test.js)
export const CHAPTER_4_TEAMS = [
  nation({
    id: 'cambodia',
    en: 'Cambodia',
    km: 'កម្ពុជា',
    short: 'CAM',
    players: [
      starPlayer('dara', 1, [70, 50, 64, 54, 60, 82, 74], ['angkor-wall']),
      member({ en: 'Kosal', km: 'កុសល' }, 2, [67, 47, 61, 55, 75, 14, 69]),
      member({ en: 'Visal', km: 'វិសាល' }, 4, [65, 49, 61, 53, 75, 14, 69]),
      member({ en: 'Sovannara', km: 'សុវណ្ណារ៉ា' }, 5, [65, 47, 63, 55, 75, 14, 67]),
      member({ en: 'Chanra', km: 'ចាន់រ៉ា' }, 3, [69, 49, 61, 57, 75, 14, 69]),
      member({ en: 'Pisey', km: 'ពិសី' }, 6, [67, 57, 75, 65, 63, 14, 69]),
      member({ en: 'Vichea', km: 'វិជ្ជា' }, 8, [67, 59, 75, 67, 61, 14, 71]),
      member({ en: 'Sokheng', km: 'សុខហេង' }, 16, [75, 59, 69, 69, 59, 14, 69]),
      member({ en: 'Tola', km: 'តុលា' }, 11, [75, 65, 61, 69, 49, 14, 67]),
      hero(),
      starPlayer('rithy', 7, [82, 84, 80, 82, 56, 14, 78], ['preah-khan-strike']),
    ],
  }),
  nation({
    id: 'brazil',
    en: 'Brazil',
    km: 'ប្រេស៊ីល',
    short: 'BRA',
    players: [
      member('Gustavo', 1, [74, 50, 72, 58, 60, 89, 89]),
      member('Thiago', 2, [89, 79, 89, 89, 89, 14, 89]),
      member('Bruno', 4, [89, 77, 89, 85, 89, 14, 89]),
      member('Caio', 3, [89, 75, 89, 87, 89, 14, 89]),
      member('Renan', 6, [89, 81, 89, 89, 89, 14, 89]),
      member('Mateus', 5, [89, 87, 89, 89, 89, 14, 89]),
      // his duel scene is written for him and Sochetra face to face (src/sim/hunts.js)
      {
        ...withSpirit(
          starPlayer(
            'rafael',
            10,
            [96, 96, 94, 97, 66, 14, 90],
            ['samba-mirage', 'carnival-rocket'],
          ),
          170,
        ),
        hunts: 'sochetra',
      },
      member('Davi', 8, [89, 89, 89, 89, 89, 14, 89]),
      member('Igor', 11, [89, 89, 89, 89, 75, 14, 89]),
      member('Leandro', 9, [89, 89, 89, 89, 73, 14, 89]),
      member('Pedro', 7, [89, 89, 89, 89, 73, 14, 89]),
    ],
  }),
  nation({
    id: 'nigeria',
    en: 'Nigeria',
    km: 'នីហ្សេរីយ៉ា',
    short: 'NGA',
    players: [
      member('Femi', 1, [72, 48, 66, 54, 58, 77, 73]),
      member('Emeka', 2, [79, 53, 65, 63, 75, 14, 75]),
      member('Obinna', 4, [75, 53, 63, 59, 77, 14, 77]),
      member('Tunde', 5, [75, 51, 63, 59, 76, 14, 77]),
      member('Ifeanyi', 3, [79, 53, 65, 63, 74, 14, 75]),
      member('Chidi', 6, [75, 61, 71, 69, 71, 14, 77]),
      member('Segun', 8, [77, 63, 73, 71, 69, 14, 79]),
      member('Ademola', 14, [77, 63, 71, 71, 67, 14, 77]),
      member('Ikenna', 7, [81, 71, 65, 75, 51, 14, 75]),
      member('Uche', 9, [79, 77, 63, 73, 51, 14, 75]),
      member('Yusuf', 11, [81, 71, 65, 75, 51, 14, 75]),
    ],
  }),
  nation({
    id: 'mexico',
    en: 'Mexico',
    km: 'ម៉ិកស៊ិក',
    short: 'MEX',
    players: [
      member('Navarro', 1, [70, 48, 66, 54, 58, 78, 73]),
      member('Ramirez', 2, [75, 53, 67, 63, 73, 14, 75]),
      member('Torres', 4, [73, 53, 65, 59, 75, 14, 75]),
      member('Flores', 5, [73, 51, 65, 59, 74, 14, 75]),
      member('Morales', 3, [77, 53, 67, 63, 72, 14, 75]),
      member('Castillo', 6, [73, 61, 75, 71, 67, 14, 77]),
      member('Ortiz', 8, [75, 63, 76, 73, 65, 14, 79]),
      member('Vargas', 16, [75, 61, 73, 71, 65, 14, 77]),
      member('Mendoza', 7, [79, 69, 65, 75, 51, 14, 73]),
      member('Reyes', 9, [77, 76, 63, 73, 51, 14, 73]),
      member('Aguilar', 11, [79, 69, 65, 75, 51, 14, 73]),
    ],
  }),
  nation({
    id: 'germany',
    en: 'Germany',
    km: 'អាល្លឺម៉ង់',
    short: 'GER',
    players: [
      member('Hartmann', 1, [72, 48, 70, 54, 62, 88, 80]),
      member('Fischer', 2, [80, 62, 76, 70, 84, 14, 84]),
      {
        ...withSpirit(starPlayer('lukas', 4, [82, 66, 78, 70, 93, 14, 88], ['iron-gate']), 150),
        hunts: 'sochetra',
      },
      member('Weber', 5, [78, 60, 76, 68, 86, 14, 84]),
      member('Koch', 3, [82, 62, 76, 72, 84, 14, 84]),
      member('Richter', 6, [80, 70, 84, 76, 80, 14, 86]),
      member('Wolf', 8, [82, 74, 84, 80, 76, 14, 86]),
      member('Braun', 14, [82, 78, 86, 82, 70, 14, 84]),
      member('Lange', 11, [86, 80, 76, 82, 60, 14, 82]),
      member('Vogel', 9, [82, 86, 74, 80, 60, 14, 82]),
      member('Schulz', 7, [86, 80, 76, 84, 58, 14, 82]),
    ],
  }),
];
