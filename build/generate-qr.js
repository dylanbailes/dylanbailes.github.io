import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { site } from '../src/config.js';

const directory = new URL('../public/assets/qr/', import.meta.url);
await mkdir(directory, { recursive: true });
const destinations = {
  portfolio: `${site.meta.url}/`,
  resume: new URL(site.cvUrl, `${site.meta.url}/`).href,
};

for (const [name, url] of Object.entries(destinations)) {
  const options = { errorCorrectionLevel: 'Q', margin: 4, width: 512,
    color: { dark: '#000000ff', light: '#ffffffff' } };
  await QRCode.toFile(fileURLToPath(new URL(`${name}.svg`, directory)), url, options);
  await QRCode.toFile(fileURLToPath(new URL(`${name}.png`, directory)), url, options);
}
console.log('Generated portfolio and résumé QR codes.');
