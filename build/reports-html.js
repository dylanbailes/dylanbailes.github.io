import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Marked, Renderer } from 'marked';
import katex from 'katex';
import { escapeHtml } from '../src/utils.js';

export const reports = [
  {
    slug: 'mae3-prime-day-delivery-bot', code: 'P.06 / MAE 3',
    title: 'Prime Day Delivery Bot', subtitle: 'Design, performance & mechanical analysis',
    authors: 'Dylan Bailes', course: 'MAE 3 — Introduction to Engineering Graphics and Design',
    description: 'The full Prime Day Delivery Bot report: elevator and bucket design, lift requirements, mechanical analysis, test results, and design lessons.',
    image: '../assets/images/mae3-robot.webp', width: 426, height: 240,
    imageAlt: 'Prime Day Delivery Bot competition robot',
  },
  {
    slug: 'mccb-final-report', code: 'P.01 / MAE 156B',
    title: 'Multi-Chamber Camera Bioreactor', subtitle: 'Final technical report',
    authors: 'Dylan Bailes, Kaitlyn Lavarias, Dylan Lee, Samantha Olivar',
    course: 'MAE 156B — Fundamental Principles of Mechanical Design II',
    details: 'University of California San Diego · Professor David Gillett',
    release: 'June 7, 2026', sponsor: 'Peter Chen',
    description: 'The complete bioreactor technical report, including component design, electric and magnetic field validation, figures, references, and appendices.',
  },
];

