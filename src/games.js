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

  const letterLeagueDialog = document.getElementById('letter-league-dialog');
  const letterLeagueFrame = document.getElementById('letter-league-frame');
  const letterLeagueLauncher = document.querySelector('[data-launch-game="letter-league"]');

  letterLeagueDialog.querySelector('[data-close-game]').addEventListener('click', () => {
    letterLeagueDialog.close();
  });
  letterLeagueDialog.addEventListener('close', () => {
    // End the embedded session and its network activity when the player closes it.
    letterLeagueFrame.removeAttribute('src');
    document.body.classList.remove('game-dialog-open');
    letterLeagueLauncher.focus({ preventScroll: true });
  });

  // Wire up game launcher buttons
  document.querySelectorAll('[data-launch-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const game = btn.dataset.launchGame;
      if (game === 'optilatro') launchOptilatro();
      if (game === 'letter-league') {
        letterLeagueFrame.src = letterLeagueFrame.dataset.src;
        document.body.classList.add('game-dialog-open');
        letterLeagueDialog.showModal();
      }
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
