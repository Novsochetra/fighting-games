// first, so each screen's own sheets come after the ones they all stand on, as the pages had them
import './arcade/global-styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createArcade } from './arcade/arcade-context';
import { App } from './arcade/App';
import { browserPorts } from './arcade/browser-ports';
import { registerWorker } from './arcade/register-worker';
import { renderScreen } from './arcade/render-screen';
import { arcadeRoot, isScreenId } from './arcade/screens';

// Each page names its screen on the element the app renders into (index.html, supporters/,
// credits/), so the arcade knows where it opened and so its own address.
const mount = document.getElementById('root')!;
const opened = isScreenId(mount.dataset.screen) ? mount.dataset.screen : 'home';
const root = arcadeRoot(new URL(window.location.href), opened);
const arcade = createArcade(browserPorts(window, root));

// only a build has the worker (npm run dev serves the files as they are written)
if (import.meta.env.PROD) {
  registerWorker(window, root);
}

createRoot(mount).render(
  <StrictMode>
    <App arcade={arcade} basename={root.pathname} renderScreen={renderScreen} />
  </StrictMode>,
);
