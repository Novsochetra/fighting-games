import { MOODS, footballerKey, recipeFor } from './cast/index.js';
import { composePortrait } from './compose.js';
import { KIT_MOOD_NAMES, gearColours, kitGridFor } from './kit/index.js';
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

function keyOf({ character, age, mood, variant, kit }) {
  const moods = kit ? KIT_MOOD_NAMES : MOODS;
  const known = moods.includes(mood) ? mood : 'neutral';

  return `${kit ? 'kit|' : ''}${character}|${age ?? ''}|${known}|${variantKey(character, variant)}`;
}

function compose(request) {
  const recipe = recipeFor(request);

  if (!recipe) {
    return runsOf(composeSilhouette(), SILHOUETTE_PALETTE);
  }

  const kit = request.kit ? kitGridFor(request) : null;

  if (kit) {
    (recipe.frontProps ?? []).forEach((paint) => paint(kit.grid, request.mood));

    return runsOf(kit.grid, { ...recipe.palette, ...gearColours(kit.tone, recipe.palette) });
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

  const mood = key.split('|').at(-2);
  const portrait = { key, runs: compose({ ...request, mood }) };

  composed.set(key, portrait);

  return portrait;
}
