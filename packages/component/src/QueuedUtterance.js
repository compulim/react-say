import createCustomEvent from './createCustomEvent';
import createDeferred from './createDeferred';
import createErrorEvent from './createErrorEvent';

async function speakUtterance(ponyfill, utterance, startCallback) {
  const { speechSynthesis } = ponyfill;

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

  const startEvent = await Promise.race([
    errorDeferred.promise,
    startDeferred.promise
  ]);

  if (startEvent.type === 'error') {
    throw startEvent.error;
  }

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
  constructor(ponyfill, utterance, { onEnd, onError, onStart }) {
    this._cancelled = false;
    this._deferred = createDeferred();
    this._onEnd = onEnd;
    this._onError = onError;
    this._onStart = onStart;
    this._ponyfill = ponyfill;
    this._speaking = false;
    this._utterance = utterance;

    this.promise = this._deferred.promise;
  }

  async cancel() {
    this._cancelled = true;
    this._cancel && await this._cancel();
  }

  speak() {
    if (this._speaking) {
      console.warn(`ASSERTION: QueuedUtterance is already speaking or has spoken.`);
    }

    this._speaking = true;

    (async () => {
      if (this._cancelled) {
        throw new Error('cancelled');
      }

      await speakUtterance(this._ponyfill, this._utterance, cancel => {
        if (this._cancelled) {
          cancel();

          throw new Error('cancelled');
        } else {
          this._cancel = cancel;
          this._onStart && this._onStart(createCustomEvent('start'));
        }
      });

      if (this._cancelled) {
        throw new Error('cancelled');
      }
    })().then(() => {
      this._onEnd && this._onEnd(createCustomEvent('end'));
      this._deferred.resolve();
    }, error => {
      this._onError && this._onError(createErrorEvent(error));
      this._deferred.reject(error);
    });

    return this.promise;
  }
}
