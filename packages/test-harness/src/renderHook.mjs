/** @type {<T, P>(render: (props: P) => T, options?: { initialProps: P }) => { rerender: (props: P) => void; result: { current: T } }} */
let renderHook;

try {
  // eslint-disable-next-line import/no-unresolved
  ({ renderHook } = await import('@testing-library/react-hooks'));
} catch {
  ({ renderHook } = await import('@testing-library/react'));
}

export { renderHook };
