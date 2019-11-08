import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import useSynthesize from './useSynthesize';
import createErrorEvent from './createErrorEvent';

const SayUtterance = ({
  onEnd,
  onError,
  onStart,
  utterance
}) => {
  const started = useRef(false);
  const synthesize = useSynthesize();

  // This useEffect() is essentially converting Promise-based useSynthesize() into events.
  useEffect(() => {
    // After synthesis started, if utterance has changed, the event will be fired by the wrong target.
    // Thus, we do not allow utterance to change after synthesis started.
    if (started.current) {
      // Since we have already cancelled the previous utterance, we are not starting a new one.
      // This is because if we start a new one, we could fire onStart event twice, which sound confusing to the developer.

      return console.warn('react-say: Should not change utterance after synthesis started.');
    }

    let cancelled;
    const { cancel, promise } = synthesize(utterance, () => {
      started.current = true;
      !cancelled && onStart && onStart(new Event('start'));
    });

    promise.then(
      () => !cancelled && onEnd && onEnd(new Event('end')),
      error => !cancelled && onError && onError(createErrorEvent(error))
    );

    return () => {
      cancelled = true;
      cancel();
    };
  }, []);

  return false;
};

SayUtterance.defaultProps = {
  onEnd: undefined,
  onError: undefined,
  onStart: undefined,
  ponyfill: {
    speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
  }
};

SayUtterance.propTypes = {
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  utterance: PropTypes.any
};

export default SayUtterance
