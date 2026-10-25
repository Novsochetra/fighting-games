// What the home page counts. Google Analytics takes names of lowercase letters, digits and
// underscores, at most 40 characters, and keeps some (first_visit, session_start) for itself.
export const EVENTS = {
  play: 'play_game',
  comingSoon: 'tap_coming_soon',
  details: 'view_game_details',
  favorite: 'favorite_game',
  filter: 'filter_library',
  showMore: 'show_more_games',
  installShown: 'install_banner_shown',
  install: 'install_click',
  installChoice: 'install_choice',
  installDismiss: 'install_dismiss',
  installed: 'app_installed',
  supportShown: 'support_banner_shown',
  supportDismiss: 'support_dismiss',
  supporters: 'open_supporters',
  credits: 'open_credits',
  sound: 'toggle_sound',
  appearance: 'toggle_appearance',
};

export const onOff = (isOn) => (isOn ? 'on' : 'off');
