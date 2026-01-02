declare const renderHook: <T, P>(
  render: (props: P) => T,
  options?: { initialProps: P }
) => { rerender: (props: P) => void; result: { current: T } };

export { renderHook };
