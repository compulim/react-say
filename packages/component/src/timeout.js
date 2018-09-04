export default function (ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), ms));
}
