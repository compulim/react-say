// Use `has-resolved` package once it start exporting ESM.

export default function hasResolved(promise: Promise<unknown>): Promise<boolean> {
  return Promise.race<boolean>([promise.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 0))]);
}
