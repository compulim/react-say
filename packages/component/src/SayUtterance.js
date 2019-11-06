import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';

import Context from './Context';

const SayUtterance = ({
  onEnd,
  onError,
  onStart,
  utterance
}) => {
  const context = useContext(Context);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // After synthesis started, if utterance is changed, the event will be fired for wrong target.
    // Thus, we do not allow utterance to change after synthesis started.
    if (started) {
      // throw new Error('Cannot change utterance after synthesis started.');
      console.warn('react-say: Should not change utterance after synthesis started.');
    }

    let cancelled;
    const id = Date.now() + Math.random();

    context.speak(
      id,
      utterance,
      {
        onEnd: event => {
          !cancelled && onEnd && onEnd(event);
        },
        onError: event => {
          if (!cancelled) {
            onError && onError(event);
            setStarted(true);
          }
        },
        onStart: event => {
          if (!cancelled) {
            onStart && onStart(event);
            setStarted(true);
          }
        }
      }
    );

    return () => {
      cancelled = true;
      context.cancel(id);
    };
  }, [context, setStarted, utterance]);

  return false;
};

SayUtterance.propTypes = {
  utterance: PropTypes.any
};

export default SayUtterance
