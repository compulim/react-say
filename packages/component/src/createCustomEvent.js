export default function createCustomEvent(name, eventInitDict) {
  if (typeof CustomEvent === 'function') {
    return new CustomEvent(name, eventInitDict);
  }

  const event = document.createEvent('Event');

  event.initEvent(name, true, true);

  Object.entries(eventInitDict).forEach(([key, value]) => {
    event[key] = value;
  });

  return event;
}
