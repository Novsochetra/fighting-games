// each Shade's glow: the sword smear, charge glow, afterimages and its select-screen accent;
// `ult` colors its ultimate: the dimmed world, the cut-in band and title, the finale flash
export const HERO_THEMES = {
  moss: {
    blade: '#5fe8a0',
    glow: '#3cc8ff',
    glowDim: '#1f86c8',
    spark: '#7fffb0',
    aura: { every: 12, color: '#7fffb0' },
    ult: {
      dim: '#04140a',
      band: '#0a1f10',
      edge: '#18f693',
      streak: '#1d5a2a',
      title: '#9dffb8',
      flash: '#e2ffe9',
    },
  },
  firefly: {
    blade: '#4fd8ff',
    glow: '#ffe066',
    glowDim: '#c9a23a',
    spark: '#fff3a6',
    aura: { every: 5, color: '#ffe066' },
    ult: {
      dim: '#0c0a1e',
      band: '#171126',
      edge: '#ffe066',
      streak: '#5a4a10',
      title: '#fff3a6',
      flash: '#fff6cc',
    },
  },
  antler: {
    blade: '#3fe0c0',
    glow: '#9dffe6',
    glowDim: '#2f9f8a',
    spark: '#d6fff4',
    aura: { every: 9, color: '#9dffe6' },
    ult: {
      dim: '#041210',
      band: '#0a1f1c',
      edge: '#3fe0c0',
      streak: '#1a5a50',
      title: '#d6fff4',
      flash: '#e6fff9',
    },
  },
  blue: {
    blade: '#5aa8ff',
    glow: '#8fd0ff',
    glowDim: '#2a5fc8',
    spark: '#d8ecff',
    aura: { every: 10, color: '#8fd0ff' },
    ult: {
      dim: '#050d26',
      band: '#0a1430',
      edge: '#8fd0ff',
      streak: '#1f3a78',
      title: '#d8ecff',
      flash: '#eef8ff',
    },
  },
};
