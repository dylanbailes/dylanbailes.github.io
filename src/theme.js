/**
 * theme.js — Dark/light theme with localStorage persistence.
 */

const STORAGE_KEY = 'portfolio-theme';

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function getSavedTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEY);
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch {
    return null;
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0b0b0b' : '#f4f4f1';
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }
}

export function initTheme() {
  // Check for saved theme or system preference
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let explicitTheme = getSavedTheme();
  const applyPreference = () => setTheme(explicitTheme || (systemTheme.matches ? 'dark' : 'light'));
  applyPreference();

  // Follow system theme changes unless the user has chosen explicitly
  systemTheme.addEventListener('change', applyPreference);

  // Keep other open portfolio tabs in sync, including a cleared preference.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      explicitTheme = getSavedTheme();
      applyPreference();
    }
  });

  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      explicitTheme = getTheme() === 'light' ? 'dark' : 'light';
      setTheme(explicitTheme);
      try {
        localStorage.setItem(STORAGE_KEY, explicitTheme);
      } catch { /* Theme switching still works when storage is unavailable. */ }
    });
  }
}
