import { css } from 'glamor';
import React from 'react';
import { speechSynthesis, SpeechSynthesisUtterance, SubscriptionKey } from 'web-speech-cognitive-services';

import Say, { Composer, SayButton } from 'component';

const ROOT_CSS = css({
  display: 'flex',

  '& > section': {
    flex: 1
  }
});

const SEGMENTS = [
  'A quick brown fox',
  'jumped over',
  'the lazy dogs',
  'A quick brown fox jumped over the lazy dogs.'
];

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleBingSpeechKeyChange = this.handleBingSpeechKeyChange.bind(this);
    this.handleBingSpeechKeySubmit = this.handleBingSpeechKeySubmit.bind(this);
    this.handleClearBingSpeechKey = this.handleClearBingSpeechKey.bind(this);
    this.handleRemoveFromQueue = this.handleRemoveFromQueue.bind(this);
    this.handleSayEnd = this.handleRemoveFromQueue.bind(this);
    this.handleSelectedVoiceChange = this.handleSelectedVoiceChange.bind(this);

    const params = new URLSearchParams(window.location.search);
    const bingSpeechKey = params.get('s');
    let ponyfill;

    if (bingSpeechKey) {
      ponyfill = {
        speechSynthesis,
        SpeechSynthesisUtterance
      };

      speechSynthesis.speechToken = new SubscriptionKey(bingSpeechKey);
    }

    this.state = {
      bingSpeechKey,
      ponyfill,
      queued: [],
      selectedVoiceURI: null
    };
  }

  handleAddClick(text, pitch, rate) {
    const id = Date.now() + Math.random();

    this.setState(({ queued }) => ({
      queued: [...queued, { id, pitch, rate, text }]
    }));
  }

  handleBingSpeechKeyChange({ target: { value } }) {
    this.setState(() => ({ bingSpeechKey: value }));
  }

  handleBingSpeechKeySubmit(event) {
    event.preventDefault();
    window.location.href = `?s=${ encodeURIComponent(this.state.bingSpeechKey) }`;
  }

  handleClearBingSpeechKey() {
    this.setState(() => ({ bingSpeechKey: '' }));
  }

  handleRemoveFromQueue(targetID) {
    this.setState(({ queued }) => ({
      queued: queued.filter(({ id }) => id !== targetID)
    }));
  }

  handleSelectedVoiceChange({ target: { value } }) {
    this.setState(() => ({
      selectedVoiceURI: value
    }));
  }

  render() {
    const { state } = this;

    return (
      <Composer
        speechSynthesis={ state.ponyfill && state.ponyfill.speechSynthesis }
        speechSynthesisUtterance={ state.ponyfill && state.ponyfill.SpeechSynthesisUtterance }
      >
        { ({ voices }) =>
          <div className={ ROOT_CSS }>
            <section className="words">
              <article>
                <header>
                  <h1>Words</h1>
                </header>
                <ul>
                  { SEGMENTS.map(segment =>
                    <li key={ segment }>
                      <button onClick={ this.handleAddClick.bind(null, segment, 1, 1) }><span role="img" aria-label="say">💬</span></button>
                      <button onClick={ this.handleAddClick.bind(null, segment, 2, 1) }><span role="img" aria-label="high pitch">📈</span></button>
                      <button onClick={ this.handleAddClick.bind(null, segment, .5, 1) }><span role="img" aria-label="low pitch">📉</span></button>
                      <button onClick={ this.handleAddClick.bind(null, segment, 1, 2) }><span role="img" aria-label="fast">🐇</span></button>
                      <button onClick={ this.handleAddClick.bind(null, segment, 1, .5) }><span role="img" aria-label="slow">🐢</span></button>
                      &nbsp;{ segment }
                    </li>
                  ) }
                </ul>
              </article>
              <article>
                <header>
                  <h1>Say immediate</h1>
                </header>
                <ul>
                  { SEGMENTS.map(segment =>
                    <li key={ segment }>
                      <SayButton
                        speak={ segment }
                        voice={ voices => voices.find(({ voiceURI }) => voiceURI === state.selectedVoiceURI) || voices.find(({ lang }) => lang === window.navigator.language) }
                      >
                        { segment }
                      </SayButton>
                    </li>
                  ) }
                </ul>
              </article>
              <article>
                <header>
                  <h1>Other languages</h1>
                </header>
                <ul>
                  <li>
                    <SayButton
                      speak="一於記住一於記住每天向前望"
                      voice={ voices => {
                        const voice = voices.find(({ voiceURI }) => voiceURI === state.selectedVoiceURI);

                        return (voice && voice.lang === 'zh-HK') ? voice : voices.find(voice => voice.lang === 'zh-HK');
                      } }
                    >
                      一於記住一於記住每天向前望
                    </SayButton>
                  </li>
                  <li>
                    <SayButton
                      speak="お誕生日おめでとう"
                      voice={ voices => {
                        const voice = voices.find(({ voiceURI }) => voiceURI === state.selectedVoiceURI);

                        return (voice && voice.lang === 'ja-JP') ? voice : voices.find(voice => voice.lang === 'ja-JP');
                      } }
                    >
                      お誕生日おめでとう
                    </SayButton>
                  </li>
                </ul>
              </article>
            </section>
            <section className="queue">
              <article>
                <header>
                  <h1>Queue</h1>
                </header>
                { state.queued.length ?
                    <ul>
                      { state.queued.map(({ id, pitch, rate, text }) =>
                        <li key={ id }>
                          <button onClick={ this.handleRemoveFromQueue.bind(null, id) }>&times;</button>&nbsp;
                          <span>{ text }</span>
                          <Say
                            onEnd={ this.handleSayEnd.bind(null, id) }
                            pitch={ pitch }
                            rate={ rate }
                            speak={ text }
                            voice={ voices => voices.find(({ voiceURI }) => voiceURI === state.selectedVoiceURI) || voices.find(({ lang }) => lang === window.navigator.language) }
                          />
                        </li>
                      ) }
                    </ul>
                  :
                    <div>Nothing queued</div>
                }
              </article>
              <article>
                <header>
                  <h1>Available voices</h1>
                </header>
                <select
                  onChange={ this.handleSelectedVoiceChange }
                  value={ state.selectedVoiceURI || '' }
                >
                  <option>Browser language default ({ window.navigator.language })</option>
                  { voices.map(({ lang, name, voiceURI }) =>
                    <option key={ voiceURI }value={ voiceURI }>{ `[${ lang }] ${ name || voiceURI }` }</option>
                  ) }
                </select>
              </article>
              <article>
                <header>
                  <h1>Other services</h1>
                </header>
                <form onSubmit={ this.handleBingSpeechKeySubmit }>
                  <p>
                    <label>
                      Bing Speech key
                      <input
                        onChange={ this.handleBingSpeechKeyChange }
                        type="text"
                        value={ state.bingSpeechKey || '' }
                      />
                      <button
                        onClick={ this.handleClearBingSpeechKey }
                        type="button"
                      >
                        &times;
                      </button>
                    </label>
                  </p>
                  <p>
                    <button>Save</button>
                  </p>
                </form>
              </article>
            </section>
          </div>
        }
      </Composer>
    );
  }
}
