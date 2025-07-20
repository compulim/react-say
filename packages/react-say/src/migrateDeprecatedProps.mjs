import Say from './Say.jsx';
import SayButton from './SayButton.jsx';

const warnings = {
  ponyfill: true,
  saySpeak: true
};

export default function migrateDeprecatedProps(
  { ponyfill, speak, speechSynthesis, speechSynthesisUtterance, text, ...otherProps },
  componentType
) {
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

  if (componentType === Say || componentType === SayButton) {
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
