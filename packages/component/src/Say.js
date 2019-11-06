import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Composer from './Composer';
import createNativeUtterance from './createNativeUtterance';
import SayUtterance from './SayUtterance';

const Say = ({
  children,
  lang,
  onBoundary,
  onEnd,
  onError,
  onStart,
  pitch,
  ponyfill,
  rate,
  speak: text,
  voice,
  volume
}) => {
  const utterance = useMemo(() =>
    createNativeUtterance(
      ponyfill,
      {
        lang,
        onBoundary,
        pitch,
        rate,
        text,
        voice,
        volume
      }
    ),
    [
      children,
      lang,
      onBoundary,
      pitch,
      ponyfill,
      rate,
      text,
      voice,
      volume
    ]
  );

  return (
    <Composer ponyfill={ ponyfill }>
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
  ponyfill: {
    speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
  }
};

Say.propTypes = {
  children: PropTypes.any,
  lang: PropTypes.string,
  onBoundary: PropTypes.func,
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  pitch: PropTypes.number,
  ponyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any,
    speechSynthesisUtterance: PropTypes.any
  }),
  rate: PropTypes.number,
  speak: PropTypes.string,
  voice: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  volume: PropTypes.number
};

export default Say
