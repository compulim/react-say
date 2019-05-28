import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';
import createSpeechContext from './createContext';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.handleVoicesChanged = this.handleVoicesChanged.bind(this);

    let voices = [];

    if (props.speechSynthesis) {
      props.speechSynthesis.addEventListener && props.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
      voices = props.speechSynthesis.getVoices();
    }

    this.mergeContext = memoize(({ cancel, speak }, voices) => ({
      cancel,
      speak,
      voices
    }));

    this.state = {
      context: createSpeechContext({
        speechSynthesis: props.speechSynthesis,
        SpeechSynthesisUtterance: props.speechSynthesisUtterance
      }),
      voices
    };
  }

  componentWillReceiveProps(nextProps) {
    const {
      props
    } = this;

    const changed = [
      'speechSynthesis',
      'speechSynthesisUtterance'
    ].some(name => nextProps[name] !== props[name]);

    if (changed) {
      const { speechSynthesis } = props;
      const { speechSynthesis: nextSpeechSynthesis } = nextProps;
      let nextVoices = [];

      if (speechSynthesis && speechSynthesis.removeEventListener) {
        speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
      }

      this.state.context.setPonyfill({
        speechSynthesis: nextProps.speechSynthesis,
        SpeechSynthesisUtterance: nextProps.speechSynthesisUtterance
      });

      if (nextSpeechSynthesis) {
        nextSpeechSynthesis.addEventListener && nextSpeechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
        nextVoices = nextSpeechSynthesis.getVoices() || [];
      }

      this.setState(() => ({ voices: nextVoices }));
    }
  }

  componentWillUnmount() {
    const { speechSynthesis } = this.props;

    speechSynthesis && speechSynthesis.removeEventListener && speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
  }

  handleVoicesChanged({ target }) {
    this.setState(() => ({ voices: target.getVoices() }));
  }

  render() {
    const { props, state } = this;
    const { children } = props;

    return (
      <Context.Consumer>
        { context => context ?
            typeof children === 'function' ? children(context) : children
          :
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
        }
      </Context.Consumer>
    );
  }
}

Composer.defaultProps = {
  speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
  speechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
};

Composer.propTypes = {
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any
};
