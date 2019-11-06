import { useContext } from 'react';
import Context from './Context';

export default function useSpeak() {
  const { ponyfill, speak } = useContext(Context);

  return (utterance, progressFn) => speak(ponyfill, utterance, { onStart: progressFn && (() => progressFn()) });
}
