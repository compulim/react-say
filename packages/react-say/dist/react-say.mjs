// src/Composer.jsx
import PropTypes4 from "prop-types";
import React5, { useContext as useContext3, useMemo as useMemo2, useState as useState2 } from "react";

// src/Context.mjs
import React from "react";
var Context = React.createContext();
var Context_default = Context;

// src/createCustomEvent.mjs
function createCustomEvent(name, eventInitDict) {
  if (name === "error") {
    if (typeof ErrorEvent === "function") {
      return new ErrorEvent(name, eventInitDict);
    }
  } else if (typeof CustomEvent === "function") {
    return new CustomEvent(name, eventInitDict);
  }
  const event = document.createEvent("Event");
  event.initEvent(name, true, true);
  Object.entries(eventInitDict || {}).forEach(([key, value]) => {
    event[key] = value;
  });
  return event;
}

// src/createDeferred.mjs
function createDeferred() {
  let reject, resolve;
  const promise = new Promise((promiseResolve, promiseReject) => {
    reject = promiseReject;
    resolve = promiseResolve;
  });
  if (!reject || !resolve) {
    throw new Error("Promise is not a ES-compliant and do not run exector immediately");
  }
  return { promise, reject, resolve };
}

// src/createErrorEvent.mjs
function createErrorEvent(error) {
  return createCustomEvent("error", { error });
}

// src/QueuedUtterance.mjs
async function speakUtterance(ponyfill, utterance, startCallback) {
  const { speechSynthesis } = ponyfill;
  const startDeferred = createDeferred();
  const errorDeferred = createDeferred();
  const endDeferred = createDeferred();
  utterance.addEventListener("end", endDeferred.resolve);
  utterance.addEventListener("error", errorDeferred.resolve);
  utterance.addEventListener("start", startDeferred.resolve);
  speechSynthesis.speak(utterance);
  const startEvent = await Promise.race([errorDeferred.promise, startDeferred.promise]);
  if (startEvent.type === "error") {
    throw startEvent.error;
  }
  let finishedSpeaking;
  const endPromise = Promise.race([errorDeferred.promise, endDeferred.promise]);
  startCallback && startCallback(async () => {
    if (!finishedSpeaking) {
      speechSynthesis.cancel();
      await endPromise;
    }
  });
  const endEvent = await endPromise;
  finishedSpeaking = true;
  if (endEvent.type === "error") {
    throw endEvent.error;
  }
}
var QueuedUtterance = class {
  constructor(ponyfill, utterance, { onEnd, onError, onStart }) {
    this._cancelled = false;
    this._deferred = createDeferred();
    this._onEnd = onEnd;
    this._onError = onError;
    this._onStart = onStart;
    this._ponyfill = ponyfill;
    this._speaking = false;
    this._utterance = utterance;
    this.promise = this._deferred.promise;
  }
  async cancel() {
    this._cancelled = true;
    this._cancel && await this._cancel();
  }
  speak() {
    if (this._speaking) {
      console.warn(`ASSERTION: QueuedUtterance is already speaking or has spoken.`);
    }
    this._speaking = true;
    (async () => {
      if (this._cancelled) {
        throw new Error("cancelled");
      }
      await speakUtterance(this._ponyfill, this._utterance, (cancel) => {
        if (this._cancelled) {
          cancel();
          throw new Error("cancelled");
        } else {
          this._cancel = cancel;
          this._onStart && this._onStart(createCustomEvent("start"));
        }
      });
      if (this._cancelled) {
        throw new Error("cancelled");
      }
    })().then(
      () => {
        this._onEnd && this._onEnd(createCustomEvent("end"));
        this._deferred.resolve();
      },
      (error) => {
        this._onError && this._onError(createErrorEvent(error));
        this._deferred.reject(error);
      }
    );
    return this.promise;
  }
};

