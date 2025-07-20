const { scenario } = require('@testduet/given-when-then');
const { render } = require('@testing-library/react');
const { expect } = require('expect');
const { afterEach, beforeEach, describe, it } = require('node:test');
const { createElement } = require('react');
const { default: Say } = require('react-say');
const createMockSpeechSynthesisPonyfill = require('./createMockSpeechSynthesisPonyfill.js');

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
    it
  }
);
