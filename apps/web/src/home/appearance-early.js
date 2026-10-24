// A classic script in the page's head, run before anything is drawn, so a light screen never shows
// dark first. It makes the same choice as resolveAppearance in appearance.js (a test holds the two
// together): the visitor's switch while the device keeps the appearance it had then, else the device's.
{
  const root = document.documentElement;
  const system = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  const readSaved = () => {
    try {
      return JSON.parse(window.localStorage.getItem('arcade.appearance'));
    } catch {
      return null;
    }
  };
  const saved = readSaved();
  const isKept = saved && saved.system === system && ['light', 'dark'].includes(saved.choice);
  root.dataset.appearance = isKept ? saved.choice : system;
}
