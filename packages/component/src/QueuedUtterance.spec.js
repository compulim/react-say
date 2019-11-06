import createMockSpeechSynthesisPonyfill, { jestFnWithPromises } from './createMockSpeechSynthesisPonyfill';
import createNativeUtterance from './createNativeUtterance';
import hasResolved from 'has-resolved';
import QueuedUtterance from './QueuedUtterance';

function createErrorEvent(message) {
  const event = new Event('error');

  event.error = new Error(message);

  return event;
}

let ponyfill;

beforeEach(() => {
  ponyfill = createMockSpeechSynthesisPonyfill();
});

function createMockUtterance(props) {
  return createNativeUtterance(ponyfill, props);
}

test('speak with success', async () => {
  const onEnd = jest.fn();
  const onStart = jestFnWithPromises();
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({ text: 'Hello, World!' }),
    {
      onEnd,
      onStart
    }
  );
createMockUtterance
  const promise = utterance.speak(ponyfill);

  expect(await hasResolved(promise)).toBeFalsy();

  expect(ponyfill.speechSynthesis.speak).toHaveBeenCalledTimes(1);

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('text', 'Hello, World!');

  nativeUtterance.dispatchEvent(new Event('start'));

  await onStart.promises[0];
  expect(onStart).toHaveBeenCalledTimes(1);

  expect(await hasResolved(promise)).toBeFalsy();
  nativeUtterance.dispatchEvent(new Event('end'));

  await promise;
  expect(onEnd).toHaveBeenCalledTimes(1);
});

test('cancel before speak', async () => {
  const utterance = new QueuedUtterance('id', createMockUtterance({ text: 'Hello, World!' }), {});

  utterance.cancel();

  const promise = utterance.speak(ponyfill);

  expect(ponyfill.speechSynthesis.speak).toHaveBeenCalledTimes(0);

  await expect(promise).rejects.toThrow('cancelled');
});

test('cancel while speaking', async () => {
  const utterance = new QueuedUtterance('id', createMockUtterance({ text: 'Hello, World!' }), {});

  const promise = utterance.speak(ponyfill);
  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('start'));
  await ponyfill.speechSynthesis.speak.promises[0];

  const cancelPromise = utterance.cancel();

  expect(ponyfill.speechSynthesis.cancel).toHaveBeenCalledTimes(1);

  nativeUtterance.dispatchEvent(new Event('end'));

  await cancelPromise;
  await expect(promise).rejects.toThrow('cancelled');
});

test('cancel after speak completed', async () => {
  const utterance = new QueuedUtterance('id', createMockUtterance({ text: 'Hello, World!' }), {});
  const promise = utterance.speak(ponyfill);
  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('start'));
  nativeUtterance.dispatchEvent(new Event('end'));

  await promise;
  await utterance.cancel();
});

test('error before speak', async () => {
  const onError = jest.fn();
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({ text: 'Hello, World!' }),
    {
      onError
    }
  );
  const promise = utterance.speak(ponyfill);
  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(createErrorEvent('artificial'));

  await expect(promise).rejects.toThrow('artificial');

  expect(onError).toHaveBeenCalledTimes(1);
});

test('error while speaking', async () => {
  const onError = jest.fn();
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({ text: 'Hello, World!' }),
    {
      onError
    }
  );
  const promise = utterance.speak(ponyfill);
  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('start'));
  nativeUtterance.dispatchEvent(createErrorEvent('artificial'));

  await expect(promise).rejects.toThrow('artificial');

  expect(onError).toHaveBeenCalledTimes(1);
});

test('select voice using selector function', async () => {
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({
      text: 'Hello, World!',
      voice: voices => voices.find(({ name }) => name === 'Cantonese')
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance.voice).toHaveProperty('name', 'Cantonese');
  expect(nativeUtterance.voice).toHaveProperty('voiceURI', 'http://localhost/voice/zh-YUE');
});

test('select voice using voiceURI', async () => {
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({
      text: 'Hello, World!',
      voice: {
        voiceURI: 'http://localhost/voice/zh-YUE'
      }
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance.voice).toHaveProperty('name', 'Cantonese');
  expect(nativeUtterance.voice).toHaveProperty('voiceURI', 'http://localhost/voice/zh-YUE');
});

test('set lang, pitch, rate, and volume', async () => {
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({
      lang: 'zh-YUE',
      pitch: .1,
      rate: .2,
      text: 'Hello, World!',
      volume: .3
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('lang', 'zh-YUE');
  expect(nativeUtterance).toHaveProperty('pitch', .1);
  expect(nativeUtterance).toHaveProperty('rate', .2);
  expect(nativeUtterance).toHaveProperty('volume', .3);
});

test('set lang = null, pitch = 0, rate = 0, and volume = 0', async () => {
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({
      lang: null,
      pitch: 0,
      rate: 0,
      text: 'Hello, World!',
      volume: 0
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('lang', '');
  expect(nativeUtterance).toHaveProperty('pitch', 0);
  expect(nativeUtterance).toHaveProperty('rate', 0);
  expect(nativeUtterance).toHaveProperty('volume', 0);
});

test('onBoundary should fire', async () => {
  const onBoundary = jest.fn();
  const utterance = new QueuedUtterance(
    'id',
    createMockUtterance({
      onBoundary,
      text: 'Hello, World!'
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('boundary'));

  expect(onBoundary).toHaveBeenCalledTimes(1);
});
