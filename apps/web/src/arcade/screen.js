import { addStylesheets, fetchScreen, headOf } from './screen-markup.js';

// One screen of the arcade. The one the page opened at is in the document already; another is taken
// in from its own page the first time it is asked for, inert until it shows. Each boots the first
// time it shows, while the address is its own, so its relative requests resolve as on its own page.
export function createScreen({ document, fetch, id, url, boot, onShow }) {
  const present = document.querySelector(`[data-screen="${id}"]`);
  const screen = { id, url, root: present, head: present ? headOf(document) : null, page: null };
  let mounting = present ? Promise.resolve() : null;

  async function mount() {
    const { root, stylesheets, head } = await fetchScreen({ document, fetch, url, id });
    const styled = addStylesheets(document, stylesheets);

    root.toggleAttribute('inert', true);
    document.body.append(root);
    Object.assign(screen, { root, head });

    await styled;
  }

  // A failed fetch is tried again on the next ask, not remembered.
  screen.ready = () => {
    mounting ??= mount().catch((error) => {
      mounting = null;
      throw error;
    });

    return mounting;
  };

  screen.start = () => {
    screen.page ??= boot();

    return screen.page;
  };

  screen.shown = (visit) => {
    const page = screen.start();

    onShow?.(page, visit);
  };

  return screen;
}
