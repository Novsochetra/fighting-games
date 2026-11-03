import { MOODS, footballerKey, recipeFor } from './cast/index.js';
import { composePortrait } from './compose.js';
import { createLru } from './lru.js';
import { runsOf } from './runs.js';
import { SILHOUETTE_PALETTE, composeSilhouette } from './silhouette.js';

const composed = createLru(96);

function variantKey(character, variant) {
  if (character === 'footballer') {
    return footballerKey(variant ?? {});
  }

  return character === 'villager' ? (variant ?? 0) : '';
}

function keyOf({ character, age, mood, variant }) {
  const known = MOODS.includes(mood) ? mood : 'neutral';

  return `${character}|${age ?? ''}|${known}|${variantKey(character, variant)}`;
}

function compose(request) {
  const recipe = recipeFor(request);

  if (!recipe) {
    return runsOf(composeSilhouette(), SILHOUETTE_PALETTE);
  }

  return runsOf(composePortrait(recipe, request.mood), recipe.palette);
}

// a portrait comes out as rows of same-coloured runs, kept so a scene redraws it without rebuilding
export function portraitFor(request) {
  const key = keyOf(request);
  const found = composed.get(key);

  if (found) {
    return found;
  }

  const portrait = { key, runs: compose({ ...request, mood: key.split('|')[2] }) };

  composed.set(key, portrait);

  return portrait;
}
