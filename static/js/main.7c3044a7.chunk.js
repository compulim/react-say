(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{117:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return(0,a.default)("error",{error:e})};var a=r(n(71))},118:function(e,t,n){"use strict";var r=n(40),a=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(70)),l=a(n(41)),c=r(n(0)),i=a(n(43)),u=a(n(66)),s=function e(t){var n=(0,i.default)(t,e),r=n.children,a=n.disabled,l=n.lang,s=n.onBoundary,d=n.onEnd,f=n.onError,p=n.onStart,h=n.pitch,v=n.ponyfill,y=n.rate,m=n.text,b=n.voice,E=n.volume,S=(0,c.useState)(!1),g=(0,o.default)(S,2),w=g[0],O=g[1],k=(0,c.useCallback)(function(){return O(!0)}),j={lang:l,onBoundary:s,onEnd:function(e){O(!1),d&&d(e)},onError:f,onStart:p,pitch:h,ponyfill:v,rate:y,text:m,voice:b,volume:E};return c.default.createElement(c.default.Fragment,null,c.default.createElement("button",{disabled:"boolean"===typeof a?a:w,onClick:k},r),w&&c.default.createElement(u.default,j))};s.defaultProps={children:void 0,disabled:void 0,lang:void 0,onBoundary:void 0,onEnd:void 0,onError:void 0,onStart:void 0,pitch:void 0,ponyfill:void 0,rate:void 0,text:void 0,voice:void 0,volume:void 0},s.propTypes={children:l.default.any,disabled:l.default.bool,lang:l.default.string,onBoundary:l.default.func,onEnd:l.default.func,onError:l.default.func,onStart:l.default.func,pitch:l.default.number,ponyfill:l.default.shape({speechSynthesis:l.default.any.isRequired,SpeechSynthesisUtterance:l.default.any.isRequired}),rate:l.default.number,text:l.default.string,voice:l.default.oneOfType([l.default.any,l.default.func]),volume:l.default.number};var d=s;t.default=d},119:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n,r=e.speechSynthesis,a=e.SpeechSynthesisUtterance,o=t.lang,l=t.onBoundary,c=t.pitch,i=t.rate,u=t.text,s=t.voice,d=t.volume,f=new a(u);if("function"===typeof s)n=s.call(r,r.getVoices());else{var p=s||{},h=p.voiceURI;n=h&&[].find.call([].slice.call(r.getVoices()),function(e){return e.voiceURI===h})}f.lang=o||"",(c||0===c)&&(f.pitch=c);(i||0===i)&&(f.rate=i);n&&(f.voice=n);(d||0===d)&&(f.volume=d);return l&&f.addEventListener("boundary",l),f}},120:function(e,t,n){"use strict";var r=n(40),a=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(67)),l=a(n(68)),c=a(n(41)),i=r(n(0)),u=a(n(69)),s=a(n(71)),d=a(n(117)),f=a(n(43)),p=a(n(310));function h(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function v(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?h(n,!0).forEach(function(t){(0,o.default)(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):h(n).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var y=function(e){var t=(0,f.default)(e),n=t.onEnd,r=t.onError,a=t.onStart,o=t.utterance,l=(0,i.useRef)(!1),c=(0,p.default)();return(0,i.useEffect)(function(){if(l.current)return console.warn("react-say: Should not change utterance after synthesis started.");var e,t=c(o,function(){l.current=!0,!e&&a&&a((0,s.default)("start"))}),i=t.cancel;return t.promise.then(function(){return!e&&n&&n((0,s.default)("end"))},function(t){return!e&&r&&r((0,d.default)(t))}),function(){e=!0,i()}},[]),!1};y.defaultProps={onEnd:void 0,onError:void 0,onStart:void 0},y.propTypes={onEnd:c.default.func,onError:c.default.func,onStart:c.default.func};var m=function(e){var t=e.ponyfill,n=(0,l.default)(e,["ponyfill"]);return i.default.createElement(u.default,{ponyfill:t},i.default.createElement(y,n))};m.defaultProps=v({},y.defaultProps,{ponyfill:void 0}),m.propTypes=v({},y.propTypes,{ponyfill:c.default.shape({speechSynthesis:c.default.any.isRequired,SpeechSynthesisUtterance:c.default.any.isRequired})});var b=m;t.default=b},128:function(e,t,n){e.exports=n(311)},19:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"Composer",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(t,"Context",{enumerable:!0,get:function(){return l.default}}),Object.defineProperty(t,"SayButton",{enumerable:!0,get:function(){return c.default}}),Object.defineProperty(t,"SayUtterance",{enumerable:!0,get:function(){return i.default}}),t.default=void 0;var a=r(n(66)),o=r(n(69)),l=r(n(42)),c=r(n(118)),i=r(n(120)),u=a.default;t.default=u},298:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){var e,t=[];return function(n,r){var c=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=c.onEnd,u=c.onError,s=c.onStart;if(!(r instanceof n.SpeechSynthesisUtterance))throw new Error("utterance must be instance of the ponyfill");var d=new l.default(n,r,{onEnd:i,onError:u,onStart:s});return t=[].concat((0,a.default)(t),[d]),o.default.async(function(n){for(;;)switch(n.prev=n.next){case 0:if(!e){n.next=2;break}return n.abrupt("return");case 2:return e=!0,n.prev=3,n.next=6,o.default.awrap(function(){var e;return o.default.async(function(n){for(;;)switch(n.prev=n.next){case 0:if(!(e=t[0])){n.next=12;break}return n.prev=1,n.next=4,o.default.awrap(e.speak());case 4:n.next=9;break;case 6:n.prev=6,n.t0=n.catch(1),"cancelled"!==n.t0.message&&console.error(n.t0);case 9:t=t.filter(function(t){return t!==e}),n.next=0;break;case 12:case"end":return n.stop()}},null,null,[[1,6]])}());case 6:return n.prev=6,e=!1,n.finish(6);case 9:case"end":return n.stop()}},null,null,[[3,,6,9]]),{cancel:function(){return d.cancel()},promise:d.promise}}};var a=r(n(299)),o=r(n(116)),l=r(n(304))},304:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var a=r(n(305)),o=r(n(306)),l=r(n(116)),c=r(n(71)),i=r(n(307)),u=r(n(117));function s(e,t,n){var r,a,o,c,u,s,d,f;return l.default.async(function(p){for(;;)switch(p.prev=p.next){case 0:return r=e.speechSynthesis,a=(0,i.default)(),o=(0,i.default)(),c=(0,i.default)(),t.addEventListener("end",c.resolve),t.addEventListener("error",o.resolve),t.addEventListener("start",a.resolve),r.speak(t),p.next=10,l.default.awrap(Promise.race([o.promise,a.promise]));case 10:if("error"!==(u=p.sent).type){p.next=13;break}throw u.error;case 13:return d=Promise.race([o.promise,c.promise]),n&&n(function(){return l.default.async(function(e){for(;;)switch(e.prev=e.next){case 0:if(s){e.next=4;break}return r.cancel(),e.next=4,l.default.awrap(d);case 4:case"end":return e.stop()}})}),p.next=17,l.default.awrap(d);case 17:if(f=p.sent,s=!0,"error"!==f.type){p.next=21;break}throw f.error;case 21:case"end":return p.stop()}})}var d=function(){function e(t,n,r){var o=r.onEnd,l=r.onError,c=r.onStart;(0,a.default)(this,e),this._cancelled=!1,this._deferred=(0,i.default)(),this._onEnd=o,this._onError=l,this._onStart=c,this._ponyfill=t,this._speaking=!1,this._utterance=n,this.promise=this._deferred.promise}return(0,o.default)(e,[{key:"cancel",value:function(){return l.default.async(function(e){for(;;)switch(e.prev=e.next){case 0:if(this._cancelled=!0,e.t0=this._cancel,!e.t0){e.next=5;break}return e.next=5,l.default.awrap(this._cancel());case 5:case"end":return e.stop()}},null,this)}},{key:"speak",value:function(){var e=this;return this._speaking&&console.warn("ASSERTION: QueuedUtterance is already speaking or has spoken."),this._speaking=!0,l.default.async(function(t){for(;;)switch(t.prev=t.next){case 0:if(!e._cancelled){t.next=2;break}throw new Error("cancelled");case 2:return t.next=4,l.default.awrap(s(e._ponyfill,e._utterance,function(t){if(e._cancelled)throw t(),new Error("cancelled");e._cancel=t,e._onStart&&e._onStart((0,c.default)("start"))}));case 4:if(!e._cancelled){t.next=6;break}throw new Error("cancelled");case 6:case"end":return t.stop()}}).then(function(){e._onEnd&&e._onEnd((0,c.default)("end")),e._deferred.resolve()},function(t){e._onError&&e._onError((0,u.default)(t)),e._deferred.reject(t)}),this.promise}}]),e}();t.default=d},307:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){var e,t,n=new Promise(function(n,r){e=r,t=n});if(!e||!t)throw new Error("Promise is not a ES-compliant and do not run exector immediately");return{promise:n,reject:e,resolve:t}}},308:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,n,r){(0,a.default)(function(){var a=function(e){return n&&n(e)};return e.addEventListener(t,a,r),function(){n=null,e.removeEventListener(t,a,r)}},[n,t,r,e])};var a=r(n(309))},309:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=(0,r.useRef)({first:!0,id:Math.random().toString(36).substr(2,5),unsubscribe:e()});(0,r.useEffect)(function(){var t=n.current;return t.first?t.first=!1:t.unsubscribe=e(),function(){t.unsubscribe&&t.unsubscribe(),t.unsubscribe=null}},t)};var r=n(0)},310:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){var e=(0,a.useContext)(o.default),t=e.ponyfill,n=e.synthesize;return function(e,r){return"string"===typeof e&&(e=(0,l.default)(t,{text:e})),n(t,e,{onStart:r&&function(){return r()}})}};var a=n(0),o=r(n(42)),l=r(n(119))},311:function(e,t,n){"use strict";n.r(t);n(129),n(152);var r=n(0),a=n.n(r),o=n(121),l=n.n(o),c=n(72),i=n(122),u=n(123),s=n(126),d=n(124),f=n(4),p=n(127),h=n(125),v=n(31),y=n(19),m=n.n(y),b=Object(h.css)({display:"flex","& > section":{flex:1}}),E=["A quick brown fox","jumped over","the lazy dogs","A quick brown fox jumped over the lazy dogs."],S=function(e){function t(e){var n;Object(i.a)(this,t),(n=Object(s.a)(this,Object(d.a)(t).call(this,e))).handleAddClick=n.handleAddClick.bind(Object(f.a)(n)),n.handleBingSpeechKeyChange=n.handleBingSpeechKeyChange.bind(Object(f.a)(n)),n.handleBingSpeechKeySubmit=n.handleBingSpeechKeySubmit.bind(Object(f.a)(n)),n.handleClearBingSpeechKey=n.handleClearBingSpeechKey.bind(Object(f.a)(n)),n.handleRemoveFromQueue=n.handleRemoveFromQueue.bind(Object(f.a)(n)),n.handleSayEnd=n.handleRemoveFromQueue.bind(Object(f.a)(n)),n.handleSayUtteranceClick=n.handleSayUtteranceClick.bind(Object(f.a)(n)),n.handleSelectedVoiceChange=n.handleSelectedVoiceChange.bind(Object(f.a)(n)),n.selectCantoneseVoice=n.selectLocalizedVoice.bind(Object(f.a)(n),"zh-HK"),n.selectJapaneseVoice=n.selectLocalizedVoice.bind(Object(f.a)(n),"ja-JP"),n.selectVoice=n.selectVoice.bind(Object(f.a)(n));var r=new URLSearchParams(window.location.search).get("s"),a={speechSynthesis:window.speechSynthesis||window.webkitSpeechSynthesis,SpeechSynthesisUtterance:window.SpeechSynthesisUtterance||window.webkitSpeechSynthesisUtterance};return r&&(a={speechSynthesis:v.speechSynthesis,SpeechSynthesisUtterance:v.SpeechSynthesisUtterance},v.speechSynthesis.speechToken=new v.SubscriptionKey(r)),n.state={bingSpeechKey:r,ponyfill:a,queued:[],selectedVoiceURI:null},n}return Object(p.a)(t,e),Object(u.a)(t,[{key:"handleAddClick",value:function(e,t,n){var r=Date.now()+Math.random();this.setState(function(a){var o=a.queued;return{queued:[].concat(Object(c.a)(o),[{id:r,pitch:t,rate:n,text:e}])}})}},{key:"handleBingSpeechKeyChange",value:function(e){var t=e.target.value;this.setState(function(){return{bingSpeechKey:t}})}},{key:"handleBingSpeechKeySubmit",value:function(e){e.preventDefault(),window.location.href="?s=".concat(encodeURIComponent(this.state.bingSpeechKey))}},{key:"handleClearBingSpeechKey",value:function(){this.setState(function(){return{bingSpeechKey:""}})}},{key:"handleRemoveFromQueue",value:function(e){this.setState(function(t){return{queued:t.queued.filter(function(t){return t.id!==e})}})}},{key:"handleSayUtteranceClick",value:function(e){var t=this.state.ponyfill.SpeechSynthesisUtterance;this.setState(function(n){var r=n.queued;return{queued:[].concat(Object(c.a)(r),[{id:Math.random(),text:e,utterance:new t(e)}])}})}},{key:"handleSelectedVoiceChange",value:function(e){var t=e.target.value;this.setState(function(){return{selectedVoiceURI:t}})}},{key:"selectVoice",value:function(e){var t=this.state.selectedVoiceURI;return e.find(function(e){return e.voiceURI===t})||e.find(function(e){return e.lang===window.navigator.language})}},{key:"selectLocalizedVoice",value:function(e,t){var n=this.state.selectedVoiceURI,r=t.find(function(e){return e.voiceURI===n});return r&&r.lang===e?r:t.find(function(t){return t.lang===e})}},{key:"render",value:function(){var e=this,t=this.state;return a.a.createElement(y.Composer,{ponyfill:t.ponyfill},function(n){var r=n.voices;return a.a.createElement("div",{className:b},a.a.createElement("section",{className:"words"},a.a.createElement("article",null,a.a.createElement("header",null,a.a.createElement("h1",null,"Words")),a.a.createElement("ul",null,E.map(function(t){return a.a.createElement("li",{key:t},a.a.createElement("button",{onClick:e.handleAddClick.bind(null,t,1,1)},a.a.createElement("span",{role:"img","aria-label":"say"},"\ud83d\udcac")),a.a.createElement("button",{onClick:e.handleAddClick.bind(null,t,2,1)},a.a.createElement("span",{role:"img","aria-label":"high pitch"},"\ud83d\udcc8")),a.a.createElement("button",{onClick:e.handleAddClick.bind(null,t,.5,1)},a.a.createElement("span",{role:"img","aria-label":"low pitch"},"\ud83d\udcc9")),a.a.createElement("button",{onClick:e.handleAddClick.bind(null,t,1,2)},a.a.createElement("span",{role:"img","aria-label":"fast"},"\ud83d\udc07")),a.a.createElement("button",{onClick:e.handleAddClick.bind(null,t,1,.5)},a.a.createElement("span",{role:"img","aria-label":"slow"},"\ud83d\udc22")),"\xa0",t)}))),a.a.createElement("article",null,a.a.createElement("header",null,a.a.createElement("h1",null,"Say button")),a.a.createElement("ul",null,E.map(function(t){return a.a.createElement("li",{key:t},a.a.createElement(y.SayButton,{text:t,voice:e.selectVoice},t))}))),a.a.createElement("article",null,a.a.createElement("header",null,a.a.createElement("h1",null,"Say utterance")),a.a.createElement("ul",null,E.map(function(t){return a.a.createElement("li",{key:t},a.a.createElement("button",{onClick:e.handleSayUtteranceClick.bind(null,t)},t))}))),a.a.createElement("article",null,a.a.createElement("header",null,a.a.createElement("h1",null,"Other languages")),a.a.createElement("ul",null,a.a.createElement("li",null,a.a.createElement(y.SayButton,{text:"\u4e00\u65bc\u8a18\u4f4f\u4e00\u65bc\u8a18\u4f4f\u6bcf\u5929\u5411\u524d\u671b",voice:e.selectCantoneseVoice},"\u4e00\u65bc\u8a18\u4f4f\u4e00\u65bc\u8a18\u4f4f\u6bcf\u5929\u5411\u524d\u671b")),a.a.createElement("li",null,a.a.createElement(y.SayButton,{text:"\u304a\u8a95\u751f\u65e5\u304a\u3081\u3067\u3068\u3046",voice:e.selectJapaneseVoice},"\u304a\u8a95\u751f\u65e5\u304a\u3081\u3067\u3068\u3046"))))),a.a.createElement("section",{className:"queue"},a.a.createElement("article",null,a.a.createElement("header",null,a.a.createElement("h1",null,"Queue")),t.queued.length?a.a.createElement("ul",null,t.queued.map(function(t){var n=t.id,r=t.pitch,o=t.rate,l=t.text,c=t.utterance;return a.a.createElement("li",{key:n},a.a.createElement("button",{onClick:e.handleRemoveFromQueue.bind(null,n)},"\xd7"),"\xa0",a.a.createElement("span",null,l),c?a.a.createElement(a.a.Fragment,null,a.a.createElement("span",null,"\xa0(Utterance)"),a.a.createElement(y.SayUtterance,{onEnd:e.handleSayEnd.bind(null,n),utterance:c})):a.a.createElement(m.a,{onEnd:e.handleSayEnd.bind(null,n),pitch:r,rate:o,text:l,voice:e.selectVoice}))})):a.a.createElement("div",null,"Nothing queued")),a.a.createElement("article",null,a.a.createElement("header",null,a.a.createElement("h1",null,"Available voices")),a.a.createElement("select",{onChange:e.handleSelectedVoiceChange,value:t.selectedVoiceURI||""},a.a.createElement("option",null,"Browser language default (",window.navigator.language,")"),r.map(function(e){var t=e.lang,n=e.name,r=e.voiceURI;return a.a.createElement("option",{key:r,value:r},"[".concat(t,"] ").concat(n||r))}))),a.a.createElement("article",null,a.a.createElement("header",null,a.a.createElement("h1",null,"Other services")),a.a.createElement("form",{onSubmit:e.handleBingSpeechKeySubmit},a.a.createElement("p",null,a.a.createElement("label",null,"Bing Speech key",a.a.createElement("input",{onChange:e.handleBingSpeechKeyChange,type:"text",value:t.bingSpeechKey||""}),a.a.createElement("button",{onClick:e.handleClearBingSpeechKey,type:"button"},"\xd7"))),a.a.createElement("p",null,a.a.createElement("button",null,"Save"))))))})}}]),t}(a.a.Component),g=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function w(e){navigator.serviceWorker.register(e).then(function(e){e.onupdatefound=function(){var t=e.installing;t.onstatechange=function(){"installed"===t.state&&(navigator.serviceWorker.controller?console.log("New content is available; please refresh."):console.log("Content is cached for offline use."))}}}).catch(function(e){console.error("Error during service worker registration:",e)})}l.a.render(a.a.createElement(S,null),document.getElementById("root")),function(){if("serviceWorker"in navigator){if(new URL("/react-say",window.location).origin!==window.location.origin)return;window.addEventListener("load",function(){var e="".concat("/react-say","/service-worker.js");g?(function(e){fetch(e).then(function(t){404===t.status||-1===t.headers.get("content-type").indexOf("javascript")?navigator.serviceWorker.ready.then(function(e){e.unregister().then(function(){window.location.reload()})}):w(e)}).catch(function(){console.log("No internet connection found. App is running in offline mode.")})}(e),navigator.serviceWorker.ready.then(function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://goo.gl/SC7cgQ")})):w(e)})}}()},42:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var a=r(n(0)).default.createContext();t.default=a},43:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=e.ponyfill,r=e.speak,s=e.speechSynthesis,d=e.speechSynthesisUtterance,f=e.text,p=(0,o.default)(e,["ponyfill","speak","speechSynthesis","speechSynthesisUtterance","text"]);n||!s&&!d||(u.ponyfill&&(console.warn('react-say: "speechSynthesis" and "speechSynthesisUtterance" props has been renamed to "ponyfill". Please update your code. The deprecated props will be removed in version >= 3.0.0.'),u.ponyfill=!1),n={speechSynthesis:s,SpeechSynthesisUtterance:d});t!==l.default&&t!==c.default||r&&!f&&(u.saySpeak&&(console.warn('react-say: "speak" prop has been renamed to "text". Please update your code. The deprecated props will be removed in version >= 3.0.0.'),u.saySpeak=!1),f=r);return function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(n,!0).forEach(function(t){(0,a.default)(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(n).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}({ponyfill:n,text:f},p)};var a=r(n(67)),o=r(n(68)),l=r(n(66)),c=r(n(118));function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}var u={ponyfill:!0,saySpeak:!0}},66:function(e,t,n){"use strict";var r=n(40),a=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(67)),l=a(n(68)),c=a(n(292)),i=a(n(41)),u=r(n(0)),s=a(n(69)),d=a(n(42)),f=a(n(119)),p=a(n(43)),h=a(n(120));function v(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function y(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?v(n,!0).forEach(function(t){(0,o.default)(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):v(n).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}var m=function e(t){var n=(0,p.default)(t,e),r=n.lang,a=n.onBoundary,o=n.onEnd,l=n.onError,i=n.onStart,s=n.pitch,v=n.rate,y=n.speak,m=n.text,b=n.voice,E=n.volume,S=(0,u.useContext)(d.default).ponyfill;y&&!m&&(console.warn('react-say: "speak" prop is being deprecated and renamed to "text".'),(0,c.default)("text"),m=y);var g=(0,u.useMemo)(function(){return(0,f.default)(S,{lang:r,onBoundary:a,pitch:s,rate:v,text:m,voice:b,volume:E})},[r,a,s,S,v,m,b,E]);return u.default.createElement(h.default,{onEnd:o,onError:l,onStart:i,ponyfill:S,utterance:g})};m.defaultProps={children:void 0,lang:void 0,onBoundary:void 0,onEnd:void 0,onError:void 0,onStart:void 0,pitch:void 0,rate:void 0,speak:void 0,voice:void 0,volume:void 0},m.propTypes={children:i.default.any,lang:i.default.string,onBoundary:i.default.func,onEnd:i.default.func,onError:i.default.func,onStart:i.default.func,pitch:i.default.number,rate:i.default.number,speak:i.default.string,text:i.default.string.isRequired,voice:i.default.oneOfType([i.default.any,i.default.func]),volume:i.default.number};var b=function(e){var t=e.ponyfill,n=(0,l.default)(e,["ponyfill"]);return u.default.createElement(s.default,{ponyfill:t},u.default.createElement(m,n))};b.defaultProps=y({},h.default.defaultProps,{ponyfill:void 0}),b.propTypes=y({},h.default.propTypes,{ponyfill:i.default.shape({speechSynthesis:i.default.any.isRequired,SpeechSynthesisUtterance:i.default.any.isRequired})});var E=b;t.default=E},69:function(e,t,n){"use strict";var r=n(40),a=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=a(n(70)),l=a(n(41)),c=r(n(0)),i=a(n(42)),u=a(n(298)),s=a(n(43)),d=a(n(308)),f=function e(t){var n=(0,s.default)(t,e),r=n.children,a=n.ponyfill,l=(0,c.useContext)(i.default)||{},f=l.ponyfill,p=l.synthesize,h=a||f||{speechSynthesis:window.speechSynthesis||window.webkitSpeechSynthesis,SpeechSynthesisUtterance:window.SpeechSynthesisUtterance||window.webkitSpeechSynthesisUtterance},v=(0,c.useMemo)(function(){return p||(0,u.default)()},[p]),y=h.speechSynthesis,m=(0,c.useState)(y.getVoices()),b=(0,o.default)(m,2),E=b[0],S=b[1];(0,d.default)(y,"voiceschanged",function(){return S(y.getVoices())});var g=(0,c.useMemo)(function(){return{ponyfill:h,synthesize:v,voices:E}},[h,v,E]);return c.default.createElement(i.default.Provider,{value:g},"function"===typeof r?c.default.createElement(i.default.Consumer,null,function(e){return r(e)}):r)};f.defaultProps={children:void 0,ponyfill:void 0},f.propTypes={children:l.default.any,ponyfill:l.default.shape({speechSynthesis:l.default.any,SpeechSynthesisUtterance:l.default.any})};var p=f;t.default=p},71:function(e,t,n){"use strict";var r=n(6);Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){if("error"===e){if("function"===typeof ErrorEvent)return new ErrorEvent(e,t)}else if("function"===typeof CustomEvent)return new CustomEvent(e,t);var n=document.createEvent("Event");return n.initEvent(e,!0,!0),Object.entries(t||{}).forEach(function(e){var t=(0,a.default)(e,2),r=t[0],o=t[1];n[r]=o}),n};var a=r(n(70))}},[[128,1,2]]]);
//# sourceMappingURL=main.7c3044a7.chunk.js.map