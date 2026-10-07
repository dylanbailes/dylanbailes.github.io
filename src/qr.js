import './styles.css';
import './qr.css';
import { initTheme } from './theme.js';

initTheme();
const printButton = document.getElementById('print-qr');
printButton.hidden = false;
printButton.addEventListener('click', () => window.print());
