import { css } from 'glamor';
import React from 'react';

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
    this.handleRemoveFromQueue = this.handleRemoveFromQueue.bind(this);
    this.handleSayEnd = this.handleRemoveFromQueue.bind(this);
    this.handleSelectedVoiceChange = this.handleSelectedVoiceChange.bind(this);

    this.state = {
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

  handleSelectedVoiceChange(nextSelectedVoiceURI) {
    this.setState(() => ({
      selectedVoiceURI: nextSelectedVoiceURI
    }));
  }

  render() {
    const { state } = this;

    return (
      <Composer>
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
                      <SayButton speak={ segment }>{ segment }</SayButton>
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
                      voice={ voices => voices.find(voice => voice.lang === 'zh-HK') }
                    >
                      一於記住一於記住每天向前望
                    </SayButton>
                  </li>
                  <li>
                    <SayButton
                      speak="お誕生日おめでとう"
                      voice={ voices => voices.find(voice => voice.lang === 'ja-JP') }
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
                            voice={ voices => voices.find(({ voiceURI }) => voiceURI === state.selectedVoiceURI) }
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
                <ul>
                  { voices.map(({ lang, name, voiceURI }) =>
                    <li key={ voiceURI }>
                      <label>
                        <input
                          checked={ voiceURI === state.selectedVoiceURI }
                          onChange={ this.handleSelectedVoiceChange.bind(null, voiceURI) }
                          name="voice"
                          type="radio"
                        />
                        [{ lang }] { name }
                      </label>
                    </li>
                  ) }
                </ul>
              </article>
            </section>
          </div>
        }
      </Composer>
    );
  }
}
