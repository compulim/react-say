import createCustomEvent from './createCustomEvent.mjs';

export default function createErrorEvent(error) {
  return createCustomEvent('error', { error });
}
