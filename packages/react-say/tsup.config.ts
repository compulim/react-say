import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      'react-say': './src/index.mjs'
    },
    format: ['cjs', 'esm'],
    sourcemap: true,
    target: 'esnext',

    // Remove the followings after we ported to TypeScript.
    loader: { '.js': 'jsx' }
  }
]);
