import { watchBoot } from './boot-recovery.js';
import { startLoading } from './start-loading.js';

// the page runs this from a script tag of its own, ahead of main.js, so the menu art is on its way
// while the game's few hundred modules still load, and a game that fails to load can be retried;
// main.js imports this same instance
const recovery = watchBoot(window);
const loading = startLoading(window);

export const bootLoading = {
  ...loading,
  appReady() {
    recovery.started();
    loading.appReady();
  },
};