const cleanText = (text) => text.replace(/!\[[^\]]*\]\[[^\]]*\]/g, '')
  .replace(/\s*\{#[^}]+\}/g, '').replace(/\\([\\*_{}\[\]()#+\-.!$&<>~=])/g, '$1')
  .replace(/[*`$]/g, '').replace(/[\u202a-\u202e]/g, '').trim();
const slugify = (text) => cleanText(text).toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

// Render once at build time. Markdown remains the editable source; visitors
// receive complete HTML and separately cached figures, with no Markdown parser.
export function renderReport(report) {
  const source = readFileSync(new URL(`../public/assets/reports/${report.slug}.md`, import.meta.url), 'utf8')
    .replace(/\r/g, '');
  const assets = new Map();
  const images = new Map();
  let markdown = source.replace(/^\[([^\]]+)\]:\s*<data:image\/png;base64,([^>]+)>/gm, (_, id, data) => {
    const bytes = Buffer.from(data, 'base64');
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    const fileName = `assets/reports/figures/${report.slug}/${id}.png`;
    const href = `../${fileName}`;
    images.set(href, { id, width, height });
    if (height > 4) assets.set(fileName, bytes); // Ignore the export's decorative spacer.
    return `[${id}]: ${href}`;
  });
  // Replace the print export's cover and obsolete page-number indexes.
  markdown = report.slug === 'mccb-final-report'
    ? markdown.slice(markdown.indexOf('# **Abstract**')).replace(/# \*\*Table of Contents\*\*[\s\S]*?(?=#\s+\*\*Chapter 1:)/, '')
    : markdown.slice(markdown.indexOf('# **Introduction**'));
  markdown = markdown.replace(/^\t+/gm, '').replace(/^#{1,6}\s*$/gm, '');
  // The source export accidentally marks several complete paragraphs as H4.
  markdown = markdown.replace(/^#{4}\s+(.{180,})$/gm, '$1');

  const headings = [], anchors = new Map(), usedIds = new Set();
  const nextId = (text) => {
    const base = slugify(text);
    let id = base, suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    return id;
  };
  const parser = new Marked({ gfm: true });
  let tableNumber = 0, currentSection = '', equations = false;
  parser.use({
    extensions: [{
      name: 'reportMath', level: 'inline',
      start: (text) => text.indexOf('$'),
      tokenizer(text) {
        const match = /^\$([^$\n]+)\$/.exec(text);
        if (!match || !(/\\[a-z]+|^[nR](?:\\?_)[a-zA-Z]$|^WD$|^\d+(?:\.\d+)?$/.test(match[1]))) return;
        return { type: 'reportMath', raw: match[0], math: match[1].replace(/\\\\/g, '\\').replace(/\\_/g, '_').replace(/\\([<>=])/g, '$1') };
      },
      renderer: (token) => katex.renderToString(token.math, { throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' }),
    }],
    renderer: {
      html: ({ text }) => escapeHtml(text),
      heading(token) {
        const content = this.parser.parseInline(token.tokens).replace(/\s*\{#[^}]+\}\s*$/, '');
        const label = cleanText(token.text);
        if (!label) return content ? `<p class="report-image">${content}</p>\n` : '';
        if (/^(?:Figure|Table)\s/i.test(label)) {
          return `<p class="report-caption" data-kind="${/^Table/i.test(label) ? 'table' : 'figure'}" id="${token.reportId}">${content}</p>\n`;
        }
        currentSection = label;
        equations = label === 'Calculations';
        const depth = Math.min(token.depth + 1, 6);
        // A few export headings include the following diagram in their text.
        const diagrams = content.match(/<img\b[^>]*>/g)?.join('') || '';
        return `<h${depth} id="${token.reportId}">${content.replace(/<img\b[^>]*>/g, '')}</h${depth}>\n${diagrams ? `<p class="report-image">${diagrams}</p>\n` : ''}`;
      },
      paragraph(token) {
        const content = this.parser.parseInline(token.tokens);
        const label = cleanText(token.text);
        if (equations) {
          equations = false;
          return `<p class="report-equations">${content}</p>\n`;
        }
        if (content.includes('<img')) {
          const diagrams = content.match(/<img\b[^>]*>/g).join('');
          const caption = content.match(/<strong>((?:Figure|Table)\s[^<]+)<\/strong>/);
          let prose = content.replace(/<img\b[^>]*>/g, '');
          if (caption) prose = prose.replace(caption[0], '');
          prose = prose.replace(/<(strong|em)>\s*<\/\1>/g, '').replace(/^(?:\s|<br\s*\/?>)+|(?:\s|<br\s*\/?>)+$/g, '');
          return `${prose ? `<p>${prose}</p>\n` : ''}<p class="report-image">${diagrams}</p>\n${caption ? `<p class="report-caption" data-kind="figure" id="${nextId(caption[1])}">${caption[1]}</p>\n` : ''}`;
        }
        const isCaption = /^(?:Figure|Table)\s[\dA]/.test(label)
          && (/^<strong>[\s\S]*<\/strong>$/.test(content)
            || (!/\b(?:outlines|shows|provides|presents|is|this is a reference)\b/i.test(label) && label.length < 600));
        if (isCaption) {
          return `<p class="report-caption" data-kind="${/^Table/i.test(label) ? 'table' : 'figure'}" id="${nextId(label)}">${content}</p>\n`;
        }
        return `<p>${content}</p>\n`;
      },
      image({ href, text }) {
        const image = images.get(href);
        if (!image) throw new Error(`Unknown report figure: ${href}`);
        if (image.height <= 4) return '';
        return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text || `Report illustration ${image.id.replace('image', '')}`)}"${text ? '' : ` data-section="${escapeHtml(currentSection)}"`} width="${image.width}" height="${image.height}" loading="lazy" decoding="async">`;
      },
      table(token) {
        for (const row of token.rows) {
          const label = cleanText(row[1]?.text || row[0]?.text || '');
          parser.walkTokens(row.flatMap(cell => cell.tokens), (item) => {
            if (item.type === 'image' && !item.text) item.text = label;
          });
        }
        const table = Renderer.prototype.table.call(this, token).replace(/<th(?=[\s>])/g, '<th scope="col"');
        return `<div class="report-table-wrap" role="region" aria-label="Report table ${++tableNumber}" tabindex="0">${table}</div>\n`;
      },
      link(token) {
        let href = token.href;
        if (href.startsWith('#')) {
          const target = anchors.get(href.slice(1).replace(/\\/g, ''));
          if (!target) return this.parser.parseInline(token.tokens);
          href = `#${target}`;
        }
        if (!/^(?:https?:|mailto:|#)/i.test(href)) return this.parser.parseInline(token.tokens);
        return `<a href="${escapeHtml(href)}">${this.parser.parseInline(token.tokens)}</a>`;
      },
    },
  });
  const tokens = parser.lexer(markdown);
  parser.walkTokens(tokens, (token) => {
    if (token.type !== 'heading') return;
    const label = cleanText(token.text);
    if (!label) return;
    token.reportId = nextId(label);
    const oldId = token.text.match(/\{#([^}]+)\}\s*$/)?.[1];
    if (oldId) anchors.set(oldId.replace(/\\/g, ''), token.reportId);
    anchors.set(slugify(label), token.reportId);
    if (token.depth === 1 || (token.depth === 2 && (report.slug === 'mae3-prime-day-delivery-bot' || /^A\.\d\s/.test(label)))) {
      headings.push({ id: token.reportId, label });
    }
  });
  let body = parser.parser(tokens);
  // Associate captions with diagrams and tables rather than export headings.
  body = body.replace(/<p class="report-image">((?:(?!<\/p>)[\s\S])*)<\/p>\s*<p class="report-caption" data-kind="figure" id="([^"]+)">((?:(?!<\/p>)[\s\S])*)<\/p>/g,
    (_, content, id, caption) => {
      const alt = caption.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;');
      return `<figure class="report-figure">${content.replace(/alt="Report illustration \d+"/g, `alt="${alt}"`)}<figcaption id="${id}">${caption}</figcaption></figure>`;
    });
  body = body.replace(/<p class="report-caption" data-kind="table" id="([^"]+)">((?:(?!<\/p>)[\s\S])*)<\/p>\s*<div class="report-table-wrap"([^>]*)><table>/g,
    (_, id, caption, attributes) => `<div class="report-table-wrap"${attributes.replace(/ aria-label="[^"]*"/, '')} aria-labelledby="${id}"><table><caption id="${id}">${caption}</caption>`);
  body = body.replace(/alt="Report illustration (\d+)" data-section="([^"]+)"/g,
    (_, number, section) => `alt="${section} — report illustration ${number}"`)
    .replace(/ data-section="[^"]*"/g, '');
  const contents = headings.map(({ id, label }) => `<li><a href="#${id}">${escapeHtml(label)}</a></li>`).join('\n');
  const cover = report.image ? { src: report.image, width: report.width, height: report.height, alt: report.imageAlt }
    : { src: `../assets/reports/figures/${report.slug}/image1.png`, ...images.get(`../assets/reports/figures/${report.slug}/image1.png`), alt: 'Multi-Chamber Camera Bioreactor final assembly' };
  const readingTime = Math.ceil(cleanText(markdown.replace(/^\[[^\]]+\]:.*$/gm, '')).split(/\s+/).length / 200);
  const caseLink = report.slug === 'mccb-final-report' ? '<a href="../bioreactor.html" class="btn btn--ghost">Project case study →</a>' : '';
  const html = `
  <a href="#report-content" class="skip-link">Skip to report</a>
  <button class="theme-toggle" aria-label="Toggle dark/light theme" title="Toggle theme">
    <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  </button>
  <header class="case-header"><div class="container case-header__inner">
    <a class="logo" href="../index.html" aria-label="Dylan Bailes, home"><span class="logo__text">DylanBailes</span><span class="logo__tagline">Engineering Portfolio</span></a>
    <a class="case-header__back" href="../index.html#projects">← All projects</a>
  </div></header>
  <main class="report container" id="report-top">
    <div class="report-cover">
      <div><p class="report-eyebrow">${report.code} / REPORT</p>
        <h1>${escapeHtml(report.title)}<span class="report-period">.</span></h1>
        <p class="report-subtitle">${escapeHtml(report.subtitle)}</p>
        <p class="report-authors">${escapeHtml(report.authors)}</p>
        <p class="report-meta">${escapeHtml(report.course)}${report.details ? `<br>${escapeHtml(report.details)}` : ''}${report.sponsor ? `<br>Sponsor: ${escapeHtml(report.sponsor)}` : ''}</p>
        <p class="report-edition">${report.release ? `Released ${report.release} · ` : ''}${readingTime} min read</p>
        <div class="report-actions"><a href="#report-content" class="btn btn--primary">Read report ↓</a><button class="btn btn--ghost" data-print-report hidden>Print / Save PDF</button>${caseLink}</div>
      </div>
      <figure class="report-cover-image"><img src="${cover.src}" alt="${cover.alt}" width="${cover.width}" height="${cover.height}" decoding="async"><figcaption>${escapeHtml(report.title)}</figcaption></figure>
    </div>
    <div class="report-layout">
      <aside class="report-sidebar"><details class="report-toc" open><summary>Contents</summary><nav aria-label="Report contents"><ol>${contents}</ol></nav></details></aside>
      <article class="report-content" id="report-content" aria-label="${escapeHtml(report.subtitle)}" tabindex="-1">${body}</article>
    </div>
    <footer class="report-footer"><a href="../index.html#projects">← Back to projects</a><a href="#report-top">Back to top ↑</a></footer>
  </main>`;
  return { html, assets };
}

