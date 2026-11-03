import { isRecord } from '../values.js';

function refsOfStage(stage) {
  if (stage?.kind === 'scene') {
    return [stage.scene];
  }

  const after = isRecord(stage?.after) ? Object.values(stage.after) : [stage?.after];
  const triggers = Array.isArray(stage?.triggers)
    ? stage.triggers.map((trigger) => trigger?.scene)
    : [];

  return [stage?.before, ...after, ...triggers];
}

export function sceneRefs(chapter) {
  const cups = Object.entries(isRecord(chapter.cups) ? chapter.cups : {}).map(([id, cup]) => ({
    id: cup?.failScene,
    where: `${chapter.id} cup ${id}`,
  }));
  const stages = chapter.stages.flatMap((stage, index) =>
    refsOfStage(stage).map((id) => ({ id, where: `${chapter.id} stage ${index + 1}` })),
  );

  return [...cups, ...stages].filter((ref) => typeof ref.id === 'string');
}
