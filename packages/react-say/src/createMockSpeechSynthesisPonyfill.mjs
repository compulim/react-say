import EventEmitter from 'events';
import { mock } from 'node:test';
import createDeferred from './createDeferred.mjs';

export function mockFnWithPromises(implementation) {
  const fn = mock.fn((...args) => {
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
      // TODO: Update to EventTarget.
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
      cancel: mockFnWithPromises(),
      getVoices: () => [
        {
          name: 'Cantonese',
          voiceURI: 'http://localhost/voice/zh-YUE'
        }
      ],
      speak: mockFnWithPromises()
    },
    SpeechSynthesisUtterance
  };
}
