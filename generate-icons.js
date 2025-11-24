import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('./public/icon.svg');

// Generar iconos de diferentes tamaños
const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

Promise.all(
  sizes.map(({ size, name }) =>
    sharp(svg)
      .resize(size, size)
      .png()
      .toFile(`./public/${name}`)
  )
).then(() => {
  console.log('✅ Iconos generados correctamente');
}).catch(err => {
  console.error('Error generando iconos:', err);
});
