import React from 'react';

import Context from './Context';

export default props =>
  <Context.Consumer>
    { context =>
      <button onClick={ event => {
        context.speak(props.text);
        props.onClick && props.onClick(event);
      } }>
        { props.children }
      </button>
    }
  </Context.Consumer>
