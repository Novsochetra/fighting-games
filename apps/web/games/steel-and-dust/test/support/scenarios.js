export const SCENARIOS = {
  campaign: {
    seed: 1234,
    ticks: 7200,
    sampleEvery: 30,
    renderEvery: 240,
    scheduled: {
      600: ['mute'],
      640: ['mute'],
      900: ['pause'],
      1200: ['w2'],
      2000: ['fill'],
      2400: ['w3'],
      3000: ['debug'],
      3300: ['debug'],
      3600: ['w4'],
      4800: ['w1'],
      6000: ['w2'],
    },
  },
  boss: {
    seed: 99,
    ticks: 4000,
    sampleEvery: 30,
    renderEvery: 200,
    spawnBossAt: 30,
    scheduled: { 400: ['w4'], 1400: ['w3'], 2400: ['w2'], 3200: ['fill'] },
  },
};
