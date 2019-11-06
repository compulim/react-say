export default function createErrorEvent(error) {
  const event = new Event('error');

  event.error = error;

  return event;
}
