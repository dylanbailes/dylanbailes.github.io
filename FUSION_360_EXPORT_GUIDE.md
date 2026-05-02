# Fusion 360 Export Guide for Web Viewer

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

Place your exported `.glb` file in:
```
workspace/
└── assets/
    └── models/
        └── your-model.glb
```

### 4. Update HTML

In `index.html`, find the project card and uncomment/configure:

```html
<model-viewer 
  data-fusion-model="assets/models/your-model.glb"
  data-fusion-options='{"environmentLighting": "studio", "exposure": 1.0}'
  alt="3D CAD model from Fusion 360"
  auto-rotate 
  camera-controls 
  touch-action="pan-y"
  shadow-intensity="1"
  environment-image="https://modelviewer.dev/shared-assets/environments/studio.hdr"
  loading="lazy"
  disable-tap>
  
  <div class="model-loading" slot="loading-animation">
    <div class="loading-spinner"></div>
    <p>Loading CAD model...</p>
  </div>
</model-viewer>
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
1. Verify file path is correct (case-sensitive!)
2. Check that the file exists at the specified path
3. Ensure your server serves `.glb` files with correct MIME type: `model/gltf-binary`
4. Check file size - consider compressing large models

### Poor Performance

**Problem:** Model loads slowly or causes lag

**Solutions:**
1. Reduce polygon count in Fusion 360 before export
2. Use texture compression (KTX2/Basis)
3. Enable `loading="lazy"` attribute
4. Consider splitting complex assemblies into multiple viewers

## Advanced Configuration

### Environment Lighting Options

Change how materials appear by switching environment maps:

```javascript
// Available environments:
setEnvironment('studio');    // Neutral studio lighting (default)
setEnvironment('warehouse'); // Industrial warehouse
setEnvironment('park');      // Outdoor park scene
setEnvironment('court');     // Basketball court
```

### Custom Exposure & Shadows

```html
<model-viewer 
  data-fusion-model="assets/models/your-model.glb"
  data-fusion-options='{
    "environmentLighting": "studio",
    "exposure": 1.5,
    "shadowIntensity": 0.8
  }'>
</model-viewer>
```

### Programmatic Control

The following JavaScript functions are available globally:

```javascript
// Setup a viewer manually
setupFusionViewer(element, 'path/to/model.glb', options);

// Change environment lighting
setEnvironment('warehouse');

// Toggle wireframe (placeholder for future implementation)
toggleWireframe(true);

// Capture screenshot
captureScreenshot(viewerElement, 'my-model.png');
```

## Testing Locally

Before deploying, test your setup:

```bash
# Start local development server
npx vite dev

# Visit http://localhost:5173
```

Check browser console for:
- ✅ "✓ X materials/appearances preserved from Fusion 360"
- ⚠️ Warnings about missing materials
- ❌ Error messages about file paths

## Resources

- [model-viewer Documentation](https://modelviewer.dev/)
- [glTF Specification](https://www.khronos.org/gltf/)
- [Fusion 360 Export Help](https://help.autodesk.com/view/fusion360/ENU/)
