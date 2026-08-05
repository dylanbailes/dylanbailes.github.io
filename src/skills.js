/**
 * skills.js — Skills section: all tools displayed at once, grouped by
 * category. Each tool chip is interactive — hovering (desktop) or clicking
 * or tapping (touch) shows the real projects that used that tool in a
 * readout strip below the groups. Clicking a chip pins its readout.
 */

import { site } from './config.js';
import { escapeHtml } from './utils.js';
import { icon } from './icons.js';

const MOUNT = '[data-mount="skills"]';

function renderSkills(container) {
  const groups = site.skills
    .map((cat) => {
      const chips = cat.items
        .map((item) => {
          const usage = item.usage || [];
          return `
            <li>
              <button
                type="button"
                class="skill-chip"
                data-name="${escapeHtml(item.name)}"
                data-usage='${escapeHtml(JSON.stringify(usage))}'
              >${escapeHtml(item.name)}</button>
            </li>`;
        })
        .join('');

      return `
        <div class="skill-group">
          <div class="skill-group__head">
            <span class="skill-group__icon" aria-hidden="true">${icon(cat.icon)}</span>
            <div class="skill-group__titles">
              <h3 class="skill-group__title">${escapeHtml(cat.category)}</h3>
              <span class="skill-group__code">SKL.${escapeHtml(cat.code)}</span>
            </div>
          </div>
          <ul class="skill-chips">${chips}</ul>
        </div>`;
    })
    .join('');

  container.innerHTML = `
    <div class="section-head">
      <span class="section-head__index">03</span>
      <h2 id="skills-title" class="section-head__title">Skills</h2>
      <span class="section-head__rule"></span>
      <span class="section-head__tag">SKL.MATRIX</span>
      <span class="section-head__ghost" aria-hidden="true">03</span>
    </div>
    <div class="skills-board">${groups}</div>
    <p class="skill-readout" aria-live="polite" aria-atomic="true">
      <span class="skill-readout__tag">// USED IN</span>
      <span class="skill-readout__skill" hidden></span>
      <span class="skill-readout__arrow" hidden>→</span>
      <span class="skill-readout__value">Hover or click a skill to see its projects</span>
    </p>
  `;
}

function bindChips(container) {
  const chips = Array.from(container.querySelectorAll('.skill-chip'));
  const readout = container.querySelector('.skill-readout');
  if (chips.length === 0 || !readout) return;

  const skillEl = readout.querySelector('.skill-readout__skill');
  const arrowEl = readout.querySelector('.skill-readout__arrow');
  const valueEl = readout.querySelector('.skill-readout__value');
  const EMPTY = 'Hover or click a skill to see its projects';

  const board = container.querySelector('.skills-board');
  let pinned = null;

  const show = (chip) => {
    const usage = JSON.parse(chip.dataset.usage || '[]');
    skillEl.textContent = chip.dataset.name;
    skillEl.hidden = false;
    arrowEl.hidden = false;
    valueEl.textContent = usage.length ? usage.join(' · ') : '—';
  };

  const showPinned = () => {
    if (pinned) {
      show(pinned);
      return;
    }
    skillEl.hidden = true;
    arrowEl.hidden = true;
    valueEl.textContent = EMPTY;
  };

  chips.forEach((chip) => {
    // Hover / focus previews; the pinned chip (if any) is restored on leave
    chip.addEventListener('mouseenter', () => show(chip));
    chip.addEventListener('focus', () => show(chip));
    chip.addEventListener('blur', showPinned);

    // Click pins the readout (tap-to-pin on touch, where hover doesn't exist)
    chip.addEventListener('click', () => {
      if (pinned === chip) {
        pinned.classList.remove('is-active');
        pinned = null;
        showPinned();
      } else {
        if (pinned) pinned.classList.remove('is-active');
        chip.classList.add('is-active');
        pinned = chip;
        show(chip);
      }
    });
  });

  // Leaving the whole board restores the pinned chip (or the empty state) —
  // bound once here so sliding between chips never flashes the empty text
  board?.addEventListener('mouseleave', showPinned);
}

export function initSkills() {
  const mount = document.querySelector(MOUNT);
  if (!mount) return;

  const container = mount.querySelector('.container');
  renderSkills(container);
  bindChips(container);
}
