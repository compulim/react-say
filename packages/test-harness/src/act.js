/** @type {(fn: () => void) => void} */
let act;

try {
  // eslint-disable-next-line import/no-unresolved
  ({ act } = require('@testing-library/react-hooks'));
} catch {
  ({ act } = require('@testing-library/react'));
}

module.exports = { act };
