import { useContext } from 'react';

import Context from './Context';
import createNativeUtterance from './createNativeUtterance';

export default function useSynthesize() {
  const { ponyfill, synthesize } = useContext(Context);

  return (utteranceOrText, progressFn) => {
    if (typeof utteranceOrText === 'string') {
      utteranceOrText = createNativeUtterance(ponyfill, { text: utteranceOrText });
    }

    synthesize(ponyfill, utterance, { onStart: progressFn && (() => progressFn()) });
  };
}
