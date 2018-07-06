import React from 'react';

import Context from './Context';

export default props =>
  <Context.Consumer>
    { context =>
      <button onClick={ event => {
        context.speak({
          lang: props.lang,
          onBoundary: props.onBoundary,
          onEnd: props.onEnd,
          onError: props.onError,
          onStart: props.onStart,
          pitch: props.pitch,
          rate: props.rate,
          text: props.text,
          voice: props.voice,
          volume: props.volume
        });
        props.onClick && props.onClick(event);
      } }>
        { props.children }
      </button>
    }
  </Context.Consumer>
