# react-say

[![npm version](https://badge.fury.io/js/react-say.svg)](https://badge.fury.io/js/react-say) [![Build Status](https://travis-ci.org/compulim/react-say.svg?branch=master)](https://travis-ci.org/compulim/react-say)

A React component that synthesis text into speech using [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

This project scaffold can be found at [`compulim/react-component-template`](https://github.com/compulim/react-component-template).

# Demo

Try out the demo at https://compulim.github.io/react-say/.

# How to use

First, run `npm install react-say` for production build. Or run `npm install react-say@master` for latest development build.

## Simple scenario

The following will speak the text immediately upon showing up. Some browsers may not speak the text until the user interacted with the page.

```jsx
import Say from 'react-say';

export default props =>
  <Say speak="A quick brown fox jumped over the lazy dogs." />
```

## Customizing pitch/rate/volume

You may want to customize the speech by varying pitch, rate, and volume. You can use `<Composer>` and `<Say>` to say your text.

```jsx
import Say from 'react-say';

export default props =>
  <Say
    pitch={ 1.1 }
    rate={ 1.5 }
    speak="A quick brown fox jumped over the lazy dogs."
    volume={ .8 }
  />
```

> Note: variation will take effect for new/modified `<Say>`

## Say button

You may want to say something after the user interacted with the page, for example, after clicking on a button. We have built `<SayButton>` that speak immediately after clicking on it. Some browsers may requires "priming" with a button.

```jsx
import { SayButton } from 'react-say';

export default props =>
  <SayButton
    onClick={ event => console.log(event) }
    speak="A quick brown fox jumped over the lazy dogs."
  >
    Tell me a story
  </SayButton>
```

## Selecting voice

Instead of passing a `SpeechSynthesisVoice` object, you can pass a function `(voices: SpeechSynthesisVoice[]) => SpeechSynthesisVoice` to select the voice just before the text is synthesized.

```jsx
import Say from 'react-say';

export default props =>
  <Say
    speak="A quick brown fox jumped over the lazy dogs."
    voice={ voices => [].find.call(voices, v => v.lang === 'zh-HK') }
  />
```

> Note: it also works with `<SayButton>`.

## Bring your own `SpeechSynthesis`

You can bring your own `window.speechSynthesis` and `window.speechSynthesisUtterance` for custom speech synthesis. For example, you can bring Azure Cognitive Services thru [`web-speech-cognitive-services`](https://npmjs.com/package/web-speech-cognitive-services') package.

```jsx
import Say from 'react-say';
import { speechSynthesis, SpeechSynthesisUtterance, SubscriptionKey } from 'web-speech-cognitive-services';

// You will need to wait until the speech token has been exchanged
// The part has been omitted for code clarity
speechSynthesis.speechToken = new SubscriptionKey('your subscription key');

export default props =>
  <Say
    speak="A quick brown fox jumped over the lazy dogs."
    speechSynthesis={ speechSynthesis }
    speechSynthesisUtterance={ SpeechSynthesisUtterance }
    voice={ voices => [].find.call(voices, v => v.lang === 'zh-HK') }
  />
```

> Note: `speechSynthesis` is camel-casing because it is an instance.

# Caveats

* If `<Say>` or `<SayButton>` is unmounted, the utterance will continue to speak
   * Web Speech does not support stopping or dequeueing a pending utterance, only to cancel all utterances at once
   * Since the utterance is already queued, speaking, or spoken, we cannot stop it and not cancelling other "innocent" utterance
   * We decided to let it continue but not firing any events after unmount

# Roadmap

* [ ] Prettify playground page

# Contributions

Like us? [Star](https://github.com/compulim/react-say/stargazers) us.

Want to make it better? [File](https://github.com/compulim/react-say/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/react-say/pulls) a pull request.
