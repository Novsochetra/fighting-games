export const NAGA_LAYERS = [
  'player',
  'keeper',
  'ball',
  'naga',
  'trail',
  'effects',
  'flash',
  'shake',
  'bars',
  'titles',
];

export const layerKey = (layer) => `layer-${layer}`;

export const isShown = (settings, layer) => settings[layerKey(layer)] !== false;
