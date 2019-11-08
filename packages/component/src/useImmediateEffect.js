import { useEffect, useRef } from 'react';

export default function useImmediateEffect(fn, deps) {
  const unsubscribeRef = useRef({
    first: true,
    id: Math.random().toString(36).substr(2, 5),
    unsubscribe: fn()
  });

  useEffect(() => {
    const { current } = unsubscribeRef;

    if (!current.first) {
      current.unsubscribe = fn();
    } else {
      current.first = false;
    }

    return () => {
      current.unsubscribe && current.unsubscribe();
      current.unsubscribe = null;
    };
  }, deps);
}
