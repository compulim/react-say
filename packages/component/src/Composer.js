import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';

function createContext({
  speechSynthesis,
  speechSynthesisUtterance
}) {
  return {
    cancel: () => speechSynthesis.cancel(),
    speak: ({
      lang,
      onBoundary,
      onEnd,
      onError,
      onStart,
      pitch = 1,
      rate = 1,
      text,
      voice,
      volume = 1
    }) => {
      const utterance = new speechSynthesisUtterance(text);
      let targetVoice;

      if (typeof voice === 'function') {
        targetVoice = voice.call(speechSynthesis, speechSynthesis.getVoices());
      } else {
        const { voiceURI } = voice || {};

        targetVoice = voiceURI && [].find.call([].slice.call(speechSynthesis.getVoices()), v => v.voiceURI === voiceURI);
      }

      // Edge will mute if "lang" is set to ""
      utterance.lang = lang || '';

      if (utterance.pitch || utterance.pitch === 0) {
        utterance.pitch = pitch;
      }

      if (utterance.rate || utterance.rate === 0) {
        utterance.rate = rate;
      }

      // Cognitive Services will error when "voice" is set to "null"
      // Edge will error when "voice" is set to "undefined"
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      if (utterance.volume || utterance.volume === 0) {
        utterance.volume = volume;
      }

      utterance.onboundary = onBoundary;
      utterance.onend = onEnd;
      utterance.onerror = onError;
      utterance.onstart = onStart;

      speechSynthesis.speak(utterance);
    }
  };
}

function getVoices(speechSynthesis) {
  return speechSynthesis.getVoices().map(({
    'default': def,
    lang,
    localService,
    name,
    voiceURI
  }) => ({
    'default': def,
    lang,
    localService,
    name,
    voiceURI
  }));
}

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.handleVoicesChanged = this.handleVoicesChanged.bind(this);

    props.speechSynthesis.onvoiceschanged = this.handleVoicesChanged;

    this.mergeContext = memoize((context, voices) => ({ ...context, voices }));

    this.state = {
      context: createContext(props),
      voices: getVoices(props.speechSynthesis)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    const changed = [
      'speechSynthesis',
      'speechSynthesisUtterance'
    ].some(name => nextProps[name] !== props[name]);

    if (changed) {
      this.props.speechSynthesis.onvoiceschanged = null;
      this.state.context.cancel();

      nextProps.speechSynthesis.onvoiceschanged = this.handleVoicesChanged;

      this.setState(({ context }) => {
        context.cancel();

        return {
          context: createContext(nextProps),
          voices: getVoices(nextProps.speechSynthesis)
        };
      });
    }
  }

  handleVoicesChanged({ target }) {
    const voices = getVoices(target);

    this.setState(() => ({ voices }));
  }

  render() {
    const { props, state } = this;
    const { children } = props;

    return (
      <Context.Provider value={ this.mergeContext(state.context, state.voices) }>
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
  }
}

Composer.defaultProps = {
  speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
  speechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
};

Composer.propTypes = {
  lang: PropTypes.string,
  onBoundary: PropTypes.func,
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  text: PropTypes.string,
  voice: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  volume: PropTypes.number,
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any
};