export function reportsHtml() {
  let compiled = new Map(), command;
  const compile = () => { compiled = new Map(reports.map(report => [report.slug, renderReport(report)])); };
  return {
    name: 'reports-html',
    configResolved(config) { command = config.command; },
    buildStart() {
      compile();
      if (command === 'serve') return;
      for (const report of compiled.values()) {
        for (const [fileName, source] of report.assets) this.emitFile({ type: 'asset', fileName, source });
      }
    },
    configureServer(server) {
      compile();
      server.watcher.add(reports.map(report => fileURLToPath(new URL(`../public/assets/reports/${report.slug}.md`, import.meta.url))));
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0].replace(/^\//, '');
        for (const report of compiled.values()) {
          const image = report.assets.get(path);
          if (image) { response.setHeader('Content-Type', 'image/png'); response.end(image); return; }
        }
        next();
      });
    },
    handleHotUpdate({ file, server }) {
      if (!reports.some(report => file.replace(/\\/g, '/').endsWith(`/assets/reports/${report.slug}.md`))) return;
      compile();
      server.ws.send({ type: 'full-reload' });
      return [];
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const slug = context.filename.split(/[\\/]/).pop().replace(/\.html$/, '');
        return compiled.has(slug) ? html.replace('<!-- Report layout -->', compiled.get(slug).html) : html;
      },
    },
  };
}
