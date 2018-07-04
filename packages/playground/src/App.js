import React from 'react';
import logo from './logo.svg';
import './App.css';

import BasicSay, { Composer, Say, SayButton } from 'component';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleAutoSpeakChange = this.handleAutoSpeakChange.bind(this);
    this.handleVoiceChange = this.handleVoiceChange.bind(this);

    this.state = {
      autoSpeak: null,
      selectedVoiceURI: null
    };
  }

  handleAutoSpeakChange(nextAutoSpeak) {
    this.setState(() => ({
      autoSpeak: nextAutoSpeak
    }));
  }

  handleVoiceChange(nextSelectedVoiceURI, { target: { checked } }) {
    checked && this.setState(() => ({
      selectedVoiceURI: nextSelectedVoiceURI
    }));
  }

  render() {
    const { state } = this;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <BasicSay text="I am ready to say whatever you want me to." />
        <Composer
          voiceURI={ state.selectedVoiceURI }
        >
          { ({ voices }) =>
            <React.Fragment>
              <h1>&lt;Say&gt;</h1>
              {
                state.autoSpeak && <Say text={ state.autoSpeak } />
              }
              <ul>
                {
                  ['A quick brown fox', 'jumped over', 'the lazy dogs'].map(text =>
                    <li key={ text }>
                      <label>
                        <input
                          checked={ state.autoSpeak === text }
                          onChange={ this.handleAutoSpeakChange.bind(null, text) }
                          type="checkbox"
                        />
                        { text }
                      </label>
                    </li>
                  )
                }
              </ul>
              <h1>&lt;SayButton&gt;</h1>
              <SayButton
                text="A quick brown fox jumped over the lazy dogs."
              >
                A quick brown fox jumped over the lazy dogs.
              </SayButton>
              <SayButton
                text="你想我噏乜呀？"
              >
                你想我噏乜呀？
              </SayButton>
              <h1>Voices</h1>
              <ul>
                { voices.map(({ lang, name, voiceURI }) =>
                  <li key={ voiceURI }>
                    <label>
                      <input
                        checked={ voiceURI === state.selectedVoiceURI }
                        onChange={ this.handleVoiceChange.bind(null, voiceURI) }
                        type="checkbox"
                      />
                      ({ lang }) { name }
                    </label>
                  </li>)
                }
              </ul>
            </React.Fragment>
          }
        </Composer>
      </div>
    );
  }
}
