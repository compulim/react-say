import PropTypes from 'prop-types';
import React from 'react';

export default class Say extends React.Component {
  componentDidMount() {
    this.say(this.props);
  }

  componentDidUpdate() {
    this.say(this.props);
  }

  shouldComponentUpdate(nextProps) {
    return true;
  }

  say({
    lang,
    pitch,
    rate,
    speechSynthesis,
    speechSynthesisUtterance,
    text,
    voice,
    volume
  }) {
    const utterance = new speechSynthesisUtterance(text);

    if (lang) {
      utterance.lang = lang;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;

    if (voice) {
      utterance.voice = voice;
    }

    utterance.volume = volume;
    utterance.onboundary = event => {
      console.log(event);
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  render() {
    const { props } = this;
    const { children } = props;

    return typeof children === 'function' ? children(props) : children;
  }
}

Say.defaultProps = {
  pitch: 1,
  rate: 1,
  speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
  speechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance,
  volume: 1
};

Say.propTypes = {
  lang: PropTypes.string,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any,
  voice: PropTypes.any,
  volume: PropTypes.number
};
