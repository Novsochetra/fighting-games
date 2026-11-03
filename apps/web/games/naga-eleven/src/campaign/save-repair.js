import { DEFAULT_SEED, SAVE_VERSION } from './save-format.js';
import { repairCups, repairHero } from './save-parts.js';
import { countOf, isRecord } from './values.js';

// each step takes a save of its version to the next; saves from before versions had none
const MIGRATIONS = {
  0: (save) => ({ ...save, version: 1 }),
};

function migrate(stored) {
  let save = stored;

  for (let version = countOf(stored.version); version < SAVE_VERSION; version += 1) {
    const step = MIGRATIONS[version];

    if (!step) {
      return null;
    }

    save = step(save);
  }

  return save;
}

// fields this version does not know are kept, so a save from a newer game survives an older one
function sanitize(save) {
  return {
    ...save,
    version: Math.max(countOf(save.version), SAVE_VERSION),
    chapter: countOf(save.chapter),
    stage: countOf(save.stage),
    hero: repairHero(save.hero),
    cups: repairCups(save.cups),
    flags: isRecord(save.flags) ? save.flags : {},
    seed: Number.isFinite(save.seed) ? save.seed >>> 0 : DEFAULT_SEED,
    attempts: countOf(save.attempts),
  };
}

export function repairSave(stored) {
  if (!isRecord(stored)) {
    return null;
  }

  const migrated = migrate(stored);

  return migrated ? sanitize(migrated) : null;
}