// src/createSynthesize.mjs
function createSynthesize() {
  let queueWithCurrent = [];
  let running;
  const run = async () => {
    if (running) {
      return;
    }
    running = true;
    try {
      let queuedUtterance;
      while (queuedUtterance = queueWithCurrent[0]) {
        try {
          await queuedUtterance.speak();
        } catch (err) {
          err.message !== "cancelled" && console.error(err);
        }
        queueWithCurrent = queueWithCurrent.filter((target) => target !== queuedUtterance);
      }
    } finally {
      running = false;
    }
  };
  return (ponyfill, utterance, { onEnd, onError, onStart } = {}) => {
    if (!(utterance instanceof ponyfill.SpeechSynthesisUtterance)) {
      throw new Error("utterance must be instance of the ponyfill");
    }
    const queuedUtterance = new QueuedUtterance(ponyfill, utterance, { onEnd, onError, onStart });
    queueWithCurrent = [...queueWithCurrent, queuedUtterance];
    run();
    return {
      // The cancel() function returns a Promise
      cancel: () => queuedUtterance.cancel(),
      promise: queuedUtterance.promise
    };
  };
}

// src/Say.jsx
import PropTypes2 from "prop-types";
import React3, { useContext as useContext2, useMemo } from "react";

// src/createNativeUtterance.mjs
function createNativeUtterance({ speechSynthesis, SpeechSynthesisUtterance }, { lang, onBoundary, pitch, rate, text, voice, volume }) {
  const utterance = new SpeechSynthesisUtterance(text);
  let targetVoice;
  if (typeof voice === "function") {
    targetVoice = voice.call(speechSynthesis, speechSynthesis.getVoices());
  } else {
    const { voiceURI } = voice || {};
    targetVoice = voiceURI && [].find.call([].slice.call(speechSynthesis.getVoices()), (v) => v.voiceURI === voiceURI);
  }
  utterance.lang = lang || "";
  if (pitch || pitch === 0) {
    utterance.pitch = pitch;
  }
  if (rate || rate === 0) {
    utterance.rate = rate;
  }
  if (targetVoice) {
    utterance.voice = targetVoice;
  }
  if (volume || volume === 0) {
    utterance.volume = volume;
  }
  onBoundary && utterance.addEventListener("boundary", onBoundary);
  return utterance;
}

// src/SayUtterance.jsx
import PropTypes from "prop-types";
import React2, { useEffect, useRef } from "react";

// src/useSynthesize.mjs
import { useContext } from "react";
function useSynthesize() {
  const { ponyfill, synthesize } = useContext(Context_default);
  return (utteranceOrText, progressFn) => {
    if (typeof utteranceOrText === "string") {
      utteranceOrText = createNativeUtterance(ponyfill, { text: utteranceOrText });
    }
    return synthesize(ponyfill, utteranceOrText, { onStart: progressFn && (() => progressFn()) });
  };
}

// src/SayUtterance.jsx
var SayUtterance = (props) => {
  const { onEnd, onError, onStart, utterance } = migrateDeprecatedProps(props);
  const started = useRef(false);
  const synthesize = useSynthesize();
  useEffect(() => {
    if (started.current) {
      return console.warn("react-say: Should not change utterance after synthesis started.");
    }
    let cancelled;
    const { cancel, promise } = synthesize(utterance, () => {
      started.current = true;
      !cancelled && onStart && onStart(createCustomEvent("start"));
    });
    promise.then(
      () => !cancelled && onEnd && onEnd(createCustomEvent("end")),
      (error) => !cancelled && onError && onError(createErrorEvent(error))
    );
    return () => {
      cancelled = true;
      cancel();
    };
  }, []);
  return false;
};
SayUtterance.defaultProps = {
  onEnd: void 0,
  onError: void 0,
  onStart: void 0
};
SayUtterance.propTypes = {
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func
};
var SayUtteranceWithContext = ({ ponyfill, ...props }) => /* @__PURE__ */ React2.createElement(Composer_default, { ponyfill }, /* @__PURE__ */ React2.createElement(SayUtterance, { ...props }));
SayUtteranceWithContext.defaultProps = {
  ...SayUtterance.defaultProps,
  ponyfill: void 0
};
SayUtteranceWithContext.propTypes = {
  ...SayUtterance.propTypes,
  ponyfill: PropTypes.shape({
    speechSynthesis: PropTypes.any.isRequired,
    SpeechSynthesisUtterance: PropTypes.any.isRequired
  })
};
var SayUtterance_default = SayUtteranceWithContext;

