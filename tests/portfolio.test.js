import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';
import { initTheme } from '../src/theme.js';
import { site } from '../src/config.js';

const bootstrap = readFileSync(new URL('../src/theme-bootstrap.js', import.meta.url), 'utf8');

function themeEnvironment({ saved = null, dark = false, blocked = false } = {}) {
  const attributes = new Map();
  const listeners = {};
  const toggleListeners = {};
  const savedValues = new Map(saved === null ? [] : [['portfolio-theme', saved]]);
  const writes = [];
  const meta = {};
  const toggle = { setAttribute: (key, value) => attributes.set(`button:${key}`, value),
    addEventListener: (key, callback) => { toggleListeners[key] = callback; } };
  const system = { matches: dark,
    addEventListener: (key, callback) => { listeners[`system:${key}`] = callback; } };
  const environment = {
    document: {
      documentElement: {
        setAttribute: (key, value) => attributes.set(key, value),
        getAttribute: (key) => attributes.get(key),
      },
      querySelector: (selector) => selector.includes('theme-color') ? meta : toggle,
    },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Storage denied'); return savedValues.get(key) ?? null; },
      setItem(key, value) {
        if (blocked) throw new Error('Storage denied');
        savedValues.set(key, value);
        writes.push(value);
      },
    },
    window: {
      matchMedia: () => system,
      addEventListener: (key, callback) => { listeners[key] = callback; },
    },
  };
  return { environment, attributes, listeners, toggleListeners, savedValues, writes, meta, system };
}

for (const scenario of [
  { saved: 'dark', dark: false, expected: 'dark', name: 'saved dark preference' },
  { saved: 'light', dark: true, expected: 'light', name: 'saved light preference' },
  { dark: true, expected: 'dark', name: 'system dark preference' },
  { dark: false, expected: 'light', name: 'system light preference' },
  { saved: 'invalid', dark: true, expected: 'dark', name: 'invalid saved preference' },
  { blocked: true, dark: true, expected: 'dark', name: 'unavailable storage' },
]) {
  test(`first-paint bootstrap handles ${scenario.name}`, () => {
    const state = themeEnvironment(scenario);
    runInNewContext(bootstrap, state.environment);
    assert.equal(state.attributes.get('data-theme'), scenario.expected);
    assert.equal(state.meta.content, scenario.expected === 'dark' ? '#0b0b0b' : '#f4f4f1');
    assert.deepEqual(state.writes, [], 'system preference must not become a saved user choice');
  });
}

function initialize(state) {
  Object.assign(globalThis, state.environment);
  initTheme();
}

test('system changes remain live until an explicit choice; other tabs stay in sync', () => {
  const state = themeEnvironment();
  initialize(state);
  state.system.matches = true;
  state.listeners['system:change']();
  assert.equal(state.attributes.get('data-theme'), 'dark');
  assert.deepEqual(state.writes, []);
  state.toggleListeners.click();
  assert.equal(state.attributes.get('data-theme'), 'light');
  assert.equal(state.attributes.get('button:aria-label'), 'Switch to dark theme');
  assert.deepEqual(state.writes, ['light']);
  state.listeners['system:change']();
  assert.equal(state.attributes.get('data-theme'), 'light');
  state.savedValues.set('portfolio-theme', 'dark');
  state.listeners.storage({ key: 'portfolio-theme' });
  assert.equal(state.attributes.get('data-theme'), 'dark');
  state.savedValues.clear();
  state.system.matches = false;
  state.listeners.storage({ key: null });
  assert.equal(state.attributes.get('data-theme'), 'light');
});

test('unavailable storage never prevents initialization or theme switching', () => {
  const state = themeEnvironment({ blocked: true, dark: true });
  initialize(state);
  assert.equal(state.attributes.get('data-theme'), 'dark');
  assert.doesNotThrow(() => state.toggleListeners.click());
  assert.equal(state.attributes.get('data-theme'), 'light');
});

const pages = ['index.html', 'games.html', 'bioreactor.html', 'qr.html',
  'reports/mae3-prime-day-delivery-bot.html', 'reports/mccb-final-report.html'];
