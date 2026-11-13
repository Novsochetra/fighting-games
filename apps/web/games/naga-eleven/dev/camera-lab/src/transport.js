import { seek } from './player.js';

export function renderTimeline(document, player, onPick) {
  const list = document.getElementById('timeline');
  const items = player.stages.map((entry) => {
    const item = document.createElement('li');

    item.textContent = entry.stage;
    item.title = `${entry.stage}: ${entry.length} ticks`;
    item.style.setProperty('--length', String(entry.length));
    item.addEventListener('click', () => onPick(entry.from + 1));

    return item;
  });

  list.replaceChildren(...items);
}

export function showPlace(document, player) {
  const scrub = document.getElementById('scrub');
  const { scene, frame, total } = player;
  const now = player.stages.findIndex(
    (entry) => frame > entry.from && frame <= entry.from + entry.length,
  );

  document.getElementById('readout').textContent =
    `${scene.stage()} ${scene.stageTicks()} · ${frame} / ${total}`;
  scrub.max = String(total);
  scrub.value = String(frame);
  document.querySelector('[data-do="play"]').textContent = player.playing ? 'Pause' : 'Play';
  [...document.getElementById('timeline').children].forEach((item, i) =>
    item.classList.toggle('is-now', i === now),
  );
}

const KEYS = {
  ' ': (player) => {
    player.playing = !player.playing;
  },
  ArrowLeft: (player) => stepBy(player, -1),
  ArrowRight: (player) => stepBy(player, 1),
  Home: (player) => seek(player, 0),
};

function stepBy(player, by) {
  player.playing = false;
  seek(player, player.frame + by);
}

const isTyping = (target) => ['TEXTAREA', 'INPUT', 'SELECT'].includes(target?.tagName);

export function installTransport(document, playerOf) {
  const on = (name, handle) =>
    document.querySelector(`[data-do="${name}"]`).addEventListener('click', handle);

  on('play', () => KEYS[' '](playerOf()));
  on('back', () => stepBy(playerOf(), -1));
  on('on', () => stepBy(playerOf(), 1));
  on('restart', () => seek(playerOf(), 0));
  document.querySelector('[data-do="speed"]').addEventListener('input', (event) => {
    playerOf().speed = Number(event.target.value);
  });
  document.getElementById('scrub').addEventListener('input', (event) => {
    playerOf().playing = false;
    seek(playerOf(), Number(event.target.value));
  });
  document.addEventListener('keydown', (event) => {
    if (KEYS[event.key] && !isTyping(event.target)) {
      event.preventDefault();
      KEYS[event.key](playerOf());
    }
  });
}
