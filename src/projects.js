/**
 * projects.js — Projects section rendered from config: indexed cards
 * (P.01, P.02…) with category short-codes, type-specific media
 * (model / pcb / code / simulation / image), and a radiogroup filter.
 */

import { site } from './config.js';
import { escapeHtml } from './utils.js';
import { icon } from './icons.js';
import { initFusionViewers } from './fusion-viewer.js';
import { initPCBViewer } from './pcb-viewer.js';

const MOUNT = '[data-mount="projects"]';

// Short technical codes for project categories
const CATEGORY_CODE = {
  mechanical: 'MECH',
  pcb: 'PCB',
  firmware: 'FW',
  simulation: 'SIM',
};

/* --------------------------------------------------------------------------
   Media renderers
   -------------------------------------------------------------------------- */

function renderModelMedia(media) {
  const { src, alt, options } = media;

  // No model yet — show the "insert your model" placeholder (scaffolding)
  if (!src) {
    return `
      <div class="model-viewer-container">
        <div class="model-viewer-placeholder">
          <span class="model-viewer-placeholder__icon">${icon('cube')}</span>
          <p>CAD Viewer</p>
          <span class="model-viewer-placeholder__note">MODEL.PENDING — add a .glb in src/config.js</span>
          <div class="loading-spinner" aria-label="Loading model..."></div>
        </div>
      </div>
    `;
  }

  const optionsAttr = escapeHtml(JSON.stringify(options || {}));

  return `
    <div class="model-viewer-container">
      <model-viewer
        data-fusion-model="${escapeHtml(src)}"
        data-fusion-options='${optionsAttr}'
        alt="${escapeHtml(alt || '3D CAD model from Fusion 360')}"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        environment-image="https://modelviewer.dev/shared-assets/environments/studio.hdr"
        loading="lazy">
        <div class="model-loading" slot="loading-animation">
          <div class="loading-spinner"></div>
          <p>Loading CAD model...</p>
        </div>
      </model-viewer>
      <div class="model-loading-bar"></div>
    </div>
    <div class="material-info-panel" hidden></div>
    <div class="export-guide-panel" hidden></div>
  `;
}

function renderPcbMedia() {
  return `
    <div class="pcb-viewer-container">
      <div class="pcb-viewer-placeholder">
        <div class="pcb-viewer-placeholder__preview">
          <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="360" height="260" rx="4" fill="#161616"/>
            <circle cx="50" cy="50" r="14" fill="#55554f"/>
            <circle cx="350" cy="50" r="14" fill="#55554f"/>
            <circle cx="50" cy="250" r="14" fill="#55554f"/>
            <circle cx="350" cy="250" r="14" fill="#55554f"/>
            <rect x="110" y="85" width="180" height="130" rx="2" fill="#2a2a28"/>
            <rect x="150" y="115" width="100" height="70" fill="#3a3a37"/>
            <path d="M80 50 L320 50" stroke="#8a8a84" stroke-width="2"/>
            <path d="M80 250 L320 250" stroke="#8a8a84" stroke-width="2"/>
            <circle cx="200" cy="150" r="6" fill="#ff3b30"/>
          </svg>
        </div>
        <div class="pcb-viewer-controls">
          <button class="pcb-control-btn active" data-view="2d">2D View</button>
          <button class="pcb-control-btn" data-view="3d">3D View</button>
          <button class="pcb-control-btn" data-view="layers">Layers</button>
        </div>
        <span class="pcb-viewer-placeholder__note">VIEWER.PENDING — see src/pcb-viewer.js</span>
      </div>
    </div>
  `;
}

function renderCodeMedia(media) {
  return `
    <div class="firmware-code-preview">
      <pre><code>${escapeHtml(media.code || '')}</code></pre>
    </div>
  `;
}

function renderSimulationMedia() {
  return `
    <div class="simulation-results">
      <div class="simulation-placeholder">
        <div class="heatmap-placeholder">
          <div class="heatmap-gradient"></div>
          <span class="heatmap-label">Temp.Distribution</span>
        </div>
        <div class="chart-placeholder">
          <svg viewBox="0 0 200 100" fill="none">
            <path d="M10 90 Q50 80 80 50 T190 30" fill="none" stroke-width="2"/>
            <line x1="10" y1="90" x2="190" y2="90" stroke-width="1"/>
          </svg>
          <span class="chart-label">Transient Response</span>
        </div>
      </div>
    </div>
  `;
}

function renderImageMedia(media) {
  const gallery = media.gallery && media.gallery.length ? media.gallery : [];

  const thumbs = gallery.length
    ? `
      <div class="project-media__thumbs" role="group" aria-label="Project image gallery">
        ${gallery
          .map(
            (g, index) => `
            <button
              class="project-media__thumb"
              data-gallery-src="${escapeHtml(g.src)}"
              data-gallery-alt="${escapeHtml(g.alt || g.src)}"
              aria-label="View gallery image ${index + 2}"
            >
              <img src="${escapeHtml(g.src)}" alt="" loading="lazy">
            </button>`
          )
          .join('')}
      </div>`
    : '';

  const counter = gallery.length
    ? `<span class="project-media__counter">01 / ${String(gallery.length + 1).padStart(2, '0')}</span>`
    : '';

  return `
    <div class="project-card__media project-media">
      <div class="project-media__main">
        <img
          class="project-media__image"
          src="${escapeHtml(media.src)}"
          alt="${escapeHtml(media.alt || media.src)}"
          data-gallery-main
          loading="lazy"
        >
        ${counter}
      </div>
      ${thumbs}
    </div>
  `;
}

