# react-say

[![npm version](https://badge.fury.io/js/react-say.svg)](https://badge.fury.io/js/react-say) [![Build Status](https://travis-ci.org/compulim/react-say.svg?branch=master)](https://travis-ci.org/compulim/react-say)

A React component that synthesis text into speech using [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

# Demo

Try out the demo at https://compulim.github.io/react-say/.

# How to use

First, run `npm install react-say` for production build. Or run `npm install react-say@master` for latest development build.

## Synthesizing an utterance

`react-say` offer comprehensive ways to synthesize an utterance:

- [Synthesize text using `<Say>` component](using-say-component)
- [Synthesize text using `<SayButton>` component](using-say-button-component)
- [Synthesize utterance using `<SayUtterance>` component](using-say-utterance-component)
- [Synthesize text or utterance using `useSynthesize` hook](using-use-synthesis-hook)

### Using `<Say>` component

The following will speak the text immediately upon showing up. Some browsers may not speak the text until the user interacted with the page.

```jsx
import React from 'react';
import Say from 'react-say';

export default () =>
  <Say speak="A quick brown fox jumped over the lazy dogs." />
```

#### Customizing pitch/rate/volume

To modify the speech by varying pitch, rate, and volume. You can use `<Say>` to say your text.

```jsx
import React from 'react';
import Say from 'react-say';

export default () =>
  <Say
    pitch={ 1.1 }
    rate={ 1.5 }
    speak="A quick brown fox jumped over the lazy dogs."
    volume={ .8 }
  />
```

#### Selecting voice

To select different voice for synthesis, you can either pass a `SpeechSynthesisVoice` object or a selector function to the `voice` props`.

For selector function, the signature is `(voices: SpeechSynthesisVoice[]) => SpeechSynthesisVoice`.

```jsx
import React, { useCallback } from 'react';
import Say from 'react-say';

export default () => {
  // Depends on Web Speech API used, the first argument may be an array-like object instead of an array.
  // We convert it to an array before performing the search.
  const selector = useCallback(voices => [...voices].find(v => v.lang === 'zh-HK'), []);

  return (
    <Say
      speak="A quick brown fox jumped over the lazy dogs."
      voice={ selector }
    />
  );
}
```

> Note: it also works with `<SayButton>`.

### Using `<SayButton>` component

If you want the web page to say something when the user click on a button, you can use the `<SayButton>`.

```jsx
import React from 'react';
import { SayButton } from 'react-say';

export default props =>
  <SayButton
    onClick={ event => console.log(event) }
    speak="A quick brown fox jumped over the lazy dogs."
  >
    Tell me a story
  </SayButton>
```

### Using `<SayUtterance>` component

Instead of synthesizing a text, you can prepare your own `SpeechSynthesisUtterance` object instead.

```jsx
import React, { useMemo } from 'react';
import { SayUtterance } from 'react-say';

export default () => {
  const utterance = useMemo(() => new SpeechSynthesisUtterance('A quick brown fox jumped over the lazy dogs.'), []);

  return (
    <SayUtterance
      utterance={ utterance }
    />
  );
}
```

### Using `useSynthesize` hook

If you want to build your own component to use speech synthesis, you can use `useSynthesize` hook.

```jsx
import React, { useCallback } from 'react';
import { useSynthesize } from 'react-say';

export default () => {
  const synthesize = useSynthesize();
  const handleClick = useCallback(() => {
    synthesize('A quick brown fox jumped over the lazy dogs.');
  }, [synthesize]);

  return (
    <button onClick={ handleClick }>Tell me a story</button>
  );
}
```

#### Cancelling an active or pending synthesis

Once you call `synthesize()` function, the utterance will be queued. The queue prevent multiple utterances to be synthesized at the same time. You can call `cancel()` to remove the utterance from the queue. If the utterance is being synthesized, it will be aborted.

```jsx
import React, { useEffect } from 'react';
import { useSynthesize } from 'react-say';

export default () => {
  const synthesize = useSynthesize();

  // When this component is mounted, the utterance will be queued immediately.
  useEffect(() => {
    const { cancel } = synthesize('A quick brown fox jumped over the lazy dogs.');

    // When this component is unmounted, the synthesis will be cancelled.
    return () => cancel();
  }, [synthesize]);

  return (
    <button onClick={ handleClick }>Tell me a story</button>
  );
}
```

## Bring your own `SpeechSynthesis`

You can bring your own `window.speechSynthesis` and `window.speechSynthesisUtterance` for custom speech synthesis. For example, you can bring Azure Cognitive Services Speech Services thru [`web-speech-cognitive-services`](https://npmjs.com/package/web-speech-cognitive-services) package.

```jsx
import Say from 'react-say';
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

export default () => {
  // You are recommended to use authorization token instead of subscription key.
  const ponyfill = useMemo(() => createPonyfill({
    region: 'westus',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  }), []);

  return (
    <Say
      ponyfill={ ponyfill }
      speak="A quick brown fox jumped over the lazy dogs."
    />
  );
}
```

# Caveats

* Instead of using the native queue for utterances, we implement our own speech queue for browser compatibility reasons
   * Queue is managed by `<Composer>`, all `<Say>`, `<SayButton>`, and `<SayUtterance>` inside the same `<Composer>` will share the same queue
   * Native queue does not support partial cancel, when `cancel` is called, all pending utterances are stopped
   * If `<Say>` or `<SayButton>` is unmounted, the utterance can be stopped without affecting other pending utterances
   * Utterance order can be changed on-the-fly
* Browser quirks
   * Chrome: if `cancel` and `speak` are called repeatedly, `speak` will appear to succeed (`speaking === true`) but audio is never played (`start` event is never fired)
   * Safari: when speech is not triggered by user event (e.g. mouse click or tap), the speech will not be played
      * Workaround: on page load, prime the speech engine by any user events

# Roadmap

* [x] Prettify playground page

# Contributions

Like us? [Star](https://github.com/compulim/react-say/stargazers) us.

Want to make it better? [File](https://github.com/compulim/react-say/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/react-say/pulls) a pull request.
