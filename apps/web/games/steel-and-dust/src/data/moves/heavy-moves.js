// the moves the heavy button makes, in every weapon's set; each one spends the bar
const HEAVY_MOVE_IDS = new Set(['K1', 'K2', 'K3', 'LLK', 'UK', 'C1', 'C2', 'AK', 'ADK']);

export function isHeavyMove(move) {
  return Boolean(move) && HEAVY_MOVE_IDS.has(move.id);
}
