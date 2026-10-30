// Each game's board has an address of its own, so a link to it (from a game's Details, or shared)
// opens on that game.
export function boardRoute(gameId) {
  return gameId ? `/leaderboard/?game=${encodeURIComponent(gameId)}` : '/leaderboard/';
}

// the game the address asks for, if it has a board, or else the first that has one
export function pickedGame(games, asked) {
  return games.find((game) => game.id === asked) ?? games[0] ?? null;
}
