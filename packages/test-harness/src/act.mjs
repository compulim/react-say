/** @type {(fn: () => void) => void} */
let act;

try {
  // eslint-disable-next-line import/no-unresolved
  ({ act } = await import('@testing-library/react-hooks'));
} catch {
  ({ act } = await import('@testing-library/react'));
}

export { act };
