import { expect } from 'expect';
import { beforeEach, mock, test } from 'node:test';
import createErrorEvent from './createErrorEvent.mjs';
import createMockSpeechSynthesisPonyfill, { mockFnWithPromises } from './createMockSpeechSynthesisPonyfill.mjs';
import createNativeUtterance from './createNativeUtterance.mjs';
import hasResolved from './private/hasResolved.ts';
import QueuedUtterance from './QueuedUtterance.mjs';

let ponyfill;

beforeEach(() => {
  ponyfill = createMockSpeechSynthesisPonyfill();
});

function createMockUtterance(props) {
  return createNativeUtterance(ponyfill, props);
}

test('speak with success', async () => {
  const onEnd = mock.fn();
  const onStart = mockFnWithPromises();
  const utterance = new QueuedUtterance(ponyfill, createMockUtterance({ text: 'Hello, World!' }), {
    onEnd,
    onStart
  });

  const promise = utterance.speak(ponyfill);

  expect(await hasResolved(promise)).toBeFalsy();

  expect(ponyfill.speechSynthesis.speak.mock.calls).toHaveProperty('length', 1);

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('text', 'Hello, World!');

  nativeUtterance.dispatchEvent(new Event('start'));

  await onStart.promises[0];
  expect(onStart.mock.calls).toHaveProperty('length', 1);

  expect(await hasResolved(promise)).toBeFalsy();
  nativeUtterance.dispatchEvent(new Event('end'));

  await promise;
  expect(onEnd.mock.calls).toHaveProperty('length', 1);
});

test('cancel before speak', async () => {
  const utterance = new QueuedUtterance(ponyfill, createMockUtterance({ text: 'Hello, World!' }), {});

  utterance.cancel();

  const promise = utterance.speak(ponyfill);

  expect(ponyfill.speechSynthesis.speak.mock.calls).toHaveProperty('length', 0);

  await expect(promise).rejects.toThrow('cancelled');
});

test('cancel while speaking', async () => {
  const utterance = new QueuedUtterance(ponyfill, createMockUtterance({ text: 'Hello, World!' }), {});

  const promise = utterance.speak(ponyfill);
  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('start'));
  await ponyfill.speechSynthesis.speak.promises[0];

  const cancelPromise = utterance.cancel();

  await ponyfill.speechSynthesis.cancel.promises[0];
  expect(ponyfill.speechSynthesis.cancel.mock.calls).toHaveProperty('length', 1);

  nativeUtterance.dispatchEvent(new Event('end'));

  await cancelPromise;
  await expect(promise).rejects.toThrow('cancelled');
});

test('cancel after speak completed', async () => {
  const utterance = new QueuedUtterance(ponyfill, createMockUtterance({ text: 'Hello, World!' }), {});
  const promise = utterance.speak(ponyfill);
  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('start'));
  nativeUtterance.dispatchEvent(new Event('end'));

  await promise;
  await utterance.cancel();
});

test('error before speak', async () => {
  const onError = mock.fn();
  const utterance = new QueuedUtterance(ponyfill, createMockUtterance({ text: 'Hello, World!' }), {
    onError
  });
  const promise = utterance.speak(ponyfill);
  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(createErrorEvent(new Error('artificial')));

  await expect(promise).rejects.toThrow('artificial');

  expect(onError.mock.calls).toHaveProperty('length', 1);
});

test('error while speaking', async () => {
  const onError = mock.fn();
  const utterance = new QueuedUtterance(ponyfill, createMockUtterance({ text: 'Hello, World!' }), {
    onError
  });
  const promise = utterance.speak(ponyfill);
  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('start'));
  nativeUtterance.dispatchEvent(createErrorEvent(new Error('artificial')));

  await expect(promise).rejects.toThrow('artificial');

  expect(onError.mock.calls).toHaveProperty('length', 1);
});

test('select voice using selector function', async () => {
  const utterance = new QueuedUtterance(
    ponyfill,
    createMockUtterance({
      text: 'Hello, World!',
      voice: voices => voices.find(({ name }) => name === 'Cantonese')
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance.voice).toHaveProperty('name', 'Cantonese');
  expect(nativeUtterance.voice).toHaveProperty('voiceURI', 'http://localhost/voice/zh-YUE');
});

test('select voice using voiceURI', async () => {
  const utterance = new QueuedUtterance(
    ponyfill,
    createMockUtterance({
      text: 'Hello, World!',
      voice: {
        voiceURI: 'http://localhost/voice/zh-YUE'
      }
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance.voice).toHaveProperty('name', 'Cantonese');
  expect(nativeUtterance.voice).toHaveProperty('voiceURI', 'http://localhost/voice/zh-YUE');
});

test('set lang, pitch, rate, and volume', async () => {
  const utterance = new QueuedUtterance(
    ponyfill,
    createMockUtterance({
      lang: 'zh-YUE',
      pitch: 0.1,
      rate: 0.2,
      text: 'Hello, World!',
      volume: 0.3
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('lang', 'zh-YUE');
  expect(nativeUtterance).toHaveProperty('pitch', 0.1);
  expect(nativeUtterance).toHaveProperty('rate', 0.2);
  expect(nativeUtterance).toHaveProperty('volume', 0.3);
});

test('set lang = null, pitch = 0, rate = 0, and volume = 0', async () => {
  const utterance = new QueuedUtterance(
    ponyfill,
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

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('lang', '');
  expect(nativeUtterance).toHaveProperty('pitch', 0);
  expect(nativeUtterance).toHaveProperty('rate', 0);
  expect(nativeUtterance).toHaveProperty('volume', 0);
});

test('onBoundary should fire', async () => {
  const onBoundary = mock.fn();
  const utterance = new QueuedUtterance(
    ponyfill,
    createMockUtterance({
      onBoundary,
      text: 'Hello, World!'
    }),
    {}
  );

  utterance.speak(ponyfill);

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance.dispatchEvent(new Event('boundary'));

  expect(onBoundary.mock.calls).toHaveProperty('length', 1);
});
