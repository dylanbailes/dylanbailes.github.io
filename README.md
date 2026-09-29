# dylanbailes.github.io

Personal engineering portfolio — mechanical design, PCB layout, firmware development and simulation.

Built with **Vite** (vanilla JS + ES modules) and deployed to **GitHub Pages** via GitHub Actions.

## Quick start

```bash
npm ci          # install the audited dependency lockfile
npm run dev     # dev server at http://localhost:5173
npm run build   # production build → dist/
npm test        # verify theme behavior, rendered content, metadata and local links
npm run preview # preview the production build locally
```

## How this site is organized

```
├── index.html          # page template — sections rendered by Vite before loading
├── build/portfolio-html.js # shared rendering, metadata, first-paint theme
├── vite.config.js      # build config (base './' for GitHub Pages)
├── src/
│   ├── config.js       # ★ ALL your content lives here — edit this file
│   ├── main.js         # entry point: imports styles + boots modules
│   ├── styles.css      # all styling (theme tokens, sections, print styles)
│   ├── theme-bootstrap.js # inlined into every page before CSS or modules
│   ├── theme.js        # dark/light theme, persistence and system changes
│   ├── image-assets.js # optimized image dimensions
│   ├── nav.js          # mobile nav + header scroll + logo
│   ├── hero.js         # hero section + role typewriter
│   ├── about.js        # about section + stat counters
│   ├── skills.js       # grouped skill chips + usage readout
│   ├── projects.js     # project cards + filters + media renderers
│   ├── fusion-viewer.js# 3D CAD model viewer (Fusion 360 exports)
│   ├── pcb-viewer.js   # PCB viewer controls (scaffolding)
│   ├── contact.js      # contact section + socials + footer
│   └── smooth-scroll.js# anchor link scrolling
└── .github/workflows/deploy.yml  # builds + deploys to GitHub Pages
```

## Editing your content

**Open `src/config.js`** — it's the single source of truth for your name,
email, social links, about text, stats, skills and
projects. No HTML editing required.

Vite renders the portfolio into HTML from this config in both development and
production. Browser JavaScript attaches filters, galleries, counters, navigation,
and theme controls to the existing content. The portfolio remains readable when
JavaScript is unavailable, and search/share metadata is present in the HTML.

The theme bootstrap and critical background styles run in every page's head, before
stylesheets and modules load. Keep the `<!-- Early theme -->` marker in each page.
Automatic system-theme changes do not create an explicit saved preference.

Photos are served as optimized WebP files. Original JPG/PNG URLs remain available
for existing links. Update `src/image-assets.js` with dimensions when adding photos.
Letter League's security policy permits embedding only from the published
`https://dylanbailes.github.io` origin; use **Open standalone** during local previews.

### Adding a project

Add one object to the `projects` array in `src/config.js`:

```js
{
  title: 'My New Project',
  category: 'mechanical',          // mechanical | pcb | firmware | simulation
  summary: 'One or two sentences about it.',
  specs: [
    { label: 'Material', value: 'Aluminum' },
    { label: 'Weight', value: '1.2 kg' },
  ],
  media: { type: 'image', src: 'assets/images/my-project.jpg' }, // optional
  links: [
    { label: 'Documentation', href: 'https://...', primary: true },
    { label: 'GitHub', href: 'https://...' },
  ],
}
```

Supported `media` types:

| type          | shows                                              |
| ------------- | -------------------------------------------------- |
| `model`       | 3D viewer (Fusion 360 `.glb`) — see FUSION_360_EXPORT_GUIDE.md |
| `pcb`         | PCB viewer placeholder with 2D/3D/Layers controls  |
| `code`        | firmware code snippet                              |
| `simulation`  | heatmap + chart placeholders                       |
| `image`       | plain screenshot / render                          |

### Static files (images, models, CV)

Drop them in **`public/`** — Vite copies the folder into `dist/` as-is:

```
public/
├── assets/
│   ├── images/   your-photo.jpg, project renders…
│   ├── models/   your-model.glb
│   └── cv/       your-cv.pdf
```

Then reference them from `config.js` with paths like `assets/images/me.jpg`
(no `public/` prefix).

## Deploying

Pushes to `main` trigger `.github/workflows/deploy.yml`, which runs
`npm run build` and publishes `dist/` to GitHub Pages.

**One-time setup:** in your repo settings go to
*Settings → Pages → Build and deployment → Source* and select
**"GitHub Actions"**.

## Project ideas / roadmap

- [ ] Replace sample projects and stats in `src/config.js`
- [ ] Add a photo (`public/assets/images/`)
- [ ] Export CAD models from Fusion 360 as `.glb` (see FUSION_360_EXPORT_GUIDE.md)
- [ ] Wire the PCB viewer 3D view with Three.js (`npm i three`)
- [ ] Add a favicon (`public/favicon.svg`)
