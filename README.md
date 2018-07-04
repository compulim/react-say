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
import BasicSay from 'react-say';

export default props =>
  <BasicSay
    text="A quick brown fox jumped over the lazy dogs."
  />
```

## Customizing pitch/rate

You may want to customize the speech by varying pitch and rate. You can use `<Composer>` and `<Say>` to say your text.

```jsx
import { Composer, Say } from 'react-say';

export default props =>
  <Composer
    pitch={ 1.1 }
    rate={ 1.5 }
  >
    <Say
      text="A quick brown fox jumped over the lazy dogs."
    />
  </Composer>
```

> Note: variation will take effect for new/modified `<Say>`

## Say button

Since some browsers may block speak synthesis before the user interacting with the page, you can use `<SayButton>` for the purpose.

```jsx
import { Composer, SayButton } from 'react-say';

export default props =>
  <Composer>
    <SayButton
      onClick={ event => console.log(event) }
      text="A quick brown fox jumped over the lazy dogs."
    >
      Tell me a story
    </SayButton>
  </Composer>
```

# Contributions

Like us? [Star](https://github.com/compulim/react-say/stargazers) us.

Want to make it better? [File](https://github.com/compulim/react-say/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/react-say/pulls) a pull request.
