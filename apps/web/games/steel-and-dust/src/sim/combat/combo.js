const RANKS = [
  [35, 'LEGENDARY'],
  [20, 'BRUTAL'],
  [10, 'GREAT'],
  [5, 'NICE'],
];

export function comboRank(count) {
  const rank = RANKS.find(([minimum]) => count >= minimum);
  return rank ? rank[1] : '';
}

export function endCombo(game) {
  const { combo, records } = game;
  if (combo.count >= 5) {
    game.comboResult = {
      count: combo.count,
      damage: combo.damage,
      rank: comboRank(combo.count),
      time: 0,
      best: combo.count > records.bestCombo,
    };
    game.io.sfx('combo');
  }
  if (combo.count > records.bestCombo) {
    records.bestCombo = combo.count;
    game.io.saveRecords(records);
  }
  combo.count = 0;
  combo.timer = 0;
  combo.damage = 0;
}

export function commitScore(game) {
  if (game.score > game.records.bestScore) {
    game.records.bestScore = game.score;
    game.newBestScore = true;
    game.io.saveRecords(game.records);
  }
}

export function addUltMeter(game, amount) {
  game.ultMeter = Math.min(100, game.ultMeter + amount);
}
