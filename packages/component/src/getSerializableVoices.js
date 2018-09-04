export default function (speechSynthesis) {
  return speechSynthesis.getVoices();
  // return speechSynthesis.getVoices().map(({
  //   'default': def,
  //   lang,
  //   localService,
  //   name,
  //   voiceURI
  // }) => ({
  //   'default': def,
  //   lang,
  //   localService,
  //   name,
  //   voiceURI
  // }));
}
