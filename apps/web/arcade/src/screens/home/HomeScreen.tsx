import { useRef, type ReactNode } from 'react';
import { LayoutSwap } from '@/components/layout-swap/LayoutSwap';
import { Banners } from './banners/Banners';
import { Coffee } from './coffee/Coffee';
import { DetailsSheet } from './details/DetailsSheet';
import { Hero } from './hero/Hero';
import { HomeContext, useHomeState } from './home-context';
import { Library } from './library/Library';
import { RemoveSaveSheet } from './offline-saves/RemoveSaveSheet';
import { TopBar } from './top-bar/TopBar';
import { useHomeInputs } from './inputs/use-home-inputs';
import './home-styles';

// The keys, the pad and the way back from a game, for the arcade inside the home's state.
function Inputs({ children }: { children: ReactNode }) {
  useHomeInputs();

  return children;
}

// The arcade: the carousel of games with the selected one's art behind it, then the library. The
// banners, the coffee button and the sheets float over it.
export function HomeScreen() {
  const homeRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLElement>(null);
  const home = useHomeState(homeRef);
  // the stage fades in on its own (stage-enter in hero.css), so only the notice and the library swap
  const blocks = () => [noticeRef.current!, libraryRef.current!];

  return (
    <HomeContext value={home}>
      <Inputs>
        <LayoutSwap phase={home.phase} blocks={blocks}>
          <div className="home" id="home" ref={homeRef}>
            <TopBar />
            <Hero noticeRef={noticeRef} />
            <Library libraryRef={libraryRef} />
          </div>
        </LayoutSwap>
        <Banners />
        <Coffee />
        <DetailsSheet details={home.details} />
        <RemoveSaveSheet />
      </Inputs>
    </HomeContext>
  );
}
