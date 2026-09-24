import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Standard 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('✓ Generated public/pwa-192x192.png');

  // 2. Standard 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('✓ Generated public/pwa-512x512.png');

  // 3. Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✓ Generated public/apple-touch-icon.png');

  // 4. Favicon 64x64
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.png');
  console.log('✓ Generated public/favicon.png');

  // 5. Maskable Icon 512x512 (with 15% safe zone padding on background)
  const innerSize = Math.round(512 * 0.76); // ~390px
  const innerResized = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 74, g: 0, b: 18, alpha: 1 } // #4A0012
    }
  })
    .composite([
      {
        input: innerResized,
        gravity: 'center'
      }
    ])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('✓ Generated public/pwa-maskable-512x512.png');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
