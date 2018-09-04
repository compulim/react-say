import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';
import createDeferred from './createDeferred';
import retry from './retry';
import sleep from './sleep';
import spinWaitUntil from './spinWaitUntil';
import timeout from './timeout';

function createUtterance(utteranceLike, ponyfill) {
  const { SpeechSynthesisUtterance } = ponyfill;
  const {
    lang,
    pitch = 1,
    rate = 1,
    text,
    voice,
    volume = 1
  } = utteranceLike;
  const utterance = new SpeechSynthesisUtterance(text);
  let targetVoice;

  if (typeof voice === 'function') {
    targetVoice = voice.call(speechSynthesis, getSerializableVoices(speechSynthesis));
  } else {
    const { voiceURI } = voice || {};

    targetVoice = voiceURI && [].find.call([].slice.call(getSerializableVoices(speechSynthesis)), v => v.voiceURI === voiceURI);
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

  return utterance;
}

class SpeechContext {
  constructor(ponyfill) {
    this.current = null;
    this.queue = [];

    this.cancel = this.cancel.bind(this);
    this.speak = this.speak.bind(this);
    this._signalNextDeferred = null;

    this.setPonyfill(ponyfill);
    this._loop();
  }

  setPonyfill({ speechSynthesis, SpeechSynthesisUtterance }) {
    this.ponyfill = { speechSynthesis, SpeechSynthesisUtterance };
  }

  async cancel() {
    // console.debug(`CANCELLING QUEUED ITEMS: ${ this.queue.length }`);

    this.queue.forEach(entry => entry.cancelled = true);

    if (this.current) {
      this.current.cancelled = true;
    }

    const cancelAll = Promise.all(
      [
        this.current && this.current.deferred.promise,
        ...this.queue.map(({ deferred: { promise } }) => promise)
      ].map(promise => promise && promise.catch(err => 0))
    );

    this.ponyfill.speechSynthesis.cancel();

    try {
      await cancelAll;
    } catch (err) {}

    // console.debug(`ALL CANCELLED OR FINISHED`);
  }

  speak(utteranceLike) {
    const deferred = createDeferred();

    // console.debug(`QUEUED: ${ utteranceLike.text }`);

    if (
      utteranceLike.uniqueID
      && (
        (this.current && this.current.utteranceLike.uniqueID === utteranceLike.uniqueID)
        || this.queue.find(({ utteranceLike: { uniqueID } }) => utteranceLike.uniqueID === uniqueID)
      )
    ) {
      // Do not queue duplicated speak with same unique ID
      return;
    }

    this.queue.push({
      deferred,
      utteranceLike
    });

    this._signalNextDeferred && this._signalNextDeferred.resolve();

    return deferred.promise;
  }

  async _loop() {
    // TODO: Consider putting the loop back to "in-process"
    //       Because browsers may disable speech if not triggered from mouse click, need investigation
    for (;;) {
      const next = this.queue.shift();

      if (!next) {
        this._signalNextDeferred = createDeferred();

        await Promise.race([
          sleep(1000),
          this._signalNextDeferred.promise
        ]);

        continue;
      }

      this.current = next;

      const speakPromise = async () => {
        if (next.cancelled) {
          // console.debug(`CANCELLED BEFORE START: ${ next.utteranceLike.text }`);

          return;
        }

        const { ponyfill } = this;
        const { speechSynthesis } = ponyfill;
        const utterance = createUtterance(next.utteranceLike, ponyfill);
        const startDeferred = createDeferred();
        const errorDeferred = createDeferred();
        const endDeferred = createDeferred();

        utterance.addEventListener('end', endDeferred.resolve);
        utterance.addEventListener('error', errorDeferred.resolve);
        utterance.addEventListener('start', startDeferred.resolve);

        // if (speechSynthesis.speaking) {
        //   console.warn(`ASSERTION: speechSynthesis.speaking should not be truthy before we call speak`);
        // }

        // Chrome quirks:
        // 1. Speak an utterance
        // 2. Cancel in the midway
        // 3. Speak another utterance
        // Expected: speaking is falsy, then turn to truthy, then receive "start" event
        // Actual: speaking is falsy, then turn to truthy, but receive no "start" event

        // console.debug(`STARTING: ${ next.utteranceLike.text }`);

        ponyfill.speechSynthesis.speak(utterance);

        try {
          await Promise.race([
            startDeferred.promise,
            timeout(1000)
          ]);
        } catch (error) {
          speechSynthesis.cancel();
          throw error;
        }

        // if (!speechSynthesis.speaking) {
        //   console.warn(`ASSERTION: speechSynthesis.speaking should not be falsy after speak is started`);
        // }

        utterance.onStart && utterance.onStart(endEvent);

        // console.debug(`STARTED: ${ next.utteranceLike.text }`);

        const endEvent = await Promise.race([
          errorDeferred.promise,
          endDeferred.promise,
          spinWaitUntil(() => next.cancelled).then(() => ({ type: 'cancel' }), 100),
          spinWaitUntil(() => !speechSynthesis.speaking).then(() => sleep(500)).then(() => ({ type: 'end', artificial: true }))
        ]);

        if (endEvent.type === 'cancel') {
          speechSynthesis.cancel();

          return;
        }

        // if (speechSynthesis.speaking) {
        //   console.warn(`ASSERTION: speechSynthesis.speaking should not be truthy after speak is stopped`);
        // }

        // console.debug(`ENDED: ${ next.utteranceLike.text }`);

        if (endEvent.type === 'error') {
          utterance.onError && utterance.onError(endEvent);
        } else {
          utterance.onEnd && utterance.onEnd(endEvent);
        }
      };

      await retry(speakPromise, 3, 500).then(() => {
        next.utteranceLike.onEnd && next.utteranceLike.onEnd({ type: 'end' });
        next.deferred.resolve();
      }, error => {
        next.utteranceLike.onError && next.utteranceLike.onError({ type: 'error', error });
        next.deferred.reject(error);
      });
    }
  }
}

function getSerializableVoices(speechSynthesis) {
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

    props.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);

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
      voices: getSerializableVoices(props.speechSynthesis)
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
        props.speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
      }

      this.state.context.setPonyfill({
        speechSynthesis: nextProps.speechSynthesis,
        SpeechSynthesisUtterance: nextProps.speechSynthesisUtterance
      });

      if (nextProps.speechSynthesis) {
        nextProps.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
      }

      this.setState(() => ({ voices: getSerializableVoices(nextProps.speechSynthesis) }));
    }
  }

  componentWillUnmount() {
    const { speechSynthesis } = this.props;

    speechSynthesis && speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
  }

  handleVoicesChanged({ target }) {
    this.setState(() => ({ voices: getSerializableVoices(target) }));
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
