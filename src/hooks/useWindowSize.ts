import { useSyncExternalStore } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

const SERVER_SIZE: WindowSize = { width: 1280, height: 800 };
let cached: WindowSize = SERVER_SIZE;

function subscribe(onChange: () => void): () => void {
  let frame = 0;
  const handler = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(onChange);
  };
  window.addEventListener('resize', handler, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', handler);
  };
}

function getSnapshot(): WindowSize {
  const { innerWidth: width, innerHeight: height } = window;
  // Return a stable reference unless dimensions actually changed.
  if (cached.width !== width || cached.height !== height) {
    cached = { width, height };
  }
  return cached;
}

export function useWindowSize(): WindowSize {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SIZE);
}

/** Tailwind's `lg` breakpoint. */
export function useIsDesktop(): boolean {
  return useWindowSize().width >= 1024;
}
