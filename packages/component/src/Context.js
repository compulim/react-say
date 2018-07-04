import React from 'react';

const Context = React.createContext({
  cancel: () => {},
  getVoices: () => [],
  speak: () => {}
});

export default Context
