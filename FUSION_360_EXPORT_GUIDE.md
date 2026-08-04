# Fusion 360 Export Guide for Web Viewer

This guide covers exporting models from **Fusion 360** and showing them on your
portfolio with the 3D model viewer. The viewer is powered by
[model-viewer](https://modelviewer.dev/) and is loaded automatically whenever a
project in `src/config.js` uses `media: { type: 'model' }`.

## Quick Start

### Best Format: glTF Binary (.glb)

This format **preserves appearances, materials, and textures** from Fusion 360.

## Step-by-Step Export Instructions

### 1. Prepare Your Model in Fusion 360

- Ensure all bodies have appearances applied
- Check that textures are properly mapped
- Simplify geometry if needed (reduce polygon count for web performance)

### 2. Export Settings

```
File → Export (NOT "Save As")
```

**Dialog Settings:**
- **Format:** `glTF Binary (*.glb)`
- **Options:**
  - ✅ Include appearances/textures
  - ✅ Embed textures (don't use external files)
  - ✅ Web optimized (if available)

### 3. File Placement

Place your exported `.glb` file in the `public/` folder (Vite copies it into
the build as-is):

```
public/
└── assets/
    └── models/
        └── your-model.glb
```

### 4. Activate the Viewer

In `src/config.js`, find (or create) the project you want to show the model on
and set its `media`:

```js
{
  title: 'Robotic Arm Assembly',
  category: 'mechanical',
  // ...
  media: {
    type: 'model',
    src: 'assets/models/your-model.glb', // path relative to public/
    alt: '3D CAD model from Fusion 360',
    options: { environmentLighting: 'studio', exposure: 1.0 },
  },
}
```

With an empty `src: ''` the card shows a "TODO: insert your model" placeholder,
so nothing breaks before you have a model file.

### 5. Test Locally

```bash
npm run dev      # dev server → http://localhost:5173
npm run build    # or check the production build
```

## Format Comparison

| Format | Preserves Appearances | File Size | Web Performance | Recommendation |
|--------|----------------------|-----------|-----------------|----------------|
| **.glb** | ✅ Yes | Small | ⭐⭐⭐ Excellent | **BEST** |
| .gltf + textures | ✅ Yes | Medium | ⭐⭐ Good | Alternative |
| .fbx | ✅ Yes | Large | ⭐ Fair | Use if needed |
| .obj + .mtl | ⚠️ Basic only | Medium | ⭐⭐ Good | Legacy support |
| .stl | ❌ No | Small | ⭐⭐⭐ Excellent | Geometry only |

## Appearance Preservation Checklist

To ensure your Fusion 360 appearances are preserved:

- [ ] Use **Export**, not "Save As" or "Download"
- [ ] Select **glTF Binary (.glb)** format
- [ ] Verify appearances are applied to **bodies** (not just components)
- [ ] Use **embedded textures** (not external files)
- [ ] Test the exported file locally before deploying

## Troubleshooting

### No Materials/Appearances Showing

**Problem:** Model loads but appears gray/default color

**Solutions:**
1. Re-export using **glTF Binary (.glb)** format
2. In Fusion 360, apply appearances to individual **bodies**, not just components
3. Ensure "Include appearances" is checked during export
4. Check browser console for error messages

### Model Won't Load

**Problem:** Loading spinner continues indefinitely or shows error

**Solutions:**
1. Verify the file path in `config.js` is correct (case-sensitive!)
2. Check that the file exists in `public/assets/models/`
3. Ensure your server serves `.glb` files with correct MIME type: `model/gltf-binary` (Vite does this automatically)
4. Check file size - consider compressing large models

### Poor Performance

**Problem:** Model loads slowly or causes lag

**Solutions:**
1. Reduce polygon count in Fusion 360 before export
2. Use texture compression (KTX2/Basis)
3. Models are already `loading="lazy"` and the viewer library is loaded on demand
4. Consider splitting complex assemblies into multiple viewers

## Advanced Configuration

### Environment Lighting Options

Change how materials appear by switching environment maps. Available options
for `options.environmentLighting`: `studio` (default), `warehouse`, `park`,
`court`.

### Custom Exposure & Shadows

```js
media: {
  type: 'model',
  src: 'assets/models/your-model.glb',
  options: {
    environmentLighting: 'studio',
    exposure: 1.5,
    shadowIntensity: 0.8,
    autoRotate: false,
  },
}
```

### Programmatic Control

The helper lives in `src/fusion-viewer.js` and exports:

```js
import {
  setupFusionViewer, // configure a <model-viewer> element for a model
  setEnvironment,    // switch environment lighting on all viewers
  toggleWireframe,   // placeholder — model-viewer has no native wireframe
  captureScreenshot, // download the current view as a PNG
} from './fusion-viewer.js';
```

## Resources

- [model-viewer Documentation](https://modelviewer.dev/)
- [glTF Specification](https://www.khronos.org/gltf/)
- [Fusion 360 Export Help](https://help.autodesk.com/view/fusion360/ENU/)
