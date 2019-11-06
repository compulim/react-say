import { useEffect, useRef } from 'react';

export default function useImmediateEffect(fn, deps) {
  const unsubscribeRef = useRef({
    first: true,
    unsubscribe: fn()
  });

  useEffect(() => {
    const { current } = unsubscribeRef;

    if (!current.first) {
      current.first = false;
      current.unsubscribe = fn();
    }

    return () => {
      current.unsubscribe && current.unsubscribe();
    };
  }, deps);
}
