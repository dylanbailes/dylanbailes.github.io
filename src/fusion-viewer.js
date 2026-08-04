/**
 * fusion-viewer.js — 3D CAD model viewer for Fusion 360 exports.
 *
 * Scaffolding: this powers the `media: { type: 'model' }` project cards.
 * model-viewer is imported *lazily* (only when a project actually has a
 * model), so the initial page load stays light.
 *
 * To add a model, see FUSION_360_EXPORT_GUIDE.md — export from Fusion 360 as
 * .glb, drop it in `public/assets/models/`, and point a project at it in
 * src/config.js:
 *   media: { type: 'model', src: 'assets/models/your-model.glb', ... }
 */

import { escapeHtml } from './utils.js';

const ENVIRONMENTS = {
  studio: 'https://modelviewer.dev/shared-assets/environments/studio.hdr',
  warehouse: 'https://modelviewer.dev/shared-assets/environments/warehouse.hdr',
  park: 'https://modelviewer.dev/shared-assets/environments/park.hdr',
  court: 'https://modelviewer.dev/shared-assets/environments/court.hdr',
};

/**
 * Ensures the <model-viewer> custom element is registered.
 * Safe to call multiple times.
 */
async function ensureModelViewer() {
  if (!customElements.get('model-viewer')) {
    await import('@google/model-viewer');
  }
}

function findPanel(viewer, selector) {
  // Panels (loading bar inside, material/export panels as siblings) all live
  // under the container's parent element.
  const container = viewer.closest('.model-viewer-container');
  return container ? container.parentElement.querySelector(selector) : null;
}

/** Updates the loading progress bar inside the viewer's container. */
function updateLoadingProgress(viewer, percent) {
  const bar = findPanel(viewer, '.model-loading-bar');
  if (bar) bar.style.width = `${Math.min(percent, 100)}%`;
}

/** Lists materials/appearances preserved from the Fusion 360 export. */
function updateMaterialInfo(viewer, materials) {
  const panel = findPanel(viewer, '.material-info-panel');
  if (!panel) return;

  panel.innerHTML = '';
  materials.forEach((material, index) => {
    const item = document.createElement('div');
    item.className = 'material-item';
    const name = escapeHtml(material.name || `Material ${index + 1}`);
    const props =
      `${material.pbrMetallicRoughness ? 'PBR ' : ''}${material.alphaMode || 'opaque'}`;
    item.innerHTML = `
      <span class="material-name">${name}</span>
      <span class="material-properties">${escapeHtml(props)}</span>
    `;
    panel.appendChild(item);
  });
  panel.hidden = false;
}

/** Shows the export-settings guide when a model fails to load. */
function showExportGuide(viewer) {
  const guide = findPanel(viewer, '.export-guide-panel');
  if (!guide) return;

  guide.hidden = false;
  guide.innerHTML = `
    <h4>Fusion 360 Export Settings for Best Results:</h4>
    <ol>
      <li><strong>File → Export</strong> (not Save As)</li>
      <li><strong>Format:</strong> glTF Binary (.glb) - Best for web</li>
      <li><strong>Options:</strong>
        <ul>
          <li>✓ Include appearances/textures</li>
          <li>✓ Embed textures (don't use external files)</li>
          <li>✓ Use "Web Optimized" if available</li>
        </ul>
      </li>
      <li><strong>Alternative formats:</strong>
        <ul>
          <li>.gltf + textures folder (also preserves appearances)</li>
          <li>.fbx (good material support, larger file)</li>
          <li>.obj + .mtl (basic materials only)</li>
        </ul>
      </li>
    </ol>
    <p class="note"><strong>Note:</strong> STL does NOT preserve appearances - only geometry.</p>
  `;
}

/**
 * Configures a <model-viewer> element for a Fusion 360 export.
 * @param {HTMLElement} modelViewerElement the <model-viewer> element
 * @param {string} modelPath path to the .glb/.gltf file
 * @param {object} options { environmentLighting, exposure, shadowIntensity, autoRotate }
 */
export function setupFusionViewer(modelViewerElement, modelPath, options = {}) {
  if (!modelViewerElement) return null;

  const config = {
    environmentLighting: 'studio',
    exposure: 1.0,
    shadowIntensity: 1.0,
    autoRotate: true,
    ...options,
  };

  modelViewerElement.setAttribute('camera-controls', '');
  modelViewerElement.setAttribute('touch-action', 'pan-y');
  modelViewerElement.setAttribute('shadow-intensity', config.shadowIntensity);
  modelViewerElement.setAttribute('exposure', config.exposure);
  modelViewerElement.setAttribute('loading', 'lazy');
  if (config.autoRotate) modelViewerElement.setAttribute('auto-rotate', '');
  if (ENVIRONMENTS[config.environmentLighting]) {
    modelViewerElement.setAttribute('environment-image', ENVIRONMENTS[config.environmentLighting]);
  }

  // Register the custom element if needed, then start loading
  ensureModelViewer().then(() => {
    modelViewerElement.setAttribute('src', modelPath);
  });

  // Event listeners for loading states
  modelViewerElement.addEventListener('load', () => {
    console.log('Fusion model loaded successfully:', modelPath);
    // model-viewer v4 exposes materials on `model.materials`;
    // `availableMaterials` was the pre-v2 name, kept for older versions.
    const materials =
      modelViewerElement.availableMaterials || modelViewerElement.model?.materials;
    if (materials && materials.length > 0) {
      console.log(`✓ ${materials.length} materials/appearances preserved from Fusion 360`);
      updateMaterialInfo(modelViewerElement, materials);
    }
  });

  modelViewerElement.addEventListener('error', (e) => {
    console.error('Error loading Fusion model:', e.detail);
    showExportGuide(modelViewerElement);
  });

  modelViewerElement.addEventListener('progress', (e) => {
    updateLoadingProgress(modelViewerElement, e.detail.totalProgress * 100);
  });

  return modelViewerElement;
}

/** Switches the environment lighting on all viewers. */
export function setEnvironment(envName) {
  const envUrl = ENVIRONMENTS[envName];
  if (!envUrl) {
    console.warn('Invalid environment:', envName);
    return;
  }
  document.querySelectorAll('model-viewer').forEach((viewer) => {
    viewer.setAttribute('environment-image', envUrl);
  });
}

/**
 * Wireframe toggle — placeholder. model-viewer has no native wireframe
 * support; this is a hook for a future custom-shader implementation.
 */
export function toggleWireframe(enable) {
  console.log('Wireframe mode:', enable ? 'ON' : 'OFF');
}

/** Exports the current view as a PNG screenshot. */
export async function captureScreenshot(modelViewerElement, filename = 'fusion-model.png') {
  if (!modelViewerElement || typeof modelViewerElement.toBlob !== 'function') return;
  try {
    const blob = await modelViewerElement.toBlob({ width: 1024, height: 1024 });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Screenshot failed:', err);
  }
}

/** Auto-initializes every [data-fusion-model] viewer on the page. */
export function initFusionViewers() {
  const viewers = document.querySelectorAll('[data-fusion-model]');
  viewers.forEach((viewer) => {
    const modelPath = viewer.getAttribute('data-fusion-model');
    const options = JSON.parse(viewer.getAttribute('data-fusion-options') || '{}');
    setupFusionViewer(viewer, modelPath, options);
  });
}
