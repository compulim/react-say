import React from 'react';
import logo from './logo.svg';
import './App.css';

import Say, { Composer, SayButton } from 'component';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleAutoSpeakChange = this.handleAutoSpeakChange.bind(this);
    this.handleVoiceChange = this.handleVoiceChange.bind(this);

    this.state = {
      autoSpeak: null,
      selectedVoice: null
    };
  }

  handleAutoSpeakChange(nextAutoSpeak) {
    this.setState(() => ({
      autoSpeak: nextAutoSpeak
    }));
  }

  handleVoiceChange(nextSelectedVoice, { target: { checked } }) {
    checked && this.setState(() => ({
      selectedVoice: nextSelectedVoice
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
        <Say speak="I am ready to say whatever you want me to." />
        <Composer>
          { ({ voices }) =>
            <React.Fragment>
              <h1>&lt;Say&gt;</h1>
              {
                state.autoSpeak && <Say speak={ state.autoSpeak } />
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
                speak="A quick brown fox jumped over the lazy dogs."
                voice={ state.selectedVoice }
              >
                A quick brown fox jumped over the lazy dogs.
              </SayButton>
              <SayButton
                speak="你想我噏乜呀？"
                voice={ voices => voices.find(voice => voice.lang === 'zh-HK') }
              >
                你想我噏乜呀？
              </SayButton>
              <SayButton
                pitch={ 2 }
                speak="High pitch"
                voice={ state.selectedVoice }
              >
                High pitch
              </SayButton>
              <SayButton
                pitch={ .5 }
                speak="Low pitch"
                voice={ state.selectedVoice }
              >
                Low pitch
              </SayButton>
              <SayButton
                speak="Low volume"
                voice={ state.selectedVoice }
                volume={ .1 }
              >
                Low volume
              </SayButton>
              <SayButton
                rate={ 2 }
                speak="High rate"
                voice={ state.selectedVoice }
              >
                High rate
              </SayButton>
              <SayButton
                rate={ .5 }
                speak="Low rate"
                voice={ state.selectedVoice }
              >
                Low rate
              </SayButton>
              <h1>Voices</h1>
              <ul>
                { voices.map(voice =>
                  <li key={ voice.voiceURI }>
                    <label>
                      <input
                        checked={ !!state.selectedVoice && voice.voiceURI === state.selectedVoice.voiceURI }
                        onChange={ this.handleVoiceChange.bind(null, voice) }
                        type="checkbox"
                      />
                      ({ voice.lang }) { voice.name }
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
