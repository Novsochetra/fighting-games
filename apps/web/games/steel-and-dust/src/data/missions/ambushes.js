// a wave in a mission spec that ambushes the hero instead of walking in (src/data/ambush.js):
// out of the trees on a forest road, out of the sand on a desert one
export const dropIn = (kinds) => ({ kinds, ambush: 'drop' });

export const burrowIn = (kinds) => ({ kinds, ambush: 'burrow' });
