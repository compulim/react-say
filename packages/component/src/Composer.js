import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';

function createContext({
  lang,
  pitch,
  rate,
  speechSynthesis,
  speechSynthesisUtterance,
  voiceURI,
  volume
}) {
  return {
    cancel: () => speechSynthesis.cancel(),
    speak: text => {
      const voice = [].find.call(speechSynthesis.getVoices(), v => v.voiceURI === voiceURI);
      const utterance = new speechSynthesisUtterance(text);

      utterance.lang = lang;
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.voice = voice;
      utterance.volume = volume;

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
      'lang',
      'pitch',
      'rate',
      'speechSynthesis',
      'speechSynthesisUtterance',
      'voiceURI',
      'volume'
    ].some(name => nextProps[name] !== props[name]);

    if (changed) {
      this.props.speechSynthesis.onvoiceschanged = null;
      this.state.context.cancel();

      nextProps.speechSynthesis.onvoiceschanged = this.handleVoicesChanged;

      this.setState(({ context }) => {
        context.cancel();

        return {
          context: createContext(nextProps)
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
  pitch: 1,
  rate: 1,
  speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
  speechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance,
  volume: 1
};

Composer.propTypes = {
  lang: PropTypes.string,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any,
  voice: PropTypes.any,
  volume: PropTypes.number
};
