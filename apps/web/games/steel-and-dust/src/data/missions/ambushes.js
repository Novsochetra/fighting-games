// a wave in a mission spec that ambushes the hero instead of walking in (src/data/ambush.js):
// dropping out of the trees or off the towers and ironwork overhead, or bursting out of the sand
export const dropIn = (kinds) => ({ kinds, ambush: 'drop' });

export const burrowIn = (kinds) => ({ kinds, ambush: 'burrow' });
