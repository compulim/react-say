import { expect } from 'expect';
import { afterEach, beforeEach, mock, test } from 'node:test';

import createMockSpeechSynthesisPonyfill from './createMockSpeechSynthesisPonyfill.mjs';
import createNativeUtterance from './createNativeUtterance.mjs';
import createSynthesize from './createSynthesize.mjs';
import hasResolved from './private/hasResolved.ts';

let originalConsole;
let ponyfill;
let synthesize;

beforeEach(() => {
  originalConsole = console;
  console = { ...console, error: mock.fn() };

  ponyfill = createMockSpeechSynthesisPonyfill();
  synthesize = createSynthesize(ponyfill);
});

afterEach(() => {
  console = originalConsole;
});

function createUtterance(props) {
  return createNativeUtterance(ponyfill, props);
}

test('speak one utterance', async () => {
  const { promise } = synthesize(ponyfill, createUtterance({ text: 'Hello, World!' }));

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('text', 'Hello, World!');
  nativeUtterance.dispatchEvent(new Event('start'));
  nativeUtterance.dispatchEvent(new Event('end'));

  await promise;
});

test('speak two utterances', async () => {
  const { promise: promise1 } = synthesize(ponyfill, createUtterance({ text: 'Hello, World!' }));
  const { promise: promise2 } = synthesize(ponyfill, createUtterance({ text: 'Aloha!' }));

  const [
    {
      arguments: [nativeUtterance1]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(ponyfill.speechSynthesis.speak.mock.calls).toHaveProperty('length', 1);
  expect(await hasResolved(promise2)).toBeFalsy();

  expect(nativeUtterance1).toHaveProperty('text', 'Hello, World!');
  nativeUtterance1.dispatchEvent(new Event('start'));
  nativeUtterance1.dispatchEvent(new Event('end'));

  await promise1;

  expect(ponyfill.speechSynthesis.speak.mock.calls).toHaveProperty('length', 2);
  const [
    _,
    {
      arguments: [nativeUtterance2]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance2).toHaveProperty('text', 'Aloha!');
  nativeUtterance2.dispatchEvent(new Event('start'));
  nativeUtterance2.dispatchEvent(new Event('end'));

  await promise2;
});

test('speak three utterances and cancel the second while the first is being spoken', async () => {
  const { promise: promise1 } = synthesize(ponyfill, createUtterance({ text: 'A quick brown fox' }));
  const { cancel: cancel2, promise: promise2 } = synthesize(ponyfill, createUtterance({ text: 'jumped over' }));
  const { promise: promise3 } = synthesize(ponyfill, createUtterance({ text: 'the lazy dogs.' }));

  const [
    {
      arguments: [nativeUtterance1]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance1.dispatchEvent(new Event('start'));
  cancel2();
  nativeUtterance1.dispatchEvent(new Event('end'));

  await promise1;
  await expect(promise2).rejects.toThrow('cancelled');

  expect(ponyfill.speechSynthesis.speak.mock.calls).toHaveProperty('length', 2);
  const [
    _,
    {
      arguments: [nativeUtterance3]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance3).toHaveProperty('text', 'the lazy dogs.');
  nativeUtterance3.dispatchEvent(new Event('start'));
  nativeUtterance3.dispatchEvent(new Event('end'));

  await promise3;
});

test('error while speaking an utterance', async () => {
  const { promise } = synthesize(ponyfill, createUtterance({ text: 'Hello, World!' }));

  const [
    {
      arguments: [nativeUtterance]
    }
  ] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('text', 'Hello, World!');
  nativeUtterance.dispatchEvent(new Event('start'));

  const errorEvent = new Event('error');

  errorEvent.error = new Error('artificial');
  nativeUtterance.dispatchEvent(errorEvent);

  await expect(promise).rejects.toThrow('artificial');

  expect(console.error.mock.calls).toHaveProperty('length', 1);
});
