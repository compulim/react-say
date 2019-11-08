import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';

import Context from './Context';
import createSynthesize from './createSynthesize';
import useEvent from './useEvent';

const Composer = ({ children, ponyfill }) => {
  // If we have the parent context, we will use that synthesize() function and its internal queue.
  const { ponyfill: parentPonyfill, synthesize: parentSynthesize } = useContext(Context) || {};

  ponyfill = ponyfill || parentPonyfill || {
    speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance,
  };

  // If the parent context changed and no longer has a synthesize() function, we will create the queue.
  // This is very unlikely to happen.
  const synthesize = useMemo(() => parentSynthesize || createSynthesize(), [parentSynthesize]);
  const { speechSynthesis } = ponyfill;
  const [voices, setVoices] = useState(speechSynthesis.getVoices());

  useEvent(speechSynthesis, 'voiceschanged', () => setVoices(speechSynthesis.getVoices()));

  const context = useMemo(() => ({
    ponyfill,
    synthesize,
    voices
  }), [ponyfill, synthesize, voices]);

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
  ponyfill: undefined
};

Composer.propTypes = {
  children: PropTypes.any,
  ponyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any,
    SpeechSynthesisUtterance: PropTypes.any
  })
};

export default Composer;
