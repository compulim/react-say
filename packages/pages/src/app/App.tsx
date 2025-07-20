import { css } from '@emotion/css';
import React from 'react';

import Say, { Composer, SayButton, SayUtterance } from 'react-say';

const ROOT_CSS = css({
  display: 'flex',

  '& > section': {
    flex: 1
  }
});

const SEGMENTS = ['A quick brown fox', 'jumped over', 'the lazy dogs', 'A quick brown fox jumped over the lazy dogs.'];

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleRemoveFromQueue = this.handleRemoveFromQueue.bind(this);
    this.handleSayEnd = this.handleRemoveFromQueue.bind(this);
    this.handleSayUtteranceClick = this.handleSayUtteranceClick.bind(this);
    this.handleSelectedVoiceChange = this.handleSelectedVoiceChange.bind(this);

    this.selectCantoneseVoice = this.selectLocalizedVoice.bind(this, 'zh-HK');
    this.selectJapaneseVoice = this.selectLocalizedVoice.bind(this, 'ja-JP');
    this.selectVoice = this.selectVoice.bind(this);

    const params = new URLSearchParams(window.location.search);
    let ponyfill: Pick<typeof globalThis, 'speechSynthesis' | 'SpeechSynthesisUtterance'> = {
      speechSynthesis: window.speechSynthesis || (window['webkitSpeechSynthesis'] as SpeechSynthesis),
      SpeechSynthesisUtterance:
        window.SpeechSynthesisUtterance || (window['webkitSpeechSynthesisUtterance'] as SpeechSynthesisUtterance)
    };

    this.state = {
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

  handleRemoveFromQueue(targetID) {
    this.setState(({ queued }) => ({
      queued: queued.filter(({ id }) => id !== targetID)
    }));
  }

  handleSayUtteranceClick(text) {
    const {
      state: {
        ponyfill: { SpeechSynthesisUtterance }
      }
    } = this;

    this.setState(({ queued }) => ({
      queued: [
        ...queued,
        {
          id: Math.random(),
          text,
          utterance: new SpeechSynthesisUtterance(text)
        }
      ]
    }));
  }

  handleSelectedVoiceChange({ target: { value } }) {
    this.setState(() => ({
      selectedVoiceURI: value
    }));
  }

  selectVoice(voices) {
    const { selectedVoiceURI } = this.state;

    return (
      voices.find(({ voiceURI }) => voiceURI === selectedVoiceURI) ||
      voices.find(({ lang }) => lang === window.navigator.language)
    );
  }

  selectLocalizedVoice(language, voices) {
    const { selectedVoiceURI } = this.state;

    const voice = voices.find(({ voiceURI }) => voiceURI === selectedVoiceURI);

    return voice && voice.lang === language ? voice : voices.find(voice => voice.lang === language);
  }

  render() {
    const { state } = this;

    return (
      <Composer ponyfill={state.ponyfill}>
        {({ voices }) => (
          <div className={ROOT_CSS}>
            <section className="words">
              <article>
                <header>
                  <h1>Words</h1>
                </header>
                <ul>
                  {SEGMENTS.map(segment => (
                    <li key={segment}>
                      <button onClick={this.handleAddClick.bind(null, segment, 1, 1)}>
                        <span role="img" aria-label="say">
                          💬
                        </span>
                      </button>
                      <button onClick={this.handleAddClick.bind(null, segment, 2, 1)}>
                        <span role="img" aria-label="high pitch">
                          📈
                        </span>
                      </button>
                      <button onClick={this.handleAddClick.bind(null, segment, 0.5, 1)}>
                        <span role="img" aria-label="low pitch">
                          📉
                        </span>
                      </button>
                      <button onClick={this.handleAddClick.bind(null, segment, 1, 2)}>
                        <span role="img" aria-label="fast">
                          🐇
                        </span>
                      </button>
                      <button onClick={this.handleAddClick.bind(null, segment, 1, 0.5)}>
                        <span role="img" aria-label="slow">
                          🐢
                        </span>
                      </button>
                      &nbsp;{segment}
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <header>
                  <h1>Say button</h1>
                </header>
                <ul>
                  {SEGMENTS.map(segment => (
                    <li key={segment}>
                      <SayButton text={segment} voice={this.selectVoice}>
                        {segment}
                      </SayButton>
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <header>
                  <h1>Say utterance</h1>
                </header>
                <ul>
                  {SEGMENTS.map(segment => (
                    <li key={segment}>
                      <button onClick={this.handleSayUtteranceClick.bind(null, segment)}>{segment}</button>
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <header>
                  <h1>Other languages</h1>
                </header>
                <ul>
                  <li>
                    <SayButton text="一於記住一於記住每天向前望" voice={this.selectCantoneseVoice}>
                      一於記住一於記住每天向前望
                    </SayButton>
                  </li>
                  <li>
                    <SayButton text="お誕生日おめでとう" voice={this.selectJapaneseVoice}>
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
                {state.queued.length ? (
                  <ul>
                    {state.queued.map(({ id, pitch, rate, text, utterance }) => (
                      <li key={id}>
                        <button onClick={this.handleRemoveFromQueue.bind(null, id)}>&times;</button>&nbsp;
                        <span>{text}</span>
                        {utterance ? (
                          <React.Fragment>
                            <span>&nbsp;(Utterance)</span>
                            <SayUtterance onEnd={this.handleSayEnd.bind(null, id)} utterance={utterance} />
                          </React.Fragment>
                        ) : (
                          <Say
                            onEnd={this.handleSayEnd.bind(null, id)}
                            pitch={pitch}
                            rate={rate}
                            text={text}
                            voice={this.selectVoice}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>Nothing queued</div>
                )}
              </article>
              <article>
                <header>
                  <h1>Available voices</h1>
                </header>
                <select onChange={this.handleSelectedVoiceChange} value={state.selectedVoiceURI || ''}>
                  <option>Browser language default ({window.navigator.language})</option>
                  {voices.map(({ lang, name, voiceURI }) => (
                    <option key={voiceURI} value={voiceURI}>{`[${lang}] ${name || voiceURI}`}</option>
                  ))}
                </select>
              </article>
            </section>
          </div>
        )}
      </Composer>
    );
  }
}
