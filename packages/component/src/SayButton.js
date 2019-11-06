import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import Say from './Say';

const SayButton = ({
  children,
  disabled,
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
  const [busy, setBusy] = useState(false);
  const handleClick = useCallback(() => setBusy(true));
  const sayProps = {
    lang,
    onBoundary,
    onEnd: event => {
      setBusy(false);
      onEnd && onEnd(event);
    },
    onError,
    onStart,
    pitch,
    ponyfill,
    rate,
    text,
    voice,
    volume
  };

  return (
    <React.Fragment>
      <button
        disabled={ typeof disabled === 'boolean' ? disabled : busy }
        onClick={ handleClick }
      >
        { children }
      </button>
      { busy && <Say { ...sayProps } /> }
    </React.Fragment>
  );
};

SayButton.propTypes = {
  children: PropTypes.any,
  disabled: PropTypes.bool,
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

export default SayButton
