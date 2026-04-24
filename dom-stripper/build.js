import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.js'], // Crucial: point to the src folder
  bundle: true,
  minify: false, // Keep false for now so you can debug the code
  format: 'iife',
  globalName: 'Kintsugi',
  outfile: 'dist/bundle.iife.js',
  platform: 'browser',
  target: 'chrome110',
  // This footer ensures the functions are accessible via Kintsugi.extractStrippedDOM()
  footer: { js: 'window.Kintsugi = Kintsugi;' }
}).catch(() => process.exit(1));

console.log('Bundle ready: dist/bundle.iife.js');