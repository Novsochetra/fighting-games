import { PORTRAIT_MOODS, SCENE_MOODS, SIDES, failing, isBilingual, isKnown } from './known.js';
import { sceneRefs } from './scene-refs.js';

const SCENE_RULES = [
  [
    (scene, { known }) => isKnown(known.backdrops, scene.backdrop),
    (scene) => `unknown backdrop '${scene.backdrop}'`,
  ],
  [(scene) => SCENE_MOODS.includes(scene.mood), (scene) => `unknown mood '${scene.mood}'`],
  [(scene) => Array.isArray(scene.lines) && scene.lines.length > 0, 'no lines'],
];

const LINE_RULES = [
  [
    (line, { known }) => isKnown(known.characters, line.speaker),
    (line) => `unknown speaker '${line.speaker}'`,
  ],
  [
    (line) => line.mood === undefined || PORTRAIT_MOODS.includes(line.mood),
    (line) => `unknown mood '${line.mood}'`,
  ],
  [
    (line) => line.side === undefined || SIDES.includes(line.side),
    (line) => `unknown side '${line.side}'`,
  ],
  [(line) => isBilingual(line.text), 'the text is not in both languages'],
];

function problemsOfScene(scene, context) {
  const lines = Array.isArray(scene.lines) ? scene.lines : [];
  const lineProblems = lines.flatMap((line, index) =>
    failing(LINE_RULES, line ?? {}, { ...context, where: `${context.where} line ${index + 1}` }),
  );

  return [...failing(SCENE_RULES, scene, context), ...lineProblems];
}

export function sceneProblems({ chapter, known }) {
  const refs = sceneRefs(chapter);
  const named = new Set(refs.map((ref) => ref.id));
  const missing = refs
    .filter((ref) => !Object.hasOwn(chapter.scenes, ref.id))
    .map((ref) => `${ref.where}: no scene '${ref.id}'`);
  const scenes = Object.entries(chapter.scenes);
  const unplayed = scenes
    .filter(([id]) => !named.has(id))
    .map(([id]) => `${chapter.id} scene ${id}: never played`);
  const content = scenes.flatMap(([id, scene]) =>
    problemsOfScene(scene ?? {}, { known, where: `${chapter.id} scene ${id}` }),
  );

  return [...missing, ...unplayed, ...content];
}
