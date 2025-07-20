import { css } from '@emotion/css';
import React, { memo, useCallback, useMemo, useState } from 'react';

// @ts-expect-error Remove this after ported to TypeScript.
import Say, { Composer, SayButton, SayUtterance } from 'react-say';

const ROOT_CSS = css({
  display: 'flex',

  '& > section': {
    flex: 1
  }
});

const SEGMENTS = ['A quick brown fox', 'jumped over', 'the lazy dogs', 'A quick brown fox jumped over the lazy dogs.'];

type Ponyfill = Pick<typeof globalThis, 'speechSynthesis' | 'SpeechSynthesisUtterance'>;

type QueueEntry = {
  readonly id: string;
  readonly text: string;
} & (
  | { readonly pitch: number; readonly rate: number }
  | {
      readonly utterance: SpeechSynthesisUtterance;
    }
);

const App = () => {
  const ponyfill = useMemo<Ponyfill>(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      speechSynthesis: window.speechSynthesis || ((window as any)['webkitSpeechSynthesis'] as SpeechSynthesis),
      SpeechSynthesisUtterance:
        window.SpeechSynthesisUtterance ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any)['webkitSpeechSynthesisUtterance'] as SpeechSynthesisUtterance)
    }),
    []
  );

  const [queued, setQueued] = useState<readonly QueueEntry[]>(Object.freeze([]));
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>();

  const handleAddClick = useCallback(
    (text: string, pitch: number, rate: number) => {
      const id = crypto.randomUUID();

      setQueued(queued => Object.freeze([...queued, Object.freeze({ id, pitch, rate, text })]));
    },
    [setQueued]
  );

  const handleRemoveFromQueue = useCallback(
    (targetID: string) => {
      setQueued(queued => queued.filter(({ id }) => id !== targetID));
    },
    [setQueued]
  );

  const handleSayUtteranceClick = useCallback(
    (text: string) => {
      setQueued(queued =>
        Object.freeze([
          ...queued,
          Object.freeze({
            id: crypto.randomUUID(),
            text,
            utterance: new ponyfill.SpeechSynthesisUtterance(text)
          })
        ])
      );
    },
    [ponyfill, setQueued]
  );

  const handleSelectedVoiceChange = useCallback(
    ({ target: { value } }: { target: { value: string } }) => setSelectedVoiceURI(value),
    [setSelectedVoiceURI]
  );

  const selectVoice = useCallback(
    (voices: readonly SpeechSynthesisVoice[]) =>
      voices.find(({ voiceURI }) => voiceURI === selectedVoiceURI) ||
      voices.find(({ lang }) => lang === window.navigator.language),
    [selectedVoiceURI]
  );

  const selectLocalizedVoice = useCallback(
    (language: string, voices: readonly SpeechSynthesisVoice[]) => {
      const voice = voices.find(({ voiceURI }) => voiceURI === selectedVoiceURI);

      return voice && voice.lang === language ? voice : voices.find(voice => voice.lang === language);
    },
    [selectedVoiceURI]
  );

  return (
    <Composer ponyfill={ponyfill}>
      {({ voices }: { voices: SpeechSynthesisVoice[] }) => (
        <div className={ROOT_CSS}>
          <section className="words">
            <article>
              <header>
                <h1>Words</h1>
              </header>
              <ul>
                {SEGMENTS.map(segment => (
                  <li key={segment}>
                    <button onClick={handleAddClick.bind(null, segment, 1, 1)}>
                      <span role="img" aria-label="say">
                        💬
                      </span>
                    </button>
                    <button onClick={handleAddClick.bind(null, segment, 2, 1)}>
                      <span role="img" aria-label="high pitch">
                        📈
                      </span>
                    </button>
                    <button onClick={handleAddClick.bind(null, segment, 0.5, 1)}>
                      <span role="img" aria-label="low pitch">
                        📉
                      </span>
                    </button>
                    <button onClick={handleAddClick.bind(null, segment, 1, 2)}>
                      <span role="img" aria-label="fast">
                        🐇
                      </span>
                    </button>
                    <button onClick={handleAddClick.bind(null, segment, 1, 0.5)}>
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
                    <SayButton text={segment} voice={selectVoice}>
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
                    <button onClick={handleSayUtteranceClick.bind(null, segment)}>{segment}</button>
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
                  <SayButton text="一於記住一於記住每天向前望" voice={selectLocalizedVoice.bind(this, 'zh-HK')}>
                    一於記住一於記住每天向前望
                  </SayButton>
                </li>
                <li>
                  <SayButton text="お誕生日おめでとう" voice={selectLocalizedVoice.bind(this, 'ja-JP')}>
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
              {queued.length ? (
                <ul>
                  {queued.map(entry => {
                    const { id, text } = entry;

                    return (
                      <li key={id}>
                        <button onClick={handleRemoveFromQueue.bind(null, id)}>&times;</button>&nbsp;
                        <span>{text}</span>
                        {'utterance' in entry ? (
                          <React.Fragment>
                            <span>&nbsp;(Utterance)</span>
                            <SayUtterance
                              onEnd={handleRemoveFromQueue.bind(null, id)}
                              ponyfill={ponyfill}
                              utterance={entry.utterance}
                            />
                          </React.Fragment>
                        ) : (
                          <Say
                            onEnd={handleRemoveFromQueue.bind(null, id)}
                            pitch={entry.pitch}
                            ponyfill={ponyfill}
                            rate={entry.rate}
                            text={text}
                            voice={selectVoice}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div>Nothing queued</div>
              )}
            </article>
            <article>
              <header>
                <h1>Available voices</h1>
              </header>
              <select onChange={handleSelectedVoiceChange} value={selectedVoiceURI || ''}>
                <option>Browser language default ({window.navigator.language})</option>
                {voices.map(({ lang, name, voiceURI }: SpeechSynthesisVoice) => (
                  <option key={voiceURI} value={voiceURI}>{`[${lang}] ${name || voiceURI}`}</option>
                ))}
              </select>
            </article>
          </section>
        </div>
      )}
    </Composer>
  );
};

export default memo(App);
