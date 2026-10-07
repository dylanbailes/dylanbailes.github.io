import { site } from './config.js';
import { escapeHtml } from './utils.js';
import { icon } from './icons.js';

export function renderQrContent() {
  const { profile, contact, cvUrl, meta } = site;
  const email = escapeHtml(contact.email);
  const portfolioUrl = `${meta.url}/`;
  return `
    <div class="qr-intro">
      <p class="qr-eyebrow">Controls &amp; robotics engineering</p>
      <h1 id="qr-title">${escapeHtml(profile.name)}<span class="qr-period">.</span></h1>
      <p class="qr-summary">Mechanical engineering M.S. candidate at UC San Diego.<br>Robotics, embedded systems, and UAS design.</p>
      <div class="qr-actions">
        <a class="btn btn--primary" href="index.html">View portfolio ${icon('arrowRight')}</a>
        <a class="btn btn--ghost" id="resume-download" href="${escapeHtml(cvUrl)}" download="Dylan-Bailes-Resume.pdf">Download résumé ${icon('download')}</a>
      </div>
      <a class="qr-email" href="mailto:${email}">${email}</a>
    </div>
    <section class="qr-codes" aria-label="Scan for my portfolio or résumé">
      <article class="qr-card">
        <div class="qr-card__heading"><h2>Portfolio</h2><span>Projects &amp; experience</span></div>
        <a class="qr-image-link" href="index.html" aria-label="Open Dylan Bailes's portfolio">
          <img class="qr-image" src="assets/qr/portfolio.svg" alt="QR code for Dylan Bailes's engineering portfolio" width="512" height="512">
        </a>
        <p class="qr-card__instruction">Scan to explore my work.</p>
        <a class="qr-card__url" href="index.html">${escapeHtml(portfolioUrl.replace('https://', '').replace(/\/$/, ''))}</a>
        <a class="qr-save" href="assets/qr/portfolio.png" download="Dylan-Bailes-Portfolio-QR.png">Save QR image ${icon('download')}</a>
      </article>
      <article class="qr-card">
        <div class="qr-card__heading"><h2>Résumé</h2><span>PDF</span></div>
        <a class="qr-image-link" href="${escapeHtml(cvUrl)}" aria-label="Download Dylan Bailes's résumé" download="Dylan-Bailes-Resume.pdf">
          <img class="qr-image" src="assets/qr/resume.svg" alt="QR code for Dylan Bailes's résumé PDF" width="512" height="512">
        </a>
        <p class="qr-card__instruction">Scan to open and save my résumé.</p>
        <a class="qr-card__url" href="${escapeHtml(cvUrl)}" download="Dylan-Bailes-Resume.pdf">Dylan Bailes / Résumé PDF</a>
        <a class="qr-save" href="assets/qr/resume.png" download="Dylan-Bailes-Resume-QR.png">Save QR image ${icon('download')}</a>
      </article>
    </section>
    <div class="qr-tools">
      <button class="btn btn--ghost" id="print-qr" hidden>Print / Save PDF</button>
      <p>Show this page on your phone, or print it to share in person.</p>
    </div>`;
}
