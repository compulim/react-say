import PropTypes from 'prop-types';
import React from 'react';

import Composer from './Composer';
import SayPrimitive from './SayPrimitive';

const Say = props =>
  <Composer
    speechSynthesis={ props.speechSynthesis }
    speechSynthesisUtterance={ props.speechSynthesisUtterance }
  >
    <SayPrimitive
      lang={ props.lang }
      onBoundary={ props.onBoundary }
      onEnd={ props.onEnd }
      onError={ props.onError }
      onStart={ props.onStart }
      pitch={ props.pitch }
      rate={ props.rate }
      speak={ props.speak }
      voice={ props.voice }
      volume={ props.volume }
    >
      { props.children }
    </SayPrimitive>
  </Composer>

Say.defaultProps = {
  speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
  speechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
};

Say.propTypes = {
  lang: PropTypes.string,
  onBoundary: PropTypes.func,
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any,
  speak: PropTypes.string,
  voice: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  volume: PropTypes.number
};

export default Say
