// the name is kept as it is typed, so a redraw (Posting…) never loses it, and the phone keyboard's
// Send, or Enter, posts it
export function installPostEvents({ root, menus, act }) {
  root.addEventListener('input', (event) => {
    if (event.target.matches('.post-name')) {
      menus.panels.post.state.name = event.target.value;
    }
  });
  root.addEventListener('submit', (event) => {
    event.preventDefault();
    act('sendScore');
  });
}
