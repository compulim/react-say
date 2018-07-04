import PropTypes from 'prop-types';
import React from 'react';

import Composer from './Composer';
import Say from './Say';

const BasicSay = props =>
  <Composer
    lang={ props.lang }
    pitch={ props.pitch }
    rate={ props.rate }
    speechSynthesis={ props.speechSynthesis }
    speechSynthesisUtterance={ props.speechSynthesisUtterance }
    voice={ props.voice }
    volume={ props.volume }
  >
    <Say text={ props.text }>
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
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any,
  text: PropTypes.string,
  voice: PropTypes.any,
  volume: PropTypes.number
};

export default BasicSay