for (const page of pages) {
  test(`${page} delivers an early theme, complete metadata, and valid local destinations`, () => {
    const path = resolve('dist', page);
    assert.ok(existsSync(path), 'Run npm run build before npm test');
    const html = readFileSync(path, 'utf8');
    const early = html.indexOf('<script data-theme-bootstrap>');
    assert.ok(early >= 0 && early < html.indexOf('<script type="module"'));
    assert.ok(early < html.indexOf('fonts.googleapis.com'));
    assert.match(html, /data-critical-theme/);
    assert.doesNotMatch(html, /<html[^>]*data-theme="light"/);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    for (const name of ['og:title', 'og:description', 'og:url', 'og:image']) {
      assert.equal((html.match(new RegExp(`property="${name}"`, 'g')) || []).length, 1);
    }
    assert.match(html, /twitter:card/);
    assert.match(html, /rel="icon"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
    for (const match of html.matchAll(/\b(?:href|src|data-src|data-gallery-src)="([^"]+)"/g)) {
      const value = match[1].replaceAll('&amp;', '&');
      if (/^(?:[a-z]+:|\/\/)/i.test(value)) continue;
      const [file, hash] = value.split('#');
      const destination = file ? resolve(dirname(path), file) : path;
      assert.ok(existsSync(destination), `${page}: missing ${value}`);
      if (hash && destination.endsWith('.html')) {
        assert.ok(readFileSync(destination, 'utf8').includes(`id="${decodeURIComponent(hash)}"`),
          `${page}: missing anchor ${value}`);
      }
    }
    for (const image of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(image[0], /\balt="[^"]*"/);
      assert.match(image[0], /\bwidth="\d+"/);
      assert.match(image[0], /\bheight="\d+"/);
    }
  });
}

test('the built portfolio includes every section and project without running JavaScript', () => {
  const html = readFileSync(resolve('dist/index.html'), 'utf8').replaceAll('&amp;', '&');
  for (const name of ['hero', 'about', 'experience', 'skills', 'projects', 'contact']) {
    assert.match(html, new RegExp(`id="${name}-title"`));
  }
  for (const project of site.projects) assert.ok(html.includes(project.title));
  assert.equal((html.match(/<article class="project-card"/g) || []).length, site.projects.length);
  assert.ok(html.includes(site.meta.title));
  assert.match(html, /data-count="1000">1,000/);
  const manifest = JSON.parse(readFileSync(resolve('dist/optilatro/manifest.json'), 'utf8'));
  for (const file of manifest.files) assert.ok(existsSync(resolve('dist/optilatro', file)), file);
  assert.ok(existsSync(resolve('dist/robots.txt')));
  assert.ok(existsSync(resolve('dist/sitemap.xml')));
});

test('HTML reports retain all diagrams, tables, and substantive sections', () => {
  const report = readFileSync(resolve('dist/reports/mccb-final-report.html'), 'utf8');
  assert.match(report, /Chapter 5: Design Recommendations and Conclusions/);
  assert.match(report, /A\.6 User Manual/);
  assert.match(report, /Executive Summary/);
  const figures = [...report.matchAll(/src="\.\.\/assets\/reports\/figures\/mccb-final-report\/(image\d+)\.png"/g)].map(match => match[1]);
  const source = readFileSync(resolve('public/assets/reports/mccb-final-report.md'), 'utf8');
  const originalFigures = [...source.matchAll(/^\[(image\d+)\]:/gm)].map(match => match[1]);
  assert.deepEqual([...new Set(figures)].sort(), originalFigures.sort());
  assert.equal((report.match(/<table>/g) || []).length,
    (source.match(/^\|\s*:?-{3}/gm) || []).length);
  assert.doesNotMatch(report, /data:image\/png;base64|\{#[^}]+\}/);
  assert.match(report, /class="katex"/);
  assert.match(report, /scope="col"/);
  assert.match(report, /<figcaption/);
  assert.match(report, /<caption/);
  for (const figure of report.matchAll(/<figure class="report-figure">([\s\S]*?)<\/figure>/g)) {
    assert.doesNotMatch(figure[1], /<h[1-6]|<table|<p/,
      'Captions must stay with their figure without swallowing report sections');
  }
  for (const caption of report.matchAll(/<caption[^>]*>([\s\S]*?)<\/caption>/g)) {
    assert.doesNotMatch(caption[1], /<p|<img|<h[1-6]/,
      'Table captions must not include unrelated content');
  }
  assert.match(report, /rel="canonical" href="https:\/\/dylanbailes.github.io\/reports\/mccb-final-report.html"/);
  const delivery = readFileSync(resolve('dist/reports/mae3-prime-day-delivery-bot.html'), 'utf8');
  assert.match(delivery, /Design Process Essay/);
  assert.match(delivery, /221\.7%/);
  assert.match(delivery, /m=2\.67kg/);
  assert.match(delivery, /Print \/ Save PDF/);
  for (const page of ['index.html', 'bioreactor.html']) {
    assert.doesNotMatch(readFileSync(resolve('dist', page), 'utf8'), /href="[^\"]*\.md"/);
  }
});
