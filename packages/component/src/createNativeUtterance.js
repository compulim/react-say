export default function createNativeUtterance(
  {
    speechSynthesis,
    SpeechSynthesisUtterance
  },
  {
    lang,
    onBoundary,
    pitch,
    rate,
    text,
    voice,
    volume
  }
) {
  const utterance = new SpeechSynthesisUtterance(text);
  let targetVoice;

  if (typeof voice === 'function') {
    targetVoice = voice.call(speechSynthesis, speechSynthesis.getVoices());
  } else {
    const { voiceURI } = voice || {};

    targetVoice = voiceURI && [].find.call([].slice.call(speechSynthesis.getVoices()), v => v.voiceURI === voiceURI);
  }

  // Edge will mute if "lang" is set to ""
  utterance.lang = lang || '';

  if (pitch || pitch === 0) {
    utterance.pitch = pitch;
  }

  if (rate || rate === 0) {
    utterance.rate = rate;
  }

  // Cognitive Services will error when "voice" is set to "null"
  // Edge will error when "voice" is set to "undefined"
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  if (volume || volume === 0) {
    utterance.volume = volume;
  }

  // Since browser quirks, start/error/end events are emulated for best compatibility
  // start/error/end events are emulated in QueuedUtterance

  onBoundary && utterance.addEventListener('boundary', onBoundary);
  // onEnd && utterance.addEventListener('end', onEnd);
  // onError && utterance.addEventListener('error', onError);
  // onStart && utterance.addEventListener('start', onStart);

  return utterance;
}
