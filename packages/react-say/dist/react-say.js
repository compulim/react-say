"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.mjs
var src_exports = {};
__export(src_exports, {
  Composer: () => Composer_default,
  Context: () => Context_default,
  SayButton: () => SayButton_default,
  SayUtterance: () => SayUtterance_default,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// src/Composer.jsx
var import_prop_types4 = __toESM(require("prop-types"));
var import_react7 = __toESM(require("react"));

// src/Context.mjs
var import_react = __toESM(require("react"), 1);
var Context = import_react.default.createContext();
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
var import_prop_types2 = __toESM(require("prop-types"));
var import_react4 = __toESM(require("react"));

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
var import_prop_types = __toESM(require("prop-types"));
var import_react3 = __toESM(require("react"));

// src/useSynthesize.mjs
var import_react2 = require("react");
function useSynthesize() {
  const { ponyfill, synthesize } = (0, import_react2.useContext)(Context_default);
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
  const started = (0, import_react3.useRef)(false);
  const synthesize = useSynthesize();
  (0, import_react3.useEffect)(() => {
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
  onEnd: import_prop_types.default.func,
  onError: import_prop_types.default.func,
  onStart: import_prop_types.default.func
};
var SayUtteranceWithContext = ({ ponyfill, ...props }) => /* @__PURE__ */ import_react3.default.createElement(Composer_default, { ponyfill }, /* @__PURE__ */ import_react3.default.createElement(SayUtterance, { ...props }));
SayUtteranceWithContext.defaultProps = {
  ...SayUtterance.defaultProps,
  ponyfill: void 0
};
SayUtteranceWithContext.propTypes = {
  ...SayUtterance.propTypes,
  ponyfill: import_prop_types.default.shape({
    speechSynthesis: import_prop_types.default.any.isRequired,
    SpeechSynthesisUtterance: import_prop_types.default.any.isRequired
  })
};
var SayUtterance_default = SayUtteranceWithContext;

// src/Say.jsx
var Say = (props) => {
  let { lang, onBoundary, onEnd, onError, onStart, pitch, rate, speak, text, voice, volume } = migrateDeprecatedProps(
    props,
    Say
  );
  const { ponyfill } = (0, import_react4.useContext)(Context_default);
  if (speak && !text) {
    console.warn('react-say: "speak" prop is being deprecated and renamed to "text".');
    text = speak;
  }
  const utterance = (0, import_react4.useMemo)(
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
  return /* @__PURE__ */ import_react4.default.createElement(SayUtterance_default, { onEnd, onError, onStart, ponyfill, utterance });
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
  children: import_prop_types2.default.any,
  lang: import_prop_types2.default.string,
  onBoundary: import_prop_types2.default.func,
  onEnd: import_prop_types2.default.func,
  onError: import_prop_types2.default.func,
  onStart: import_prop_types2.default.func,
  pitch: import_prop_types2.default.number,
  rate: import_prop_types2.default.number,
  speak: import_prop_types2.default.string,
  text: import_prop_types2.default.string.isRequired,
  voice: import_prop_types2.default.oneOfType([import_prop_types2.default.any, import_prop_types2.default.func]),
  volume: import_prop_types2.default.number
};
var SayWithContext = ({ ponyfill, ...props }) => /* @__PURE__ */ import_react4.default.createElement(Composer_default, { ponyfill }, /* @__PURE__ */ import_react4.default.createElement(Say, { ...props }));
SayWithContext.defaultProps = {
  ...SayUtterance_default.defaultProps,
  ponyfill: void 0
};
SayWithContext.propTypes = {
  ...SayUtterance_default.propTypes,
  ponyfill: import_prop_types2.default.shape({
    speechSynthesis: import_prop_types2.default.any.isRequired,
    SpeechSynthesisUtterance: import_prop_types2.default.any.isRequired
  })
};
var Say_default = SayWithContext;

// src/SayButton.jsx
var import_prop_types3 = __toESM(require("prop-types"));
var import_react5 = __toESM(require("react"));
var SayButton = (props) => {
  const { children, disabled, lang, onBoundary, onEnd, onError, onStart, pitch, ponyfill, rate, text, voice, volume } = migrateDeprecatedProps(props, SayButton);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const handleClick = (0, import_react5.useCallback)(() => setBusy(true));
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
  return /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("button", { disabled: typeof disabled === "boolean" ? disabled : busy, onClick: handleClick }, children), busy && /* @__PURE__ */ import_react5.default.createElement(Say_default, { ...sayProps }));
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
  children: import_prop_types3.default.any,
  disabled: import_prop_types3.default.bool,
  lang: import_prop_types3.default.string,
  onBoundary: import_prop_types3.default.func,
  onEnd: import_prop_types3.default.func,
  onError: import_prop_types3.default.func,
  onStart: import_prop_types3.default.func,
  pitch: import_prop_types3.default.number,
  ponyfill: import_prop_types3.default.shape({
    speechSynthesis: import_prop_types3.default.any.isRequired,
    SpeechSynthesisUtterance: import_prop_types3.default.any.isRequired
  }),
  rate: import_prop_types3.default.number,
  text: import_prop_types3.default.string,
  voice: import_prop_types3.default.oneOfType([import_prop_types3.default.any, import_prop_types3.default.func]),
  volume: import_prop_types3.default.number
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
var import_react6 = require("react");
function useImmediateEffect(fn, deps) {
  const unsubscribeRef = (0, import_react6.useRef)({
    first: true,
    id: Math.random().toString(36).substr(2, 5),
    unsubscribe: fn()
  });
  (0, import_react6.useEffect)(() => {
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
  const { ponyfill: parentPonyfill, synthesize: parentSynthesize } = (0, import_react7.useContext)(Context_default) || {};
  const ponyfill = ponyfillFromProps || parentPonyfill || {
    speechSynthesis: window.speechSynthesis || window.webkitSpeechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance
  };
  const synthesize = (0, import_react7.useMemo)(() => parentSynthesize || createSynthesize(), [parentSynthesize]);
  const { speechSynthesis } = ponyfill;
  const [voices, setVoices] = (0, import_react7.useState)(speechSynthesis.getVoices());
  useEvent(speechSynthesis, "voiceschanged", () => setVoices(speechSynthesis.getVoices()));
  const context = (0, import_react7.useMemo)(
    () => ({
      ponyfill,
      synthesize,
      voices
    }),
    [ponyfill, synthesize, voices]
  );
  return /* @__PURE__ */ import_react7.default.createElement(Context_default.Provider, { value: context }, typeof children === "function" ? /* @__PURE__ */ import_react7.default.createElement(Context_default.Consumer, null, (context2) => children(context2)) : children);
};
Composer.defaultProps = {
  children: void 0,
  ponyfill: void 0
};
Composer.propTypes = {
  children: import_prop_types4.default.any,
  ponyfill: import_prop_types4.default.shape({
    speechSynthesis: import_prop_types4.default.any,
    SpeechSynthesisUtterance: import_prop_types4.default.any
  })
};
var Composer_default = Composer;

// src/index.mjs
var src_default = Say_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Composer,
  Context,
  SayButton,
  SayUtterance
});
//# sourceMappingURL=react-say.js.map