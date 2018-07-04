import React from 'react';
import logo from './logo.svg';
import './App.css';

import Say from 'component';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Say
          text="The SpeechSynthesis interface of the Web Speech API is the controller interface for the speech service; this can be used to retrieve information about the synthesis voices available on the device, start and pause speech, and other commands besides."
        >
          { ({ text }) => text }
        </Say>
      </div>
    );
  }
}
