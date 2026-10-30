import { describe, expect, it } from 'vitest';
import {
  INSTALL_SNOOZE_MS,
  installOffer,
  isIosDevice,
  isSnoozed,
} from '@/services/install/install-offer.js';

describe('isIosDevice', () => {
  it('knows an iPhone, an iPod and an iPad', () => {
    expect(isIosDevice({ platform: 'iPhone', maxTouchPoints: 5 })).toBe(true);
    expect(isIosDevice({ platform: 'iPod touch', maxTouchPoints: 5 })).toBe(true);
    expect(isIosDevice({ platform: 'iPad', maxTouchPoints: 5 })).toBe(true);
  });

  it('takes a Mac with a touch screen for the iPad it is', () => {
    expect(isIosDevice({ platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
    expect(isIosDevice({ platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false);
  });

  it('leaves out Android and desktops', () => {
    expect(isIosDevice({ platform: 'Linux armv8l', maxTouchPoints: 5 })).toBe(false);
    expect(isIosDevice({ platform: 'Win32', maxTouchPoints: 0 })).toBe(false);
  });
});

describe('isSnoozed', () => {
  it('holds the banner back for two weeks after Not now', () => {
    expect(isSnoozed(1000, 1000)).toBe(true);
    expect(isSnoozed(1000, 1000 + INSTALL_SNOOZE_MS - 1)).toBe(true);
    expect(isSnoozed(1000, 1000 + INSTALL_SNOOZE_MS)).toBe(false);
  });

  it('is not snoozed without a saved time, or with one from the future', () => {
    expect(isSnoozed(null, 1000)).toBe(false);
    expect(isSnoozed('1000', 1000)).toBe(false);
    expect(isSnoozed(5000, 1000)).toBe(false);
  });
});

describe('installOffer', () => {
  const visit = { isInstalled: false, isSnoozed: false, hasPrompt: false, isIos: false };

  it('offers the browser install prompt once there is one', () => {
    expect(installOffer({ ...visit, hasPrompt: true })).toBe('prompt');
  });

  it('shows iPhone visitors where to tap, since Safari has no prompt', () => {
    expect(installOffer({ ...visit, isIos: true })).toBe('ios');
  });

  it('offers nothing in a browser that cannot install the arcade', () => {
    expect(installOffer(visit)).toBeNull();
  });

  it('offers nothing inside the installed app or while snoozed', () => {
    expect(installOffer({ ...visit, hasPrompt: true, isInstalled: true })).toBeNull();
    expect(installOffer({ ...visit, isIos: true, isInstalled: true })).toBeNull();
    expect(installOffer({ ...visit, hasPrompt: true, isSnoozed: true })).toBeNull();
    expect(installOffer({ ...visit, isIos: true, isSnoozed: true })).toBeNull();
  });
});
