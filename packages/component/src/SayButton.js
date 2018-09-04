import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';

const SayButton = props =>
  <Context.Consumer
    speechSynthesis={ props.speechSynthesis }
    speechSynthesisUtterance={ props.speechSynthesisUtterance }
  >
    { context =>
      <button onClick={ event => {
        context.cancel();
        context.speak({
          lang: props.lang,
          onBoundary: props.onBoundary,
          onEnd: props.onEnd,
          onError: props.onError,
          onStart: props.onStart,
          pitch: props.pitch,
          rate: props.rate,
          text: props.speak,
          voice: props.voice,
          volume: props.volume
        });

        props.onClick && props.onClick(event);
      } }>
        { props.children }
      </button>
    }
  </Context.Consumer>

SayButton.propTypes = {
  exclusive: PropTypes.bool,
  lang: PropTypes.string,
  onBoundary: PropTypes.func,
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speak: PropTypes.string,
  voice: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  volume: PropTypes.number
};

export default SayButton;
