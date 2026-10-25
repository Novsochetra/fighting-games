import { createAppearance } from '../home/appearance.js';
import { createBrowserStorage } from '../home/preferences.js';

// appearance-early.js picks light or dark before the first paint; this follows the device after it.
createAppearance({ document, storage: createBrowserStorage(window) });
