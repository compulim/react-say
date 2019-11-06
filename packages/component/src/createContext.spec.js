import hasResolved from 'has-resolved';

import createContext from './createContext';
import createMockSpeechSynthesisPonyfill from './createMockSpeechSynthesisPonyfill';
import createNativeUtterance from './createNativeUtterance';

let context;
let originalConsole;
let ponyfill;

beforeEach(() => {
  originalConsole = console;
  console = { ...console, error: jest.fn() };

  ponyfill = createMockSpeechSynthesisPonyfill();
  context = createContext(ponyfill);
});

afterEach(() => {
  console = originalConsole;
});

function createUtterance(props) {
  return createNativeUtterance(ponyfill, props);
}

test('speak one utterance', async () => {
  const promise = context.speak(
    'id1',
    createUtterance({ text: 'Hello, World!' })
  );

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('text', 'Hello, World!');
  nativeUtterance.dispatchEvent(new Event('start'));
  nativeUtterance.dispatchEvent(new Event('end'));

  await promise;
});

test('speak two utterances', async () => {
  const promise1 = context.speak('id1', createUtterance({ text: 'Hello, World!' }));
  const promise2 = context.speak('id2', createUtterance({ text: 'Aloha!' }));

  const [[nativeUtterance1]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(ponyfill.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  expect(await hasResolved(promise2)).toBeFalsy();

  expect(nativeUtterance1).toHaveProperty('text', 'Hello, World!');
  nativeUtterance1.dispatchEvent(new Event('start'));
  nativeUtterance1.dispatchEvent(new Event('end'));

  await promise1;

  expect(ponyfill.speechSynthesis.speak).toHaveBeenCalledTimes(2);
  const [_, [nativeUtterance2]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance2).toHaveProperty('text', 'Aloha!');
  nativeUtterance2.dispatchEvent(new Event('start'));
  nativeUtterance2.dispatchEvent(new Event('end'));

  await promise2;
});

test('speak three utterances and cancel the second while the first is being spoken', async () => {
  const promise1 = context.speak('id1', createUtterance({ text: 'A quick brown fox' }));
  const promise2 = context.speak('id2', createUtterance({ text: 'jumped over' }));
  const promise3 = context.speak('id3', createUtterance({ text: 'the lazy dogs.' }));

  const [[nativeUtterance1]] = ponyfill.speechSynthesis.speak.mock.calls;

  nativeUtterance1.dispatchEvent(new Event('start'));
  context.cancel('id2');
  nativeUtterance1.dispatchEvent(new Event('end'));

  await promise1;
  await expect(promise2).rejects.toThrow('cancelled');

  expect(ponyfill.speechSynthesis.speak).toHaveBeenCalledTimes(2);
  const [_, [nativeUtterance3]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance3).toHaveProperty('text', 'the lazy dogs.');
  nativeUtterance3.dispatchEvent(new Event('start'));
  nativeUtterance3.dispatchEvent(new Event('end'));

  await promise3;
});

test('change ponyfill while speaking', async () => {
  const ponyfill1 = createMockSpeechSynthesisPonyfill();
  const context = createContext(ponyfill1);

  const promise1 = context.speak('id1', createUtterance({ text: 'Hello, World!' }));
  const promise2 = context.speak('id2', createUtterance({ text: 'Aloha!' }));

  const [[nativeUtterance1]] = ponyfill1.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance1).toHaveProperty('text', 'Hello, World!');
  nativeUtterance1.dispatchEvent(new Event('start'));

  const ponyfill2 = createMockSpeechSynthesisPonyfill();

  context.setPonyfill(ponyfill2);

  nativeUtterance1.dispatchEvent(new Event('end'));

  await promise1;

  const [[nativeUtterance2]] = ponyfill2.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance2).toHaveProperty('text', 'Aloha!');
  nativeUtterance2.dispatchEvent(new Event('start'));
  nativeUtterance2.dispatchEvent(new Event('end'));

  await promise2;
});

test('error while speaking an utterance', async () => {
  const promise = context.speak('id', createUtterance({ text: 'Hello, World!' }));

  const [[nativeUtterance]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(nativeUtterance).toHaveProperty('text', 'Hello, World!');
  nativeUtterance.dispatchEvent(new Event('start'));

  const errorEvent = new Event('error');

  errorEvent.error = new Error('artificial');
  nativeUtterance.dispatchEvent(errorEvent);

  await expect(promise).rejects.toThrow('artificial');

  expect(console.error).toHaveBeenCalledTimes(1);
});

test('do not queue subsequent utterances with same ID', async () => {
  const promise1 = context.speak('dupe', createUtterance({ text: 'Hello, World!' }));
  const promise2 = context.speak('dupe', createUtterance({ text: 'Aloha!' }));
  const [[nativeUtterance1]] = ponyfill.speechSynthesis.speak.mock.calls;

  expect(ponyfill.speechSynthesis.speak).toHaveBeenCalledTimes(1);

  expect(nativeUtterance1).toHaveProperty('text', 'Hello, World!');
  nativeUtterance1.dispatchEvent(new Event('start'));
  nativeUtterance1.dispatchEvent(new Event('end'));

  await promise1;

  expect(ponyfill.speechSynthesis.speak).toHaveBeenCalledTimes(1);

  await expect(promise2).rejects.toThrow(/same\sID/);
});
