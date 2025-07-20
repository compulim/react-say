import { useContext } from 'react';

import Context from './Context.mjs';
import createNativeUtterance from './createNativeUtterance.mjs';

export default function useSynthesize() {
  const { ponyfill, synthesize } = useContext(Context);

  return (utteranceOrText, progressFn) => {
    if (typeof utteranceOrText === 'string') {
      utteranceOrText = createNativeUtterance(ponyfill, { text: utteranceOrText });
    }

    return synthesize(ponyfill, utteranceOrText, { onStart: progressFn && (() => progressFn()) });
  };
}
