import { buildSync } from 'esbuild';
import { registerHooks } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

registerHooks({
  load(
    /** @type {string} */
    url,
    context,
    nextLoad
  ) {
    // Could be file: or node:.
    if (new URL(url).protocol === 'file:') {
      const filename = resolve(fileURLToPath(url));

      // Could be loading /node_modules/.
      if (filename.endsWith('.jsx') || filename.endsWith('.tsx')) {
        return {
          format: 'module-typescript',
          shortCircuit: true,
          source: buildSync({
            entryPoints: [filename],
            platform: 'node',
            target: 'esnext',
            write: false
          }).outputFiles[0].text
        };
      }
    }

    return nextLoad(url, context);
  }
});