// src/Say.jsx
var Say = (props) => {
  let { lang, onBoundary, onEnd, onError, onStart, pitch, rate, speak, text, voice, volume } = migrateDeprecatedProps(
    props,
    Say
  );
  const { ponyfill } = useContext2(Context_default);
  if (speak && !text) {
    console.warn('react-say: "speak" prop is being deprecated and renamed to "text".');
    text = speak;
  }
  const utterance = useMemo(
    () => createNativeUtterance(ponyfill, {
      lang,
      onBoundary,
      pitch,
      rate,
      text,
      voice,
      volume
    }),
    [lang, onBoundary, pitch, ponyfill, rate, text, voice, volume]
  );
  return /* @__PURE__ */ React3.createElement(SayUtterance_default, { onEnd, onError, onStart, ponyfill, utterance });
};
Say.defaultProps = {
  children: void 0,
  lang: void 0,
  onBoundary: void 0,
  onEnd: void 0,
  onError: void 0,
  onStart: void 0,
  pitch: void 0,
  rate: void 0,
  speak: void 0,
  voice: void 0,
  volume: void 0
};
Say.propTypes = {
  children: PropTypes2.any,
  lang: PropTypes2.string,
  onBoundary: PropTypes2.func,
  onEnd: PropTypes2.func,
  onError: PropTypes2.func,
  onStart: PropTypes2.func,
  pitch: PropTypes2.number,
  rate: PropTypes2.number,
  speak: PropTypes2.string,
  text: PropTypes2.string.isRequired,
  voice: PropTypes2.oneOfType([PropTypes2.any, PropTypes2.func]),
  volume: PropTypes2.number
};
var SayWithContext = ({ ponyfill, ...props }) => /* @__PURE__ */ React3.createElement(Composer_default, { ponyfill }, /* @__PURE__ */ React3.createElement(Say, { ...props }));
SayWithContext.defaultProps = {
  ...SayUtterance_default.defaultProps,
  ponyfill: void 0
};
SayWithContext.propTypes = {
  ...SayUtterance_default.propTypes,
  ponyfill: PropTypes2.shape({
    speechSynthesis: PropTypes2.any.isRequired,
    SpeechSynthesisUtterance: PropTypes2.any.isRequired
  })
};
var Say_default = SayWithContext;

// src/SayButton.jsx
import PropTypes3 from "prop-types";
import React4, { useCallback, useState } from "react";
var SayButton = (props) => {
  const { children, disabled, lang, onBoundary, onEnd, onError, onStart, pitch, ponyfill, rate, text, voice, volume } = migrateDeprecatedProps(props, SayButton);
  const [busy, setBusy] = useState(false);
  const handleClick = useCallback(() => setBusy(true));
  const sayProps = {
    lang,
    onBoundary,
    onEnd: (event) => {
      setBusy(false);
      onEnd && onEnd(event);
    },
    onError,
    onStart,
    pitch,
    ponyfill,
    rate,
    text,
    voice,
    volume
  };
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, /* @__PURE__ */ React4.createElement("button", { disabled: typeof disabled === "boolean" ? disabled : busy, onClick: handleClick }, children), busy && /* @__PURE__ */ React4.createElement(Say_default, { ...sayProps }));
};
SayButton.defaultProps = {
  children: void 0,
  disabled: void 0,
  lang: void 0,
  onBoundary: void 0,
  onEnd: void 0,
  onError: void 0,
  onStart: void 0,
  pitch: void 0,
  ponyfill: void 0,
  rate: void 0,
  text: void 0,
  voice: void 0,
  volume: void 0
};
SayButton.propTypes = {
  children: PropTypes3.any,
  disabled: PropTypes3.bool,
  lang: PropTypes3.string,
  onBoundary: PropTypes3.func,
  onEnd: PropTypes3.func,
  onError: PropTypes3.func,
  onStart: PropTypes3.func,
  pitch: PropTypes3.number,
  ponyfill: PropTypes3.shape({
    speechSynthesis: PropTypes3.any.isRequired,
    SpeechSynthesisUtterance: PropTypes3.any.isRequired
  }),
  rate: PropTypes3.number,
  text: PropTypes3.string,
  voice: PropTypes3.oneOfType([PropTypes3.any, PropTypes3.func]),
  volume: PropTypes3.number
};
var SayButton_default = SayButton;

