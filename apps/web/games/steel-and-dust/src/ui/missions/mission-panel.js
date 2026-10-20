import { MISSIONS } from '../../data/missions/index.js';

export function unlockedMissions(records) {
  return Math.min(Math.max(records.bestMission ?? 1, 1), MISSIONS.length);
}

function missionCardHtml(mission) {
  return `<button class="mbtn mission-card" data-act="mission-${mission.index}"
    data-theme="${mission.theme}">
    <span class="mission-number">Mission ${mission.number}</span>
    <span class="mission-name">${mission.name}</span>
  </button>`;
}

// every mission reached so far; the rest stay hidden until the one before them is beaten
export function createMissionPanel({ list, game }) {
  return {
    build() {
      const open = MISSIONS.slice(0, unlockedMissions(game.records));
      list.innerHTML = open.map(missionCardHtml).join('');
    },
  };
}
