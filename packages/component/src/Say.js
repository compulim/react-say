import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Composer from './Composer';
import createNativeUtterance from './createNativeUtterance';
import SayUtterance from './SayUtterance';

const Say = ({
  speechSynthesis,
  speechSynthesisUtterance: SpeechSynthesisUtterance,
  children,
  lang,
  onBoundary,
  onEnd,
  onError,
  onStart,
  pitch,
  rate,
  speak: text,
  voice,
  volume
}) => {
  const utterance = useMemo(() => createNativeUtterance({
    speechSynthesis,
    SpeechSynthesisUtterance
  }, {
    lang,
    onBoundary,
    pitch,
    rate,
    text,
    voice,
    volume
  }), [
    children,
    lang,
    onBoundary,
    pitch,
    rate,
    speechSynthesis,
    SpeechSynthesisUtterance,
    text,
    voice,
    volume
  ]);

  return (
    <Composer
      speechSynthesis={ speechSynthesis }
      speechSynthesisUtterance={ SpeechSynthesisUtterance }
    >
      <SayUtterance
        onEnd={ onEnd }
        onError={ onError }
        onStart={ onStart }
        utterance={ utterance }
      />
      { children }
    </Composer>
  );
}

Say.defaultProps = {
  speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
  speechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
};

Say.propTypes = {
  children: PropTypes.any,
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
