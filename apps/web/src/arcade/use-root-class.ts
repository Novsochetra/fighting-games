import { useLayoutEffect } from 'react';
import { useArcade } from './arcade-context';

// A class on the page's root while on holds, for styles beyond the screen that sets it.
export function useRootClass(name: string, on: boolean) {
  const { window } = useArcade();

  useLayoutEffect(() => {
    const { classList } = window.document.documentElement;

    classList.toggle(name, on);

    return () => classList.remove(name);
  }, [window, name, on]);
}
