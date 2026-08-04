/**
 * experience.js — Experience section: indexed blueprint heading and a
 * technical two-column timeline (employment / education), all from config.
 */

import { site } from './config.js';
import { escapeHtml } from './utils.js';

const MOUNT = '[data-mount="experience"]';

function renderGroup(title, items, kind) {
  const code = kind === 'work' ? 'WRK' : 'EDU';

  const entries = items
    .map(
      (item) => `
        <li class="timeline__item">
          <span class="timeline__marker" aria-hidden="true"></span>
          <div class="timeline__card">
            <div class="timeline__head">
              <span class="timeline__kind">${code}</span>
              <span class="timeline__period">${escapeHtml(item.period)}</span>
            </div>
            <h3 class="timeline__role">${escapeHtml(item.role)}</h3>
            <p class="timeline__org">
              ${escapeHtml(item.org)}
              ${item.location ? `<span class="timeline__loc">· ${escapeHtml(item.location)}</span>` : ''}
            </p>
            <ul class="timeline__bullets">
              ${item.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
          </div>
        </li>`
    )
    .join('');

  return `
    <div class="timeline-group">
      <p class="timeline-group__title">/ ${escapeHtml(title)}</p>
      <ol class="timeline__list">${entries}</ol>
    </div>`;
}

function renderExperience(container) {
  const { experience } = site;

  container.innerHTML = `
    <div class="section-head">
      <span class="section-head__index">02</span>
      <h2 id="experience-title" class="section-head__title">Experience</h2>
      <span class="section-head__rule"></span>
      <span class="section-head__tag">EXP.LOG</span>
      <span class="section-head__ghost" aria-hidden="true">02</span>
    </div>
    <div class="experience__grid">
      ${renderGroup('Employment', experience.roles, 'work')}
      ${renderGroup('Education', experience.education, 'edu')}
    </div>
  `;
}

export function initExperience() {
  const mount = document.querySelector(MOUNT);
  if (!mount) return;

  renderExperience(mount.querySelector('.container'));
}
