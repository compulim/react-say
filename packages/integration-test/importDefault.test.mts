import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { createElement } from 'react';
import Say from 'react-say';
import createMockSpeechSynthesisPonyfill from './createMockSpeechSynthesisPonyfill.mjs';

scenario(
  '<Say> component',
  bdd => {
    bdd
      .given('a mock SpeechSynthesis ponyfill', () => createMockSpeechSynthesisPonyfill())
      .when('<Say> is being rendered', ponyfill =>
        render(
          createElement(Say, {
            ponyfill,
            text: 'Hello, World!'
          })
        )
      )
      .then('should synthesize', ({ speechSynthesis }) => {
        expect(speechSynthesis.speak.mock.calls).toHaveProperty('length', 1);
      });
  },
  {
    afterEach,
    beforeEach,
    describe,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it: it as any
  }
);
