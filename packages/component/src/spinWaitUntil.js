import sleep from './sleep';

export default async function (predicate, interval) {
  await sleep(500);

  while (!predicate()) {
    await sleep(interval);
  }
}
