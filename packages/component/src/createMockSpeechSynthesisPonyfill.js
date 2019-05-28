import createDeferred from './createDeferred';
import EventEmitter from 'events';

export function jestFnWithPromises(implementation) {
  const fn = jest.fn((...args) => {
    fn.deferreds[fn.deferreds.length - 1].resolve(args);
    fn.deferreds = [...fn.deferreds, createDeferred()];
    fn.promises = fn.deferreds.map(({ promise }) => promise);

    implementation && implementation(...args);
  });

  const firstDeferred = createDeferred();

  fn.deferreds = [firstDeferred];
  fn.promises = [firstDeferred.promise];

  return fn;
}

export default function createMockSpeechSynthesisPonyfill() {
  class SpeechSynthesisUtterance {
    constructor(text) {
      this._events = new EventEmitter();

      this.text = text;
    }

    addEventListener(name, handler) {
      this._events.addListener(name, handler);
    }

    dispatchEvent(event) {
      this._events.emit(event.type, event);
    }

    removeEventListener(name, handler) {
      this._events.removeListener(name, handler);
    }
  }

  return {
    speechSynthesis: {
      cancel: jestFnWithPromises(),
      getVoices: () => [{
        name: 'Cantonese',
        voiceURI: 'http://localhost/voice/zh-YUE'
      }],
      speak: jestFnWithPromises()
    },
    SpeechSynthesisUtterance
  };
}
