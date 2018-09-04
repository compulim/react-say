import createDeferred from './createDeferred';
import retry from './retry';
import sleep from './sleep';
import spinWaitUntil from './spinWaitUntil';
import timeout from './timeout';

function createNativeUtterance(utteranceLike, ponyfill) {
  const { speechSynthesis, SpeechSynthesisUtterance } = ponyfill;
  const {
    lang,
    onBoundary,
    pitch = 1,
    rate = 1,
    text,
    voice,
    volume = 1
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
    if (onBoundary) {
      utterance.addEventListener('boundary', onBoundary);
    }

    // Since browser quirks, start/error/end events are emulated for best compatibility
  }

  return utterance;
}

export default class Utterance {
  constructor(utteranceLike) {
    this.cancelled = false;
    this.deferred = createDeferred();
    this.id = utteranceLike.id;
    this.speaking = false;
    this.utteranceLike = utteranceLike;
  }

  cancel() {
    this.cancelled = true;

    this.speaking && this.ponyfill.speechSynthesis.cancel();

    return this.deferred.promise;
  }

  speak(ponyfill) {
    this._speak(ponyfill).then(() => {
      this.utteranceLike.onEnd && this.utteranceLike.onEnd({ type: 'end' });
      this.deferred.resolve();
    }, error => {
      this.utteranceLike.onError && this.utteranceLike.onError({ type: 'error', error });
      this.deferred.reject(error);
    });

    return this.deferred.promise;
  }

  async _speak(ponyfill) {
    if (this.cancelled) {
      throw new Error('cancelled');
    }

    this.ponyfill = ponyfill;

    const { speechSynthesis } = ponyfill;

    const utterance = createNativeUtterance(this.utteranceLike, ponyfill);
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

    // For Chrome quirks, we need a custom queue, because we need to definitely know when to expect a "start" event.
    // If we don't have a queue, the "start" event could be happening long time later because it's still pending in the queue.

    // But with the custom queue, the first item might be started from non-user event. That means in Safari, the first item is muted.
    // And after the first fail, the custom queue will play the second item from a non-user event code path. That means, all subsequent
    // items are blocked until Safari has the very first item queued from user event.

    // console.debug(`STARTING: ${ utterance.text }`);

    this.speaking = true;

    await retry(async () => {
      if (this.cancelled) {
        throw new Error('cancelled');
      }

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

    utterance.onStart && utterance.onStart({ type: 'start' });

    const endEvent = await Promise.race([
      errorDeferred.promise,
      endDeferred.promise,
      spinWaitUntil(() => !speechSynthesis.speaking).then(() => sleep(500)).then(() => ({ type: 'end', artificial: true }))
    ]);

    // if (speechSynthesis.speaking) {
    //   console.warn(`ASSERTION: speechSynthesis.speaking should not be truthy after speak is stopped`);
    // }

    // console.debug(`ENDED: ${ utterance.text }`);

    this.speaking = false;

    if (endEvent.type === 'error') {
      throw endEvent.error;
    } else if (this.cancelled) {
      throw new Error('cancelled');
    }
  }
}
