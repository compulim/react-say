// import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';

import Context from './Context';
import createSpeechContext from './createContext';
import useEvent from './useEvent';

const SingletonComposer = ({ children, ...props }) => (
  <Context.Consumer>
    {
      context => context ?
        typeof children === 'function' ? children(context) : children
      :
        <Composer {...props}>{ children }</Composer>
    }
  </Context.Consumer>
);

const Composer = ({ children, ponyfill }) => {
  const { speechSynthesis } = ponyfill;

  const [context] = useState(() => createSpeechContext(ponyfill));
  const [voices, setVoices] = useState(speechSynthesis.getVoices());

  useEffect(() => context.setPonyfill(ponyfill), [ponyfill]);
  useEvent(speechSynthesis, 'voiceschanged', () => setVoices(speechSynthesis.getVoices()));

  const contextWithVoices = useMemo(() => ({
    ...context,
    voices
  }), [context, voices]);

  return (
    <Context.Provider value={ contextWithVoices }>
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
  ponyfill: {
    speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
  }
};

Composer.propTypes = {
  ponyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any,
    SpeechSynthesisUtterance: PropTypes.any
  })
};

export default SingletonComposer;
