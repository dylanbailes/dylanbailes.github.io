/**
 * pcb-viewer.js — PCB viewer controls for `media: { type: 'pcb' }` projects.
 *
 * Scaffolding: the 2D/3D/Layers buttons are wired and dispatch
 * `pcb-view-change` events so a real viewer can plug in later.
 *
 * Integration points (TODO):
 *  - 2D View:     render an SVG/PNG of the PCB layout
 *  - 3D View:     use Three.js (`npm i three`) to render the board model
 *  - Layers:      toggle copper / silkscreen / solder-mask layers
 */

export function initPCBViewer() {
  const controlBtns = document.querySelectorAll('.pcb-control-btn');
  if (controlBtns.length === 0) return;

  controlBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const viewType = btn.dataset.view;

      // Update active button
      controlBtns.forEach((other) => {
        other.classList.toggle('active', other.dataset.view === viewType);
      });

      console.log(`PCB Viewer: Switched to ${viewType} view`);

      // Custom event for external listeners / future viewer integration
      window.dispatchEvent(new CustomEvent('pcb-view-change', { detail: { viewType } }));
    });
  });
}
