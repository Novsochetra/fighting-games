// the Angkor painting stays up behind the title, every panel opened over it and the hero select, so
// moving between them never drops back to the game screen for a frame
const SCENE_MENUS = new Set(['title', 'heroes']);
// the button layout editor keeps only a light dim, so the buttons are placed against the screen
const DIM_FOR_MENU = {
  title: 'none',
  heroes: 'none',
  pause: 'menu',
  over: 'menu',
  clear: 'menu',
  layout: 'light',
};

// what lies behind the open menu: one painting and one dim layer shared by every menu, so a change
// of menu fades their darkness from one level to the next instead of stacking two backdrops
export function menuBackdrop(stack) {
  const top = stack[stack.length - 1];
  if (!top) {
    return { scene: 'off', dim: 'none' };
  }
  return {
    scene: stack.some((id) => SCENE_MENUS.has(id)) ? 'on' : 'off',
    dim: DIM_FOR_MENU[top] ?? 'panel',
  };
}
