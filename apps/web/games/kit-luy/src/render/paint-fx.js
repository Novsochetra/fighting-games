import { COIN_FACE, COIN_SPIN } from '../art/coin.js';
import { COIN, NOTE_EDGE, NOTES, SHARD, SPARK } from '../art/palette.js';

const SPIN_PER_SECOND = 14;

function paintCoin(context, coin) {
  const columns = COIN_SPIN[Math.floor(coin.age * SPIN_PER_SECOND + coin.spin) % COIN_SPIN.length];
  const left = Math.round(coin.x - columns.length / 2);
  const top = Math.round(coin.y - COIN_FACE.length / 2);

  COIN_FACE.forEach((row, rowIndex) => {
    columns.forEach((column, i) => {
      const color = COIN[row[column]];

      if (color) {
        context.fillStyle = color;
        context.fillRect(left + i, top + rowIndex, 1, 1);
      }
    });
  });
}

function paintNote(context, note) {
  const height = Math.sin(note.age * 9 + note.sway) > 0 ? 4 : 2;
  const x = Math.round(note.x);
  const y = Math.round(note.y);

  context.fillStyle = NOTE_EDGE;
  context.fillRect(x - 1, y - 1, 9, height + 2);
  context.fillStyle = NOTES[note.color % NOTES.length];
  context.fillRect(x, y, 7, height);
}

function paintShard(context, shard) {
  context.globalAlpha = Math.max(0, 1 - shard.age / shard.life);
  context.fillStyle = SHARD;
  context.fillRect(Math.round(shard.x), Math.round(shard.y), 2, 2);
  context.globalAlpha = 1;
}

function paintSpark(context, spark) {
  const x = Math.round(spark.x);
  const y = Math.round(spark.y);

  context.globalAlpha = Math.max(0, 1 - spark.age / spark.life);
  context.fillStyle = SPARK;
  context.fillRect(x - 1, y, 3, 1);
  context.fillRect(x, y - 1, 1, 3);
  context.globalAlpha = 1;
}

const PAINTERS = { coin: paintCoin, note: paintNote, shard: paintShard, spark: paintSpark };

export function paintFx(context, fx) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  // a coin of a burst waits its turn with an age under zero: not thrown yet, so not drawn
  for (const particle of fx.particles.filter((thrown) => thrown.age >= 0)) {
    PAINTERS[particle.kind](context, particle);
  }
}
