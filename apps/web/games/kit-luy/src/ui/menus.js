export function createMenus(shutter) {
  const sections = [...shutter.querySelectorAll('.menu')];
  let screenMenu = null;
  let sheet = null;

  function render() {
    const open = sheet ?? screenMenu;
    const section = sections.find((menu) => menu.id === `m-${open}`);

    shutter.classList.toggle('is-down', !!section);

    if (section) {
      sections.forEach((menu) => menu.classList.toggle('open', menu === section));
      (section.querySelector('.primary') ?? section.querySelector('button'))?.focus();
    } else {
      shutter.ownerDocument.activeElement?.blur?.();
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
      sheet = name;
      render();
    },

    back() {
      const wasOpen = sheet !== null;

      sheet = null;
      render();

      return wasOpen;
    },

    get isDown() {
      return (sheet ?? screenMenu) !== null;
    },
  };
}
