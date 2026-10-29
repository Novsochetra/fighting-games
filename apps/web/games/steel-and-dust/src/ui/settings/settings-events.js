export function installSettingsEvents({ elements, menus }) {
  elements.settingsSections.addEventListener('click', (event) => {
    const link = event.target.closest('[data-section]');

    if (link) {
      menus.panels.settings.pick(link.dataset.section);
      menus.open('section');
    }
  });
  elements.sectionRows.addEventListener('click', (event) => {
    const stepper = event.target.closest('button[data-d]');

    if (stepper) {
      const row = stepper.closest('.setrow');
      menus.state.selected = menus.items().indexOf(row);
      menus.changeSetting(row.dataset.k, Number(stepper.dataset.d), false);
    }
  });
}
