import { readFileSync } from 'node:fs';
import { site } from '../src/config.js';
import { escapeHtml } from '../src/utils.js';
import { renderHero } from '../src/hero.js';
import { renderAbout } from '../src/about.js';
import { renderExperience } from '../src/experience.js';
import { renderSkills } from '../src/skills.js';
import { renderProjects } from '../src/projects.js';
import { renderContact } from '../src/contact.js';

const renderers = {
  hero: renderHero, about: renderAbout, experience: renderExperience,
  skills: renderSkills, projects: renderProjects, contact: renderContact,
};
const bootstrap = readFileSync(new URL('../src/theme-bootstrap.js', import.meta.url), 'utf8');

// Visitors and crawlers receive the portfolio before JavaScript loads.
// Shared renderers keep initial HTML and browser enhancements in sync.
export function portfolioHtml() {
  return {
    name: 'portfolio-html',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const isHome = /(?:^|[\\/])index\.html$/.test(context.filename);
        const description = isHome ? site.meta.description
          : html.match(/<meta name="description" content="([^"]*)"/)[1];
        const title = isHome ? site.meta.title
          : /games\.html$/.test(context.filename) ? 'Games & Simulators — Dylan Bailes'
          : 'Multi-Chamber Camera Bioreactor | Dylan Bailes';
        const page = isHome ? '' : context.filename.split(/[\\/]/).pop();
        const url = `${site.meta.url}/${page}`;

        html = html.replace(' data-theme="light"', '');
        html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
        html = html.replace(/<meta name="description"[^>]*>/,
          `<meta name="description" content="${escapeHtml(description)}">`);
        html = html.replace(/\s*<meta property="og:[^"]+"[^>]*>/g, '');
        const metadata = `
  <link rel="canonical" href="${escapeHtml(url)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:image" content="${site.meta.url}/assets/images/profile.jpg">
  <meta property="og:image:alt" content="Portrait of Dylan Bailes">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${site.meta.url}/assets/images/profile.jpg">`;
        // Establish the page canvas before fonts, CSS, and module downloads.
        const earlyTheme = `<style data-critical-theme>
    :root { color-scheme: light; background: #f4f4f1; color: #111110; }
    :root[data-theme="dark"] { color-scheme: dark; background: #0b0b0b; color: #f2f2ee; }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme]) { color-scheme: dark; background: #0b0b0b; color: #f2f2ee; }
    }
    body { margin: 0; background: inherit; }
  </style><script data-theme-bootstrap>${bootstrap}</script>`;
        html = html.replace('<!-- Early theme -->', earlyTheme + metadata);
        html = html.replace(/<span id="current-year"><\/span>/,
          `<span id="current-year">${new Date().getFullYear()}</span>`);
        html = html.replace(/<span data-footer-name><\/span>/,
          `<span data-footer-name>${escapeHtml(site.profile.name.toUpperCase())}</span>`);

        if (isHome) {
          html = html.replace(/<section([^>]*data-mount="([^"]+)"[^>]*)>[\s\S]*?<\/section>/g,
            (match, attributes, name) => {
              const render = renderers[name];
              if (!render) return match;
              const content = name === 'hero' ? render()
                : `<div class="container${name === 'contact' ? ' contact__content' : ''}">${render()}</div>`;
              return `<section${attributes}>${content}</section>`;
            });
          html = html.replace(/(<span class="logo__tagline" data-logo-tagline>)[^<]*/,
            `$1${escapeHtml(site.profile.logoTagline)}`);
        }
        return html;
      },
    },
  };
}
