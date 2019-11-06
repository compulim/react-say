import useImmediateEffect from './useImmediateEffect';

export default function useEvent(target, name, listener, options) {
  useImmediateEffect(() => {
    target.addEventListener(name, listener, options);

    return () => target.removeEventListener(name, listener, options);
  }, [listener, name, options, target]);
}
