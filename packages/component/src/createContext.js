import QueuedUtterance from './QueuedUtterance';

export default function createContext({ speechSynthesis, SpeechSynthesisUtterance }) {
  let ponyfill = { speechSynthesis, SpeechSynthesisUtterance };
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
          await queuedUtterance.speak(ponyfill);
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
  }

  return {
    async cancel(id) {
      const index = queueWithCurrent.findIndex(utterance => utterance.id === id);

      // We would leave the cancelled utterance in the queue because we want to reject the promise.
      await queueWithCurrent[index].cancel();
    },
    setPonyfill({ speechSynthesis, SpeechSynthesisUtterance }) {
      ponyfill = { speechSynthesis, SpeechSynthesisUtterance };
    },
    speak(id, utterance, { onEnd, onError, onStart } = {}) {
      // console.debug(`QUEUED: ${ utterance.text }`);

      if (id && queueWithCurrent.find(({ id: targetId }) => id === targetId)) {
        // Do not queue duplicated speak with same unique ID
        // console.debug('NOT QUEUEING DUPE');

        return Promise.reject(new Error('Utterance with same ID is queued'));
      }

      const queuedUtterance = new QueuedUtterance(id, utterance, { onEnd, onError, onStart });

      queueWithCurrent = [...queueWithCurrent, queuedUtterance];
      run();

      return queuedUtterance.promise;
    }
  };
}
