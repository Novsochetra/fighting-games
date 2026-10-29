import { useEffect, useEffectEvent } from 'react';
import { useArcade } from '../arcade/arcade-context';

// The arcade's first page, an installed arcade's first open among them, loads before its worker has
// taken it over, and until then nothing answers what only the worker knows (a game's save). It runs
// this once the worker takes the page over as its install ends, and as each new build's does.
export function useWorkerTakeover(onTakeover: () => void) {
  const { workers } = useArcade();
  const takenOver = useEffectEvent(onTakeover);

  useEffect(() => {
    const onControllerChange = () => takenOver();

    workers?.addEventListener('controllerchange', onControllerChange);

    return () => workers?.removeEventListener('controllerchange', onControllerChange);
  }, [workers]);
}
