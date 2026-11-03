import { hero, member, starPlayer, team } from './squad.js';

// primary school kids: stats around 30 to 50, Rithy a step above Sochetra's start
export const CHAPTER_1_TEAMS = [
  team({
    id: 'chrey-school',
    name: { en: 'Chrey School', km: 'សាលាជ្រៃ' },
    short: 'CHR',
    format: '7',
    players: [
      starPlayer('dara', 1, [34, 20, 30, 22, 30, 46, 40], []),
      member({ en: 'Srey Pov', km: 'ស្រីពៅ' }, 2, [38, 28, 34, 30, 46, 8, 44]),
      member({ en: 'Kosal', km: 'កុសល' }, 3, [36, 26, 32, 28, 44, 8, 42]),
      member({ en: 'Pisey', km: 'ពិសី' }, 6, [40, 34, 42, 38, 36, 8, 42]),
      member({ en: 'Vuthy', km: 'វុទ្ធី' }, 8, [42, 36, 40, 40, 34, 8, 46]),
      member({ en: 'Tola', km: 'តុលា' }, 7, [44, 38, 36, 42, 30, 8, 40]),
      hero(),
    ],
  }),
  team({
    id: 'neighbor-village',
    name: { en: 'Svay Village', km: 'ភូមិស្វាយ' },
    short: 'SVY',
    format: '7',
    players: [
      member({ en: 'Samnang', km: 'សំណាង' }, 1, [30, 16, 26, 20, 28, 38, 36]),
      member({ en: 'Heng', km: 'ហេង' }, 2, [32, 22, 28, 24, 38, 6, 36]),
      member({ en: 'Mony', km: 'មុនី' }, 3, [30, 22, 26, 24, 36, 6, 38]),
      member({ en: 'Ponleu', km: 'ពន្លឺ' }, 6, [34, 28, 34, 32, 30, 6, 36]),
      member({ en: 'Sambath', km: 'សម្បត្តិ' }, 8, [36, 30, 32, 34, 30, 6, 38]),
      member({ en: 'Kakada', km: 'កក្កដា' }, 7, [38, 30, 30, 34, 26, 6, 34]),
      member({ en: 'Veasna', km: 'វាសនា' }, 9, [40, 38, 30, 36, 22, 6, 36]),
    ],
  }),
  team({
    id: 'riverside-school',
    name: { en: 'Riverside School', km: 'សាលាមាត់ទន្លេ' },
    short: 'RIV',
    format: '7',
    players: [
      member({ en: 'Chamroeun', km: 'ចំរើន' }, 1, [34, 18, 28, 22, 30, 46, 42]),
      member({ en: 'Sovann', km: 'សុវណ្ណ' }, 2, [40, 28, 36, 32, 46, 8, 44]),
      member({ en: 'Sophal', km: 'សុផល' }, 5, [38, 28, 34, 30, 48, 8, 44]),
      member({ en: 'Nimol', km: 'និមល' }, 6, [42, 34, 44, 40, 38, 8, 44]),
      member({ en: 'Oudom', km: 'ឧត្តម' }, 8, [44, 36, 42, 42, 36, 8, 46]),
      member({ en: 'Sethy', km: 'សេដ្ឋី' }, 7, [46, 38, 38, 44, 32, 8, 42]),
      member({ en: 'Makara', km: 'មករា' }, 9, [46, 46, 36, 44, 28, 8, 42]),
    ],
  }),
  team({
    id: 'royal-kids',
    name: { en: 'Royal Kids', km: 'កុមាររាជធានី' },
    short: 'RYK',
    format: '7',
    players: [
      member({ en: 'Chivorn', km: 'ជីវ័ន' }, 1, [38, 20, 32, 24, 34, 48, 44]),
      member({ en: 'Panha', km: 'បញ្ញា' }, 2, [42, 30, 38, 34, 48, 8, 46]),
      member({ en: 'Thearith', km: 'ធារិទ្ធ' }, 4, [40, 30, 36, 32, 50, 8, 46]),
      member({ en: 'Vibol', km: 'វិបុល' }, 6, [44, 36, 46, 42, 40, 8, 46]),
      member({ en: 'Seyha', km: 'សីហា' }, 8, [46, 40, 44, 44, 38, 8, 48]),
      member({ en: 'Rathana', km: 'រតនា' }, 7, [48, 40, 40, 46, 34, 8, 44]),
      // his duel scene in the final is written for him and Sochetra face to face (src/sim/hunts.js)
      {
        ...starPlayer('rithy', 10, [54, 56, 48, 55, 34, 10, 50], ['power-shot']),
        hunts: 'sochetra',
      },
    ],
  }),
];
