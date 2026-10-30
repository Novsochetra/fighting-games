export const INSTALL_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

// iPadOS reports itself as a Mac, so a "Mac" with a touch screen is an iPad.
export function isIosDevice({ platform, maxTouchPoints }) {
  return /iP(hone|od|ad)/.test(platform) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function isSnoozed(dismissedAt, now, snooze = INSTALL_SNOOZE_MS) {
  return typeof dismissedAt === 'number' && now - dismissedAt >= 0 && now - dismissedAt < snooze;
}

// 'prompt' once the browser hands over its install prompt; 'ios' where Safari installs only from its
// Share menu, so the banner can only say where to tap.
export function installOffer({ isInstalled, isSnoozed: snoozed, hasPrompt, isIos }) {
  if (isInstalled || snoozed) {
    return null;
  }
  if (hasPrompt) {
    return 'prompt';
  }
  return isIos ? 'ios' : null;
}
