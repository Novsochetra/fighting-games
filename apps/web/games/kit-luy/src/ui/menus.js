export function createMenus(root) {
  const sections = [...root.querySelectorAll('.menu')];
  let screenMenu = null;
  let panel = null;

  function render() {
    const open = panel ?? screenMenu;
    const section = sections.find((menu) => menu.id === `m-${open}`);

    sections.forEach((menu) => menu.classList.toggle('open', menu === section));

    if (section) {
      (section.querySelector('.primary') ?? section.querySelector('button'))?.focus();
    } else {
      root.ownerDocument.activeElement?.blur?.();
    }
  }

  return {
    showFor(menu) {
      if (menu !== screenMenu) {
        screenMenu = menu;
        render();
      }
    },

    open(name) {
      panel = name;
      render();
    },

    back() {
      const wasOpen = panel !== null;

      panel = null;
      render();

      return wasOpen;
    },

    get panel() {
      return panel;
    },
  };
}
