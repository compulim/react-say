import createDeferred from './createDeferred';

function createNativeUtterance(utteranceLike, ponyfill) {
  const { speechSynthesis, SpeechSynthesisUtterance } = ponyfill;
  const {
    lang,
    onBoundary,
    pitch,
    rate,
    text,
    voice,
    volume
  } = utteranceLike;
  const utterance = new SpeechSynthesisUtterance(text);
  let targetVoice;

  if (typeof voice === 'function') {
    targetVoice = voice.call(speechSynthesis, speechSynthesis.getVoices());
  } else {
    const { voiceURI } = voice || {};

    targetVoice = voiceURI && [].find.call([].slice.call(speechSynthesis.getVoices()), v => v.voiceURI === voiceURI);
  }

  // Edge will mute if "lang" is set to ""
  utterance.lang = lang || '';

  if (pitch || pitch === 0) {
    utterance.pitch = pitch;
  }

  if (rate || rate === 0) {
    utterance.rate = rate;
  }

  // Cognitive Services will error when "voice" is set to "null"
  // Edge will error when "voice" is set to "undefined"
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  if (volume || volume === 0) {
    utterance.volume = volume;
  }

  if (utterance.addEventListener && onBoundary) {
    utterance.addEventListener('boundary', onBoundary);

    // Since browser quirks, start/error/end events are emulated for best compatibility
  }

  return utterance;
}

async function speakUtterance(ponyfill, utteranceLike, startCallback) {
  const { speechSynthesis } = ponyfill;

  const utterance = createNativeUtterance(utteranceLike, ponyfill);
  const startDeferred = createDeferred();
  const errorDeferred = createDeferred();
  const endDeferred = createDeferred();

  utterance.addEventListener('end', endDeferred.resolve);
  utterance.addEventListener('error', errorDeferred.resolve);
  utterance.addEventListener('start', startDeferred.resolve);

  // if (speechSynthesis.speaking) {
  //   console.warn(`ASSERTION: speechSynthesis.speaking should not be truthy before we call speak`);
  // }

  speechSynthesis.speak(utterance);

  // await startDeferred.promise;

  const startEvent = await Promise.race([
    errorDeferred.promise,
    startDeferred.promise
  ]);

  if (startEvent.type === 'error') {
    throw startEvent.error;
  }

  // console.debug(`STARTED: ${ utterance.text }`);

  let finishedSpeaking;
  const endPromise = Promise.race([
    errorDeferred.promise,
    endDeferred.promise
  ]);

  startCallback && startCallback(async () => {
    if (!finishedSpeaking) {
      speechSynthesis.cancel();
      await endPromise;
    }
  });

  const endEvent = await endPromise;

  finishedSpeaking = true;

  // if (speechSynthesis.speaking) {
  //   console.warn(`ASSERTION: speechSynthesis.speaking should not be truthy after speak is stopped`);
  // }

  // console.debug(`ENDED: ${ utterance.text }`);

  if (endEvent.type === 'error') {
    throw endEvent.error;
  }
}

export default class QueuedUtterance {
  constructor(utteranceLike) {
    this._cancelled = false;
    this._deferred = createDeferred();
    this._ponyfill = null;
    this._speaking = false;
    this._utteranceLike = utteranceLike;

    this.id = utteranceLike.id;
    this.promise = this._deferred.promise;
  }

  async cancel() {
    this._cancelled = true;
    this._cancel && await this._cancel();
  }

  speak(ponyfill) {
    (async () => {
      if (this._cancelled) {
        throw new Error('cancelled');
      }

      await speakUtterance(ponyfill, this._utteranceLike, cancel => {
        if (this._cancelled) {
          cancel();
        } else {
          this._cancel = cancel;
          this._utteranceLike.onStart && this._utteranceLike.onStart(new Event('start'));
        }
      });
    })().then(() => {
      if (this._cancelled) {
        throw new Error('cancelled');
      }
    }).then(() => {
      this._utteranceLike.onEnd && this._utteranceLike.onEnd(new Event('end'));
      this._deferred.resolve();
    }, error => {
      const event = new Event('error');

      event.error = error;

      this._utteranceLike.onError && this._utteranceLike.onError(event);
      this._deferred.reject(error);
    });

    return this.promise;
  }
}
