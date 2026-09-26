import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const svgBuffer = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function generate() {
  console.log('Generating PWA and Mobile Store icons...');

  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 Maskable PNG with 15% safe padding for Android adaptive icons
  await sharp(svgBuffer)
    .resize(435, 435)
    .extend({
      top: 38,
      bottom: 39,
      left: 38,
      right: 39,
      background: '#020617',
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple touch icon 180x180 PNG
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon 64x64 PNG
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('All icons generated successfully in public/');
}

generate().catch(console.error);
