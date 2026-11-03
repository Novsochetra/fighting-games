// role is the part each one plays in the story; ages are the looks a portrait is drawn at
const GROWING_UP = ['child', 'teen', 'young', 'adult'];

const ROWS = [
  ['sochetra', 'Sochetra', 'សុចិត្រា', 'cambodia', 'hero', GROWING_UP],
  ['neary', 'Neary', 'នារី', 'cambodia', 'family', ['adult']],
  ['ta-sok', 'Ta Sok', 'តាសុខ', 'cambodia', 'family', ['adult']],
  ['coach-vannak', 'Coach Vannak', 'លោកគ្រូវណ្ណៈ', 'cambodia', 'coach', ['adult']],
  ['dara', 'Dara', 'ដារ៉ា', 'cambodia', 'friend', GROWING_UP],
  ['rithy', 'Rithy', 'រិទ្ធី', 'cambodia', 'rival', GROWING_UP],
  ['coach-sokha', 'Coach Sokha', 'លោកគ្រូសុខា', 'cambodia', 'coach', ['adult']],
  ['coach-bora', 'Coach Bora', 'លោកគ្រូបូរ៉ា', 'cambodia', 'coach', ['adult']],
  ['haruto', 'Haruto', 'ហារូតូ', 'japan', 'rival', ['young']],
  ['minjun', 'Minjun', 'មីនជុន', 'korea', 'rival', ['young']],
  ['farhad', 'Farhad', 'ហ្វារហាដ', 'iran', 'rival', ['young']],
  ['rafael', 'Rafael', 'រ៉ាហ្វាអែល', 'brazil', 'rival', ['adult']],
  ['lukas', 'Lukas', 'លូកាស', 'germany', 'rival', ['adult']],
  ['announcer', 'Announcer', 'អ្នកអត្ថាធិប្បាយ', null, 'voice', ['adult']],
  ['narrator', 'Narrator', 'អ្នកនិទាន', null, 'voice', []],
  ['villager', 'Villager', 'អ្នកភូមិ', 'cambodia', 'crowd', ['child', 'adult']],
];

const toCharacter = ([id, en, km, nation, role, ages]) => ({
  id,
  name: { en, km },
  nation,
  role,
  ages,
});

export const CHARACTERS = Object.fromEntries(ROWS.map((row) => [row[0], toCharacter(row)]));

export const CHARACTER_IDS = ROWS.map((row) => row[0]);
