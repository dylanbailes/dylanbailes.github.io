import './visual-viewer.css';

/** Native dialog keeps keyboard focus inside the presentation and restores it on close. */
export function initVisualViewer() {
  const dialog = document.createElement('dialog');
  dialog.className = 'visual-viewer';
  dialog.setAttribute('aria-labelledby', 'visual-viewer-title');
  dialog.innerHTML = `<div class="visual-viewer__frame">
    <header><h2 id="visual-viewer-title"></h2><button type="button" class="btn btn--ghost btn--small" data-visual-close>Close <span aria-hidden="true">×</span></button></header>
    <div class="visual-viewer__image"><img alt=""></div>
    <footer><p data-visual-caption></p><div class="visual-viewer__controls"><button type="button" class="btn btn--ghost btn--small" data-visual-prev aria-label="Previous visual">← Previous</button><span data-visual-count aria-live="polite"></span><button type="button" class="btn btn--ghost btn--small" data-visual-next aria-label="Next visual">Next →</button></div></footer>
  </div>`;
  document.body.append(dialog);
  const picture = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const caption = dialog.querySelector('[data-visual-caption]');
  const count = dialog.querySelector('[data-visual-count]');
  let visuals = [], position = 0;

  function show(index) {
    position = (index + visuals.length) % visuals.length;
    const visual = visuals[position];
    picture.src = visual.src;
    picture.alt = visual.alt;
    title.textContent = visual.alt;
    caption.textContent = visual.caption;
    count.textContent = `${position + 1} / ${visuals.length}`;
  }
  function open(items, selected = 0) {
    if (!items.length) return;
    visuals = items;
    show(selected);
    dialog.showModal();
  }
  const caseVisuals = () => [...document.querySelectorAll('.case-study [data-visual]')]
    .map(link => ({ src: link.href, alt: link.querySelector('img').alt,
      caption: link.closest('figure').querySelector('figcaption')?.textContent || '' }))
    .filter((visual, index, all) => all.findIndex(item => item.src === visual.src) === index);

  document.querySelectorAll('[data-present-visuals]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => open(caseVisuals()));
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-visual], [data-gallery-full-size]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.hasAttribute('data-visual')) {
      const items = caseVisuals();
      open(items, Math.max(0, items.findIndex(item => item.src === link.href)));
      return;
    }
    const media = link.closest('.project-media');
    const thumbs = [...media.querySelectorAll('[data-gallery-src]')];
    const items = thumbs.length ? thumbs.map(thumb => ({src: new URL(thumb.dataset.gallerySrc, document.baseURI).href,
      alt: thumb.dataset.galleryAlt, caption: thumb.dataset.galleryCaption || ''}))
      : [{src: link.href, alt: media.querySelector('[data-gallery-main]').alt,
        caption: media.querySelector('[data-gallery-caption-text]')?.textContent || ''}];
    open(items, Math.max(0, items.findIndex(item => item.src === link.href)));
  });
  dialog.querySelector('[data-visual-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-visual-prev]').addEventListener('click', () => show(position - 1));
  dialog.querySelector('[data-visual-next]').addEventListener('click', () => show(position + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(position + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      show(event.key === 'Home' ? 0 : visuals.length - 1);
    }
  });
}
