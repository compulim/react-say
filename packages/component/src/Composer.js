import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';

import Context from './Context';
import createSpeak from './createSpeak';
import useEvent from './useEvent';

const Composer = ({ children, ponyfill }) => {
  const { speechSynthesis } = ponyfill;

  // If we have the parent context, we will use that speak() function and its internal queue.
  const { speak: parentSpeak } = useContext(Context) || {};

  // If the parent context changed and no longer has a speak() function, we will create the queue.
  // This is very unlikely to happen.
  const speak = useMemo(() => parentSpeak || createSpeak(), [parentSpeak]);
  const [voices, setVoices] = useState(speechSynthesis.getVoices());

  useEvent(speechSynthesis, 'voiceschanged', () => setVoices(speechSynthesis.getVoices()));

  const context = useMemo(() => ({
    ponyfill,
    speak,
    voices
  }), [ponyfill, speak, voices]);

  return (
    <Context.Provider value={ context }>
      {
        typeof children === 'function' ?
          <Context.Consumer>
            { context => children(context) }
          </Context.Consumer>
        :
          children
      }
    </Context.Provider>
  );
};

Composer.defaultProps = {
  children: undefined,
  ponyfill: {
    speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
  }
};

Composer.propTypes = {
  children: PropTypes.any,
  ponyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any,
    SpeechSynthesisUtterance: PropTypes.any
  })
};

export default Composer;
