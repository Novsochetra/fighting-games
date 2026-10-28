import { watchBoot } from './boot-recovery.js';

// the page runs this ahead of its other scripts, and it loads nothing more, so the loading screen's
// own modules failing to come down is retried too, where it stayed at 0%; boot-loading.js imports
// this same instance
export const recovery = watchBoot(window);
