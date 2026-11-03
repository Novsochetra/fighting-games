// a kick is struck the moment its charge began: the clocks of a pass combo and a chain wait while
// the player charges it, so a full charge does not run them out
export const struckAt = (match, player) => match.tick - (player?.charge ?? 0);
