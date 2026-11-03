export const metFlag = (teamId) => `met:${teamId}`;

export const rewardFlag = (at) => `reward:${at.chapterId}/${at.stage}`;

export function withFlags(save, names) {
  const raised = Object.fromEntries(names.map((name) => [name, true]));

  return { ...save, flags: { ...save.flags, ...raised } };
}
