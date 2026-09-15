import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

// Ensure clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy static assets into dist
const assetsToCopy = ['index.html', 'css', 'images', 'js', 'documents'];

for (const asset of assetsToCopy) {
  if (fs.existsSync(asset)) {
    fs.cpSync(asset, path.join(distDir, asset), { recursive: true });
    console.log(`Copied ${asset} -> dist/${asset}`);
  }
}

console.log('Build completed successfully.');