// src/migrateDeprecatedProps.mjs
var warnings = {
  ponyfill: true,
  saySpeak: true
};
function migrateDeprecatedProps({ ponyfill, speak, speechSynthesis, speechSynthesisUtterance, text, ...otherProps }, componentType) {
  if (!ponyfill && (speechSynthesis || speechSynthesisUtterance)) {
    if (warnings.ponyfill) {
      console.warn(
        'react-say: "speechSynthesis" and "speechSynthesisUtterance" props has been renamed to "ponyfill". Please update your code. The deprecated props will be removed in version >= 3.0.0.'
      );
      warnings.ponyfill = false;
    }
    ponyfill = {
      speechSynthesis,
      SpeechSynthesisUtterance: speechSynthesisUtterance
    };
  }
  if (componentType === Say_default || componentType === SayButton_default) {
    if (speak && !text) {
      if (warnings.saySpeak) {
        console.warn(
          'react-say: "speak" prop has been renamed to "text". Please update your code. The deprecated props will be removed in version >= 3.0.0.'
        );
        warnings.saySpeak = false;
      }
      text = speak;
    }
  }
  return {
    ponyfill,
    text,
    ...otherProps
  };
}

// src/useImmediateEffect.mjs
import { useEffect as useEffect2, useRef as useRef2 } from "react";
function useImmediateEffect(fn, deps) {
  const unsubscribeRef = useRef2({
    first: true,
    id: Math.random().toString(36).substr(2, 5),
    unsubscribe: fn()
  });
  useEffect2(() => {
    const { current } = unsubscribeRef;
    if (!current.first) {
      current.unsubscribe = fn();
    } else {
      current.first = false;
    }
    return () => {
      current.unsubscribe && current.unsubscribe();
      current.unsubscribe = null;
    };
  }, deps);
}

// src/useEvent.mjs
function useEvent(target, name, listener, options) {
  useImmediateEffect(() => {
    const handler = (event) => listener && listener(event);
    target.addEventListener(name, handler, options);
    return () => {
      listener = null;
      target.removeEventListener(name, handler, options);
    };
  }, [listener, name, options, target]);
}

// src/Composer.jsx
var Composer = (props) => {
  const { children, ponyfill: ponyfillFromProps } = migrateDeprecatedProps(props, Composer);
  const { ponyfill: parentPonyfill, synthesize: parentSynthesize } = useContext3(Context_default) || {};
  const ponyfill = ponyfillFromProps || parentPonyfill || {
    speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
  };
  const synthesize = useMemo2(() => parentSynthesize || createSynthesize(), [parentSynthesize]);
  const { speechSynthesis } = ponyfill;
  const [voices, setVoices] = useState2(speechSynthesis.getVoices());
  useEvent(speechSynthesis, "voiceschanged", () => setVoices(speechSynthesis.getVoices()));
  const context = useMemo2(
    () => ({
      ponyfill,
      synthesize,
      voices
    }),
    [ponyfill, synthesize, voices]
  );
  return /* @__PURE__ */ React5.createElement(Context_default.Provider, { value: context }, typeof children === "function" ? /* @__PURE__ */ React5.createElement(Context_default.Consumer, null, (context2) => children(context2)) : children);
};
Composer.defaultProps = {
  children: void 0,
  ponyfill: void 0
};
Composer.propTypes = {
  children: PropTypes4.any,
  ponyfill: PropTypes4.shape({
    speechSynthesis: PropTypes4.any,
    SpeechSynthesisUtterance: PropTypes4.any
  })
};
var Composer_default = Composer;

// src/index.mjs
var src_default = Say_default;
export {
  Composer_default as Composer,
  Context_default as Context,
  SayButton_default as SayButton,
  SayUtterance_default as SayUtterance,
  src_default as default
};
//# sourceMappingURL=react-say.mjs.map