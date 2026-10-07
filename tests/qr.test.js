import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { site } from '../src/config.js';

for (const [name, url] of Object.entries({
  portfolio: `${site.meta.url}/`,
  resume: new URL(site.cvUrl, `${site.meta.url}/`).href,
  linkedin: site.contact.socials.find(social => social.name === 'LinkedIn').url,
})) {
  test(`${name} QR decodes to the published destination`, () => {
    const png = PNG.sync.read(readFileSync(resolve(`dist/assets/qr/${name}.png`)));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.ok(decoded, 'QR image must scan');
    assert.equal(decoded.data, url);
    assert.ok(existsSync(resolve(`dist/assets/qr/${name}.svg`)));
  });
}

test('recruiters can reach the portfolio and download the résumé without JavaScript', () => {
  const html = readFileSync(resolve('dist/qr.html'), 'utf8');
  assert.match(html, /href="index.html"[^>]*>View portfolio/);
  assert.ok(html.includes(`href="${site.cvUrl}" download="Dylan-Bailes-Resume.pdf"`));
  assert.ok(existsSync(resolve('dist', site.cvUrl)));
  assert.match(readFileSync(resolve('dist', site.cvUrl)).toString('ascii', 0, 5), /%PDF-/);
  assert.ok(html.includes(`mailto:${site.contact.email}`));
  assert.ok(html.includes(site.profile.availability));
  const linkedin = site.contact.socials.find(social => social.name === 'LinkedIn');
  assert.ok(html.includes(`href="${linkedin.url}"`));
  assert.ok(readFileSync(resolve('dist/index.html'), 'utf8').includes(site.profile.availability));
  assert.match(html, /assets\/qr\/portfolio\.svg/);
  assert.match(html, /assets\/qr\/resume\.svg/);
  assert.match(html, /assets\/qr\/linkedin\.svg/);
});