function renderMedia(media) {
  if (!media) return '';
  switch (media.type) {
    case 'model': return renderModelMedia(media);
    case 'pcb': return renderPcbMedia();
    case 'code': return renderCodeMedia(media);
    case 'simulation': return renderSimulationMedia();
    case 'image': return renderImageMedia(media);
    default: return '';
  }
}

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */

const categoryLabel = (id) => {
  const cat = site.projectCategories.find((c) => c.id === id);
  return cat ? cat.label : id;
};

function renderProjects(container) {
  // Filter buttons (radiogroup for accessibility)
  const filters = site.projectCategories
    .map(
      (cat, index) => `
        <button
          class="filter-btn${index === 0 ? ' filter-btn--active' : ''}"
          data-filter="${cat.id}"
          role="radio"
          aria-checked="${index === 0}"
          tabindex="${index === 0 ? '0' : '-1'}"
        >${escapeHtml(cat.label)}</button>`
    )
    .join('');

  // Project cards
  const cards = site.projects
    .map((project, index) => {
      const code = CATEGORY_CODE[project.category] || project.category.toUpperCase();

      const specs = project.specs && project.specs.length
        ? `<table class="tech-specs-table"><tbody>
             ${project.specs
               .map((spec) => `<tr><th>${escapeHtml(spec.label)}</th><td>${escapeHtml(spec.value)}</td></tr>`)
               .join('')}
           </tbody></table>`
        : '';

      const links = project.links && project.links.length
        ? `<div class="project-card__links">
             ${project.links
               .map(
                 (link) =>
                   `<a href="${escapeHtml(link.href)}" class="btn btn--${link.primary ? 'primary' : 'ghost'} btn--small">${escapeHtml(link.label)}${icon('arrowRight')}</a>`
               )
               .join('')}
           </div>`
        : '';

      return `
        <article class="project-card" data-category="${escapeHtml(project.category)}">
          <div class="project-card__top">
            <span class="project-card__index">P.${String(index + 1).padStart(2, '0')}</span>
            <span class="project-card__badge project-card__badge--${escapeHtml(project.category)}">${code}</span>
          </div>
          <h3 class="project-card__title">${escapeHtml(project.title)}</h3>

          ${renderMedia(project.media)}

          <p class="project-card__summary">${escapeHtml(project.summary)}</p>
          ${specs}
          ${links}
        </article>`;
    })
    .join('');

  container.innerHTML = `
    <div class="section-head">
      <span class="section-head__index">04</span>
      <h2 id="projects-title" class="section-head__title">Projects</h2>
      <span class="section-head__rule"></span>
      <span class="section-head__tag">PRJ.ARCHIVE</span>
      <span class="section-head__ghost" aria-hidden="true">04</span>
    </div>

    <div class="project-filters" role="radiogroup" aria-label="Project categories">
      ${filters}
    </div>

    <div class="projects-grid">${cards}</div>
  `;
}

/* --------------------------------------------------------------------------
   Filtering
   -------------------------------------------------------------------------- */

function filterProjects(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  buttons.forEach((btn) => {
    const isActive = btn.dataset.filter === category;
    btn.classList.toggle('filter-btn--active', isActive);
    btn.setAttribute('aria-checked', isActive);
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  cards.forEach((card, index) => {
    const matches = category === 'all' || card.dataset.category === category;

    if (matches) {
      card.classList.remove('hidden');
      card.style.animation = `fadeInUp 0.4s var(--ease) forwards ${index * 0.05}s`;
    } else {
      card.classList.add('hidden');
      card.style.animation = '';
    }
  });
}

/**
 * Arrow-key navigation for the radiogroup (Left/Right/Home/End) — moves from
 * the currently focused radio (per the ARIA radiogroup pattern).
 */
function bindFilterKeyboard(buttons) {
  const group = document.querySelector('.project-filters');
  if (!group) return;

  group.addEventListener('keydown', (e) => {
    const radios = Array.from(buttons).filter((btn) => !btn.hidden);
    if (radios.length === 0) return;

    const focusedIndex = radios.indexOf(document.activeElement);
    const checkedIndex = radios.findIndex((btn) => btn.getAttribute('aria-checked') === 'true');
    const baseIndex = focusedIndex !== -1 ? focusedIndex : checkedIndex;
    if (baseIndex === -1) return;

    let next = -1;
    if (e.key === 'ArrowRight') next = (baseIndex + 1) % radios.length;
    else if (e.key === 'ArrowLeft') next = (baseIndex - 1 + radios.length) % radios.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = radios.length - 1;
    else return;

    e.preventDefault();
    radios[next].focus();
    filterProjects(radios[next].dataset.filter);
  });
}

function bindFilterClicks(buttons) {
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => filterProjects(btn.dataset.filter));
  });
}

/** Swap the main project image when a gallery thumbnail is clicked. */
function bindGallery() {
  document.querySelectorAll('.project-media').forEach((media) => {
    const main = media.querySelector('[data-gallery-main]');
    const thumbs = media.querySelectorAll('.project-media__thumb');
    const counter = media.querySelector('.project-media__counter');
    if (!main || thumbs.length === 0) return;

    const total = thumbs.length + 1;

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        main.src = thumb.dataset.gallerySrc;
        main.alt = thumb.dataset.galleryAlt;
        thumbs.forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        if (counter) {
          counter.textContent = `${String(index + 2).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
        }
      });
    });
  });
}

export function initProjects() {
  const mount = document.querySelector(MOUNT);
  if (!mount) return;

  renderProjects(mount.querySelector('.container'));

  const buttons = document.querySelectorAll('.filter-btn');
  bindFilterClicks(buttons);
  bindFilterKeyboard(buttons);
  bindGallery();

  initPCBViewer();
  initFusionViewers();
}
