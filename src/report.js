import './styles.css';
import './case-study.css';
import 'katex/dist/katex.min.css';
import './report.css';
import { initTheme } from './theme.js';
import { initSmoothScroll } from './smooth-scroll.js';

initTheme();
const contents = document.querySelector('.report-toc');
if (window.matchMedia('(max-width: 900px)').matches) contents.open = false;
initSmoothScroll();

const printButton = document.querySelector('[data-print-report]');
printButton.hidden = false;
printButton.addEventListener('click', async () => {
  // Ensure deferred figures are available to the browser's PDF/print renderer.
  document.querySelectorAll('.report img').forEach(image => { image.loading = 'eager'; });
  const images = [...document.querySelectorAll('.report img')];
  printButton.disabled = true;
  printButton.textContent = 'Preparing print…';
  printButton.setAttribute('aria-busy', 'true');
  try {
    await Promise.all([document.fonts.ready, ...images.map(image => image.decode().catch(() => {}))]);
    window.print();
  } finally {
    printButton.disabled = false;
    printButton.textContent = 'Print / Save PDF';
    printButton.removeAttribute('aria-busy');
  }
});
