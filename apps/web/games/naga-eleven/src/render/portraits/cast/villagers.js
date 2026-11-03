import { ADULT_MAN, ADULT_WOMAN, ELDER_MAN, ELDER_WOMAN } from './villagers-old.js';
import { CHILD_BOY, CHILD_GIRL, YOUNG_MAN, YOUNG_WOMAN } from './villagers-young.js';

const villager = (age, sex, recipe) => ({ ...recipe, age, sex });

// the crowd of Chrey: anyone in the story without a face of their own wears one of these, a boy
// and a girl, a man and a woman of each age, none of them like anyone with a name
export const VILLAGERS = [
  villager('child', 'male', CHILD_BOY),
  villager('child', 'female', CHILD_GIRL),
  villager('young', 'male', YOUNG_MAN),
  villager('young', 'female', YOUNG_WOMAN),
  villager('adult', 'male', ADULT_MAN),
  villager('adult', 'female', ADULT_WOMAN),
  villager('elder', 'male', ELDER_MAN),
  villager('elder', 'female', ELDER_WOMAN),
];

export const VILLAGER_KINDS = VILLAGERS.map(({ age, sex }) => ({ age, sex }));
