import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';
import QueuedUtterance from './QueuedUtterance';

class SpeechContext {
  constructor(ponyfill) {
    this.queueWithCurrent = [];

    this.cancel = this.cancel.bind(this);
    // this.cancelAll = this.cancelAll.bind(this);
    this.speak = this.speak.bind(this);

    this.setPonyfill(ponyfill);
  }

  setPonyfill({ speechSynthesis, SpeechSynthesisUtterance }) {
    this.ponyfill = { speechSynthesis, SpeechSynthesisUtterance };
  }

  async cancel(id) {
    const index = this.queueWithCurrent.findIndex(utterance => utterance.id === id);

    if (~index) {
      return this.queueWithCurrent[index].cancel();
    }
  }

  // async cancelAll() {
  //   // console.debug(`CANCELLING QUEUED ITEMS: ${ this.queueWithCurrent.length }`);

  //   // this.queueWithCurrent.forEach(entry => entry.cancelled = true);

  //   // const cancelAll = Promise.all(this.queueWithCurrent.map(({ deferred: { promise } }) => promise.catch(err => 0)));

  //   // this.ponyfill.speechSynthesis.cancel();

  //   // try {
  //   //   await cancelAll;
  //   // } catch (err) {}

  //   // console.debug(`ALL CANCELLED OR FINISHED`);
  // }

  speak(utteranceLike) {
    // console.debug(`QUEUED: ${ utteranceLike.text }`);

    if (
      utteranceLike.id
      && this.queueWithCurrent.find(({ id }) => id === utteranceLike.id)
    ) {
      // Do not queue duplicated speak with same unique ID
      // console.debug('NOT QUEUEING DUPE');

      return;
    }

    const utterance = new QueuedUtterance(utteranceLike);

    this.queueWithCurrent = [...this.queueWithCurrent, utterance];
    this._run();

    return utterance.promise;
  }

  async _run() {
    if (this._running) {
      return;
    }

    this._running = true;

    try {
      let utterance;

      while ((utterance = this.queueWithCurrent[0])) {
        try {
          await utterance.speak(this.ponyfill);
        } catch (err) {
          // TODO: If the error is due to Safari restriction on user touch
          //       The next loop on the next audio will also fail because it was not queued with a user touch

          console.error(err);
          // err.message !== 'cancelled' && console.error(err);
        }

        this.queueWithCurrent = this.queueWithCurrent.filter(target => target !== utterance);
      }
    } finally {
      this._running = false;
    }
  }
}

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
      context: new SpeechContext({
        speechSynthesis: props.speechSynthesis,
        SpeechSynthesisUtterance: props.speechSynthesisUtterance
      }),
      voices
    };
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    const changed = [
      'speechSynthesis',
      'speechSynthesisUtterance'
    ].some(name => nextProps[name] !== props[name]);

    if (changed) {
      if (props.speechSynthesis) {
        props.speechSynthesis.removeEventListener && props.speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
      }

      this.state.context.setPonyfill({
        speechSynthesis: nextProps.speechSynthesis,
        SpeechSynthesisUtterance: nextProps.speechSynthesisUtterance
      });

      let nextVoices = [];

      if (nextProps.speechSynthesis) {
        nextProps.speechSynthesis.addEventListener && nextProps.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
        nextVoices = nextProps.speechSynthesis.getVoices() || [];
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
