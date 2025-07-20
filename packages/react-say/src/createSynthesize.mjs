import QueuedUtterance from './QueuedUtterance.mjs';

export default function createSynthesize() {
  let queueWithCurrent = [];
  let running;

  const run = async () => {
    if (running) {
      return;
    }

    running = true;

    try {
      let queuedUtterance;

      while ((queuedUtterance = queueWithCurrent[0])) {
        try {
          await queuedUtterance.speak();
        } catch (err) {
          // TODO: If the error is due to Safari restriction on user touch
          //       The next loop on the next audio will also fail because it was not queued with a user touch

          err.message !== 'cancelled' && console.error(err);
        }

        queueWithCurrent = queueWithCurrent.filter(target => target !== queuedUtterance);
      }
    } finally {
      running = false;
    }
  };

  return (ponyfill, utterance, { onEnd, onError, onStart } = {}) => {
    if (!(utterance instanceof ponyfill.SpeechSynthesisUtterance)) {
      throw new Error('utterance must be instance of the ponyfill');
    }

    const queuedUtterance = new QueuedUtterance(ponyfill, utterance, { onEnd, onError, onStart });

    queueWithCurrent = [...queueWithCurrent, queuedUtterance];
    run();

    return {
      // The cancel() function returns a Promise
      cancel: () => queuedUtterance.cancel(),
      promise: queuedUtterance.promise
    };
  };
}
