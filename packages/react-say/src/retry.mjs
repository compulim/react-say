import sleep from './sleep.mjs';

export default async function retry(fn, numRetries, interval) {
  let lastError;

  for (let times = 0; times < numRetries; times++) {
    if (times) {
      await sleep(interval);
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
