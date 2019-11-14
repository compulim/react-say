import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

import Composer from './Composer';
import Context from './Context';
import createNativeUtterance from './createNativeUtterance';
import migrateDeprecatedProps from './migrateDeprecatedProps';
import SayUtterance from './SayUtterance';

const Say = props => {
  const {
    lang,
    onBoundary,
    onEnd,
    onError,
    onStart,
    pitch,
    rate,
    speak,
    text,
    voice,
    volume
  } = migrateDeprecatedProps(props, Say);

  const { ponyfill } = useContext(Context);

  if (speak && !text) {
    console.warn('react-say: "speak" prop is being deprecated and renamed to "text".');
    text = speak;
  }

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
    <SayUtterance
      onEnd={ onEnd }
      onError={ onError }
      onStart={ onStart }
      ponyfill={ ponyfill }
      utterance={ utterance }
    />
  );
}

Say.defaultProps = {
  children: undefined,
  lang: undefined,
  onBoundary: undefined,
  onEnd: undefined,
  onError: undefined,
  onStart: undefined,
  pitch: undefined,
  rate: undefined,
  speak: undefined,
  voice: undefined,
  volume: undefined
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
  speak: PropTypes.string,
  text: PropTypes.string.isRequired,
  voice: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  volume: PropTypes.number
};

const SayWithContext = ({ ponyfill, ...props }) => (
  <Composer ponyfill={ ponyfill }>
    <Say {...props} />
  </Composer>
);

SayWithContext.defaultProps = {
  ...SayUtterance.defaultProps,
  ponyfill: undefined
};

SayWithContext.propTypes = {
  ...SayUtterance.propTypes,
  ponyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any.isRequired,
    SpeechSynthesisUtterance: PropTypes.any.isRequired
  })
};

export default SayWithContext
