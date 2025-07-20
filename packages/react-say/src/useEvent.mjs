import useImmediateEffect from './useImmediateEffect.mjs';

export default function useEvent(target, name, listener, options) {
  useImmediateEffect(() => {
    const handler = event => listener && listener(event);

    target.addEventListener(name, handler, options);

    return () => {
      // It seems speechSynthesis.onvoiceschanged still fire after we called removeEventListener.
      // We are protecting this scenario by setting listener to falsy.
      listener = null;
      target.removeEventListener(name, handler, options);
    };
  }, [listener, name, options, target]);
}
