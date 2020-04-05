import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import Composer from './Composer';
import createCustomEvent from './createCustomEvent';
import createErrorEvent from './createErrorEvent';
import migrateDeprecatedProps from './migrateDeprecatedProps';
import useSynthesize from './useSynthesize';

const SayUtterance = props => {
  const {
    onEnd,
    onError,
    onStart,
    utterance
  } = migrateDeprecatedProps(props);

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
      !cancelled && onStart && onStart(createCustomEvent('start'));
    });

    promise.then(
      () => !cancelled && onEnd && onEnd(createCustomEvent('end')),
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
  onStart: undefined
};

SayUtterance.propTypes = {
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func
};

const SayUtteranceWithContext = ({ ponyfill, ...props }) => (
  <Composer ponyfill={ ponyfill }>
    <SayUtterance { ...props } />
  </Composer>
);

SayUtteranceWithContext.defaultProps = {
  ...SayUtterance.defaultProps,
  ponyfill: undefined
};

SayUtteranceWithContext.propTypes = {
  ...SayUtterance.propTypes,
  ponyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any.isRequired,
    SpeechSynthesisUtterance: PropTypes.any.isRequired
  })
};

export default SayUtteranceWithContext
