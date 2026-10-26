import { CreditsScreen } from '../credits/CreditsScreen';
import { HomeScreen } from '../home/HomeScreen';
import { SupportersScreen } from '../supporters/SupportersScreen';
import type { ScreenId } from './screens';

export function renderScreen(id: ScreenId) {
  if (id === 'supporters') {
    return <SupportersScreen />;
  }

  return id === 'credits' ? <CreditsScreen /> : <HomeScreen />;
}
