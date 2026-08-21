/**
 * games.js — Entry point for the Games & Simulators page.
 *
 * Shares the same design-system CSS as the portfolio. Boots theme,
 * nav, and wires up the game launcher cards.
 */

import './styles.css';
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initOptilatroViewer } from './optilatro-viewer.js';

function boot() {
  initTheme();
  initNav();

  // Fill year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Wire up game launcher buttons
  document.querySelectorAll('[data-launch-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const game = btn.dataset.launchGame;
      if (game === 'optilatro') launchOptilatro();
    });
  });

  console.log('[SYS] Games page initialized');
}

function launchOptilatro() {
  const viewport = document.getElementById('simulator-viewport');
  if (!viewport) return;

  viewport.hidden = false;
  viewport.scrollIntoView({ behavior: 'smooth', block: 'start' });

  initOptilatroViewer();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
