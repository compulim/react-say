import sleep from './sleep';

export default function timeout(ms) {
  return sleep(ms).then(() => Promise.reject(new Error('timed out')));
}
