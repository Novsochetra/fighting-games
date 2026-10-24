import { fetchCatalog } from './catalog-client.js';
import { createHomeController } from './home-controller.js';
import { createHomeView } from './home-view.js';
import { createLauncher } from './launcher.js';
import { wireInputs } from './wire-inputs.js';

export function bootHome({ document, fetch, navigate, gamepads }) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const view = createHomeView(document);
  const launcher = createLauncher({
    document,
    home: view.elements.home,
    findLink: view.findLink,
    navigate,
  });
  const controller = createHomeController({
    view,
    launch: launcher.launch,
    loadGames: () => fetchCatalog(fetch),
  });
  wireInputs({ document, grid: view.elements.grid, controller, gamepads, signal });
  view.elements.retry.addEventListener('click', () => controller.load(), { signal });
  const onPageShow = (event) => {
    if (event.persisted) {
      launcher.land();
    }
  };
  document.defaultView.addEventListener('pageshow', onPageShow, { signal });
  return { controller, launcher, ready: controller.load(), stop: () => lifetime.abort() };
}
