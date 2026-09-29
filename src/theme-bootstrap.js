// Inlined into every HTML head by Vite, before styles or modules can paint.
(() => {
  let savedTheme;
  try {
    savedTheme = localStorage.getItem('portfolio-theme');
  } catch { /* Storage may be disabled by the browser. */ }
  const theme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0b0b0b' : '#f4f4f1';
})();
