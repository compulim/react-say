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
    onBoundary,
    onEnd,
    onError,
    onStart,
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

  if (utterance.addEventListener) {
    utterance.addEventListener('boundary', onBoundary);
    utterance.addEventListener('end', onEnd);
    utterance.addEventListener('error', onError);
    utterance.addEventListener('start', onStart);
  }

  return utterance;
}

async function speakUtterance({ speechSynthesis }, { reject, resolve, utterance }) {
  try {
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
    // Expected: speaking is falsy, then turn to truthy, then receive "start" event, and audio played
    // Actual: speaking is falsy, then turn to truthy (which is wrong), but receive no "start" event, and no audio played
    // Workaround: retry 2 times with a second

    // Safari quirks:
    // - Audio doesn't play if the speech is started from a user event
    // - If no audio is played, the "start" event won't fire

    // console.debug(`STARTING: ${ utterance.text }`);

    await retry(async () => {
      speechSynthesis.speak(utterance);

      try {
        await Promise.race([
          startDeferred.promise,
          timeout(1000)
        ]);
      } catch (error) {
        // This is required for Chrome quirks.
        // Chrome doesn't know it can't start speech, and it just wait there forever.
        // We need to cancel it out.
        speechSynthesis.cancel();

        throw error;
      }
    }, 2, 0);

    // console.debug(`STARTED: ${ utterance.text }`);

    const endEvent = await Promise.race([
      errorDeferred.promise,
      endDeferred.promise,
      spinWaitUntil(() => !speechSynthesis.speaking).then(() => sleep(500)).then(() => ({ type: 'end', artificial: true }))
    ]);

    // if (speechSynthesis.speaking) {
    //   console.warn(`ASSERTION: speechSynthesis.speaking should not be truthy after speak is stopped`);
    // }

    // console.debug(`ENDED: ${ next.utteranceLike.text }`);

    switch (endEvent.type) {
      case 'cancel':
        speechSynthesis.cancel();
        throw new Error('cancelled');

      case 'error':
        throw endEvent.error;
    }

    return resolve();
  } catch (error) {
    return reject(error);
  }
}

class SpeechContext {
  constructor(ponyfill) {
    this.queueWithCurrent = [];

    this.cancel = this.cancel.bind(this);
    this.speak = this.speak.bind(this);

    this.setPonyfill(ponyfill);
  }

  setPonyfill({ speechSynthesis, SpeechSynthesisUtterance }) {
    this.ponyfill = { speechSynthesis, SpeechSynthesisUtterance };
  }

  async cancel() {
    console.debug(`CANCELLING QUEUED ITEMS: ${ this.queueWithCurrent.length }`);

    this.queueWithCurrent.forEach(entry => entry.cancelled = true);

    const cancelAll = Promise.all(this.queueWithCurrent.map(({ deferred: { promise } }) => promise.catch(err => 0)));

    this.ponyfill.speechSynthesis.cancel();

    try {
      await cancelAll;
    } catch (err) {}

    console.debug(`ALL CANCELLED OR FINISHED`);
  }

  speak(utteranceLike) {
    const deferred = createDeferred();

    // console.debug(`QUEUED: ${ utteranceLike.text }`);

    if (
      utteranceLike.uniqueID
      && this.queueWithCurrent.find(({ utteranceLike: { uniqueID } }) => utteranceLike.uniqueID === uniqueID)
    ) {
      // Do not queue duplicated speak with same unique ID
      return;
    }

    this.queueWithCurrent.push({
      deferred,
      utteranceLike
    });

    if (this.queueWithCurrent.length === 1) {
      this._next();
    }

    return deferred.promise;
  }

  _next() {
    const entry = this.queueWithCurrent[0];

    if (!entry) { return; }

    entry.deferred.promise.then(() => {
      this.queueWithCurrent.shift();
      this._next();
    }, () => {
      // TODO: If the error is due to Safari restriction on user touch
      //       The next loop on the next audio will also fail because it was not queued with a user touch
      this.queueWithCurrent.shift();
      this._next();
    });

    if (entry.cancelled) {
      // console.debug(`CANCELLED BEFORE PLAY: ${ entry.utteranceLike.text }`);

      return entry.deferred.reject(new Error('cancelled'));
    }

    const utterance = createUtterance(entry.utteranceLike, this.ponyfill);

    speakUtterance(this.ponyfill, {
      reject: entry.deferred.reject,
      resolve: entry.deferred.resolve,
      utterance
    });
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

    props.speechSynthesis.addEventListener && props.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);

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
        props.speechSynthesis.removeEventListener && props.speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
      }

      this.state.context.setPonyfill({
        speechSynthesis: nextProps.speechSynthesis,
        SpeechSynthesisUtterance: nextProps.speechSynthesisUtterance
      });

      if (nextProps.speechSynthesis) {
        nextProps.speechSynthesis.addEventListener && nextProps.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
      }

      this.setState(() => ({ voices: getSerializableVoices(nextProps.speechSynthesis) }));
    }
  }

  componentWillUnmount() {
    const { speechSynthesis } = this.props;

    speechSynthesis && speechSynthesis.removeEventListener && speechSynthesis.removeEventListener('voiceschanged', this.handleVoicesChanged);
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
