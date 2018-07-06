import PropTypes from 'prop-types';
import React from 'react';

import Composer from './Composer';
import Say from './Say';

const BasicSay = props =>
  <Composer
    speechSynthesis={ props.speechSynthesis }
    speechSynthesisUtterance={ props.speechSynthesisUtterance }
  >
    <Say
      lang={ props.lang }
      onBoundary={ props.onBoundary }
      onEnd={ props.onEnd }
      onError={ props.onError }
      onStart={ props.onStart }
      pitch={ props.pitch }
      rate={ props.rate }
      text={ props.text }
      voice={ props.voice }
      volume={ props.volume }
    >
      { props.children }
    </Say>
  </Composer>

BasicSay.defaultProps = {
  pitch: 1,
  rate: 1,
  speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
  speechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance,
  volume: 1
};

BasicSay.propTypes = {
  lang: PropTypes.string,
  onBoundary: PropTypes.func,
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any,
  text: PropTypes.string,
  voice: PropTypes.any,
  volume: PropTypes.number
};

export default BasicSay
