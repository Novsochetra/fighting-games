import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { ArcadeProvider, type Arcade } from './services/arcade-context';
import { ScreenStack } from './navigation/stack/ScreenStack';
import type { ScreenId } from './navigation/routes/screens';
import './navigation/stack/stack.css';

// The catalog and the supporters change rarely: a screen shown again uses what it read, and reads
// again in the background after a minute. A failed read says so at once and offers Try again.
function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: false, refetchOnWindowFocus: false } },
  });
}

export interface AppProps {
  arcade: Arcade;
  // the arcade's own path, as the page it opened at gives it (arcadeRoot)
  basename: string;
  renderScreen: (id: ScreenId) => ReactNode;
}

export function App({ arcade, basename, renderScreen }: AppProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ArcadeProvider arcade={arcade}>
        <BrowserRouter basename={basename}>
          <ScreenStack renderScreen={renderScreen} />
        </BrowserRouter>
      </ArcadeProvider>
    </QueryClientProvider>
  );
}
