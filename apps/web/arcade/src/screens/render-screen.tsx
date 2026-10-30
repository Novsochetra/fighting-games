import { CreditsScreen } from './credits/CreditsScreen';
import { HomeScreen } from './home/HomeScreen';
import { LeaderboardScreen } from './leaderboard/LeaderboardScreen';
import { SupportersScreen } from './supporters/SupportersScreen';
import type { ScreenId } from '@/navigation/routes/screens';

const SCREEN_VIEWS = {
  home: HomeScreen,
  leaderboard: LeaderboardScreen,
  supporters: SupportersScreen,
  credits: CreditsScreen,
} satisfies Record<ScreenId, () => React.JSX.Element>;

export function renderScreen(id: ScreenId) {
  const Screen = SCREEN_VIEWS[id];

  return <Screen />;
}
