/**
 * optilatro-viewer.js — The REAL Optilatro bot running in the browser.
 *
 * Unlike a heuristic re-implementation, this viewer loads the actual Python
 * engine from github.com/dylanbailes/Optilatro (vendor/balatro-rl/balatro_sim)
 * into Pyodide (CPython compiled to WebAssembly) and steps the genuine
 * `HeuristicV10` policy against the genuine `BalatroGame` simulator — the
 * exact code path used by `bench/bench_agent_v10.py`. Every decision you see
 * is byte-for-byte what the bot does locally.
 *
 * Data flow:
 *   Pyodide FS  /optilatro/vendor/balatro-rl/balatro_sim/*.py   (engine)
 *               /optilatro/tools/*.json                        (synergy data)
 *               /optilatro/optilatro_bridge.py                 (JSON bridge)
 *   JS  →  bridge.newGame(seed) / bridge.step()  →  JSON snapshot  →  canvas
 */

/* ─── Engine loading ─────────────────────────────────────────────────────── */

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_INDEX = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const ENGINE_BASE = new URL('optilatro/', document.baseURI).href;

/** Map a manifest-relative path to its Pyodide FS location (repo layout). */
function mapEnginePath(rel) {
  if (rel.startsWith('balatro_sim/')) {
    return `/optilatro/vendor/balatro-rl/${rel}`;
  }
  return `/optilatro/${rel}`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function ensureDir(fs, dirPath) {
  const parts = dirPath.split('/').filter(Boolean);
  let cur = '';
  for (const part of parts) {
    cur += `/${part}`;
    try { fs.mkdir(cur); } catch { /* already exists */ }
  }
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const SUIT_COLORS = { '♠': '#1c1c22', '♥': '#d64545', '♦': '#e08a3c', '♣': '#3a5a8c' };

const ENHANCEMENT_STYLE = {
  Bonus:  { label: '+30',  color: '#5ba3f5' },
  Mult:   { label: '+4',   color: '#e5484d' },
  Wild:   { label: 'WILD', color: '#a371f7' },
  Glass:  { label: '×2',   color: '#9ad0f0' },
  Steel:  { label: '×1.5', color: '#8b9bb0' },
  Stone:  { label: '+50',  color: '#a6a59f' },
  Gold:   { label: '$3',   color: '#f5a623' },
  Lucky:  { label: 'LUCKY', color: '#e8c547' },
};

const SEAL_COLORS = { Red: '#ff3b30', Blue: '#5ba3f5', Gold: '#f5a623', Purple: '#a371f7' };

const EDITION_COLORS = { Foil: '#5ba3f5', Holographic: '#ff6ec7', Polychrome: '#b388ff', Negative: '#555' };

const KIND_LABELS = {
  joker: 'JOKER', planet: 'PLANET', tarot: 'TAROT', spectral: 'SPECTRAL',
  voucher: 'VOUCHER', booster: 'PACK', card: 'CARD',
};

/* ─── Joker display metadata (Joker-Display-mod style) ───────────────────── */

let jokerSpec = {}; // key -> {name, effect, type, timing} from tools/joker_spec.json

const SPEC_TYPE_TO_CATEGORY = {
  Chips: 'chips',
  'Chips+Mult': 'chips',
  '+Mult': 'mult',
  xMult: 'xmult',
  Economy: 'econ',
  Effect: 'misc',
  Retrigger: 'misc',
};

const CATEGORY_ICON_COLOR = {
  chips: '#5ba3f5',
  mult: '#e5484d',
  xmult: '#b388ff',
  econ: '#f5a623',
  misc: '#a6a59f',
};

/** Resolve display metadata (category icon + short effect) for a joker key. */
function jokerMeta(key) {
  const spec = jokerSpec[key];
  if (!spec) return { category: 'misc', effect: '' };
  return {
    category: SPEC_TYPE_TO_CATEGORY[spec.type] || 'misc',
    effect: spec.effect || '',
  };
}

/* Per-action pacing (ms at 1x speed) — the bot's decision time adds on top.
   Shop actions are paced slower so the agent's buying/rerolling is watchable. */
const PACE_MS = {
  play_blind: 900, skip_blind: 500, play: 800, discard: 550,
  buy: 750, sell_joker: 700, use_consumable: 700, reroll: 600,
  reroll_boss: 600, leave_shop: 500, pick_booster: 650, skip_booster: 400,
  noop: 260,
};

/* ─── State ──────────────────────────────────────────────────────────────── */

let canvas, ctx;
let animationFrame;

let enginePromise = null;
let engineReady = false;
let bridge = null;

let snap = null;
let running = false;
let paused = false;
let speed = 5;
let loopGen = 0;

let gamesPlayed = 0;
let wins = 0;
let nextSeed = 0;
let lastEval = null;
let lastActionText = '';

/* ─── Engine bootstrap ───────────────────────────────────────────────────── */

function setOverlay(text, progress) {
  const el = document.getElementById('sim-overlay');
  if (!el) return;
  el.hidden = false;
  const txt = el.querySelector('.sim-overlay__text');
  if (txt) txt.textContent = text;
  const bar = el.querySelector('.sim-overlay__progress-fill');
  if (bar) bar.style.width = `${Math.round((progress || 0) * 100)}%`;
}

async function ensureEngine() {
  if (enginePromise) return enginePromise;
  enginePromise = (async () => {
    setOverlay('Loading Python runtime (Pyodide)…', 0.02);
    await loadScript(`${PYODIDE_INDEX}pyodide.js`);
    // eslint-disable-next-line no-undef
    const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX });

    setOverlay('Fetching Optilatro engine files…', 0.15);
    const manifest = await (await fetch(new URL('manifest.json', ENGINE_BASE))).json();
    // Joker display metadata (short effects + categories) for the UI panels.
    try {
      jokerSpec = await (await fetch(new URL('tools/joker_spec.json', ENGINE_BASE))).json();
    } catch { jokerSpec = {}; }
    const files = manifest.files;
    for (let i = 0; i < files.length; i++) {
      const rel = files[i];
      const res = await fetch(new URL(rel, ENGINE_BASE));
      if (!res.ok) throw new Error(`Engine file fetch failed: ${rel} (${res.status})`);
      const text = await res.text();
      const fsPath = mapEnginePath(rel);
      ensureDir(pyodide.FS, fsPath.substring(0, fsPath.lastIndexOf('/')));
      pyodide.FS.writeFile(fsPath, text);
      setOverlay(`Fetching engine files… (${i + 1}/${files.length})`, 0.15 + 0.6 * ((i + 1) / files.length));
    }

    setOverlay('Booting Optilatro engine (heuristic_v10)…', 0.85);
    pyodide.runPython(
      'import sys; sys.path.insert(0, "/optilatro"); import optilatro_bridge'
    );
    const info = JSON.parse(pyodide.runPython('optilatro_bridge.engine_info()'));

    const B = pyodide.globals.get('optilatro_bridge');
    bridge = {
      newGame: (seed) => JSON.parse(B.new_game(seed)),
      step: () => JSON.parse(B.step()),
    };

    engineReady = true;
    setOverlay('Engine ready', 1);
    syncButtons();
    addLog(`Real engine loaded — Python ${info.python}, policy ${info.engine}`, 'system');
    addLog('Decisions come from the actual Optilatro Python code (Pyodide/WASM).', 'system');

    // Hide the overlay shortly after ready so the idle canvas is visible.
    setTimeout(() => {
      const el = document.getElementById('sim-overlay');
      if (el && engineReady) el.hidden = true;
    }, 900);

    return info;
  })().catch((err) => {
    enginePromise = null;
    setOverlay(`Engine failed to load: ${err.message}`, 0);
    addLog(`Engine load error: ${err.message}`, 'error');
    throw err;
  });
  return enginePromise;
}

/* ─── Run loop ───────────────────────────────────────────────────────────── */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function paceFor(actionType) {
  return (PACE_MS[actionType] || 400) / speed;
}

async function runLoop() {
  const gen = ++loopGen;

  while (running && !paused && gen === loopGen) {
    if (!snap || snap.done) {
      snap = bridge.newGame(nextSeed++);
      lastEval = null;
      lastActionText = '';
      addLog(`New run — seed ${snap.seed} · heuristic_v10 · Red Deck / White Stake`, 'system');
      updatePanels();
      await sleep(700 / speed);
      continue;
    }

    let out;
    try {
      out = bridge.step();
    } catch (err) {
      addLog(`Engine error: ${err.message}`, 'error');
      running = false;
      syncButtons();
      return;
    }

    snap = out.snapshot;
    const act = out.action || {};
    if (act.eval) lastEval = act.eval;
    lastActionText = act.desc || '';
    if (act.desc) addLog(act.desc, actionLogClass(act.type));
    if (act.ms !== undefined && act.ms > 50) {
      // Slow decisions are interesting — surface them.
      addLog(`  ↳ decided in ${act.ms.toFixed(0)} ms`, 'system');
    }

    updatePanels();

    if (snap.done) {
      gamesPlayed++;
      if (snap.won) wins++;
      addLog(
        snap.won
          ? `★ WIN — Ante 8 cleared on seed ${snap.seed}`
          : `✗ LOSS — eliminated at Ante ${snap.ante} on seed ${snap.seed}`,
        snap.won ? 'success' : 'error'
      );
      updateStats();
      await sleep(2000 / Math.max(1, Math.sqrt(speed)));
      continue;
    }

    await sleep(paceFor(act.type));
  }
}

function actionLogClass(type) {
  if (type === 'play') return 'success';
  if (type === 'discard') return '';
  if (type === 'buy' || type === 'sell_joker') return 'system';
  return '';
}

/* ─── Theme colors ───────────────────────────────────────────────────────── */

function getThemeColors() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  if (theme === 'dark') {
    return {
      paper: '#0b0b0b', surface: '#141414', ink: '#f2f2ee',
      muted: '#8b8b85', faint: '#565650', line: '#2c2c2a',
      accent: '#ff3b30', good: '#4cd964',
    };
  }
  return {
    paper: '#f4f4f1', surface: '#ffffff', ink: '#111110',
    muted: '#75746e', faint: '#a6a59f', line: '#d8d7d2',
    accent: '#ff3b30', good: '#3aa655',
  };
}

/* ─── Drawing primitives ─────────────────────────────────────────────────── */

function drawCard(card, x, y, w, h, opts = {}) {
  const c = getThemeColors();
  const { dimmed = false } = opts;

  ctx.save();
  if (dimmed) ctx.globalAlpha = 0.45;

  const r = 4;
  const isStone = card.enhancement === 'Stone';

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = isStone ? c.line : c.surface;
  ctx.fill();

  // Edition border
  const edColor = EDITION_COLORS[card.edition];
  ctx.strokeStyle = edColor || c.line;
  ctx.lineWidth = edColor ? 2 : 1;
  ctx.stroke();

  if (card.flipped) {
    // Face-down (The House / The Fish / The Mark)
    ctx.fillStyle = c.ink;
    ctx.beginPath();
    ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 3);
    ctx.fill();
    ctx.restore();
    return;
  }

  const suitColor = SUIT_COLORS[card.symbol] || c.ink;

  if (isStone) {
    ctx.font = `bold ${h * 0.22}px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = c.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STONE', x + w / 2, y + h / 2);
  } else {
    // Suit symbol (center)
    ctx.font = `${h * 0.34}px serif`;
    ctx.fillStyle = suitColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.symbol, x + w / 2, y + h * 0.44);

    // Rank (top-left)
    ctx.font = `bold ${h * 0.19}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(card.rankName, x + w * 0.09, y + h * 0.05);

    // Enhancement badge (bottom)
    const enh = ENHANCEMENT_STYLE[card.enhancement];
    if (enh) {
      ctx.font = `bold ${Math.max(7, h * 0.11)}px 'IBM Plex Mono', monospace`;
      ctx.fillStyle = enh.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(enh.label, x + w / 2, y + h * 0.97);
    }
  }

  // Seal dot (bottom-right)
  const sealColor = SEAL_COLORS[card.seal];
  if (sealColor) {
    ctx.beginPath();
    ctx.arc(x + w * 0.86, y + h * 0.88, Math.max(2.5, w * 0.055), 0, Math.PI * 2);
    ctx.fillStyle = sealColor;
    ctx.fill();
  }

  // Debuffed overlay
  if (card.debuffed) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = 'rgba(128, 128, 128, 0.45)';
    ctx.fill();
  }

  ctx.restore();
}

function drawJoker(joker, x, y, w, h) {
  const c = getThemeColors();
  const edColor = EDITION_COLORS[joker.edition];

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fillStyle = c.surface;
  ctx.fill();
  ctx.strokeStyle = edColor || c.line;
  ctx.lineWidth = edColor ? 2 : 1;
  ctx.stroke();

  // Top stripe
  ctx.beginPath();
  ctx.roundRect(x, y, w, 4, [3, 3, 0, 0]);
  ctx.fillStyle = edColor || c.accent;
  ctx.fill();

  // Category icon (chips / mult / xmult / econ / misc)
  drawCategoryIcon(jokerMeta(joker.key).category, x + w / 2, y + h * 0.28, w * 0.4);

  // Name (wrapped, up to 2 lines)
  ctx.font = `${Math.min(9, w * 0.12)}px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  wrapText(joker.name, 12, 2).forEach((line, i) => {
    ctx.fillText(line, x + w / 2, y + h * 0.55 + i * (h * 0.17));
  });

  ctx.restore();

  // Short effect text beneath the card (Balatro Joker-Display-mod style)
  const effect = jokerMeta(joker.key).effect;
  if (effect) {
    ctx.save();
    ctx.font = `7px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = c.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    wrapText(effect, 17, 3).forEach((line, i) => {
      ctx.fillText(line, x + w / 2, y + h + 4 + i * 8);
    });
    ctx.restore();
  }
}

/** Wrap text into at most `maxLines` lines of `maxChars` characters. */
function wrapText(text, maxChars, maxLines) {
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (test.length > maxChars && cur) {
      lines.push(cur);
      cur = word;
      if (lines.length === maxLines) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

/**
 * Category icon drawn as vector primitives — mirrors public/optilatro/icons/*.svg
 * (chips / mult / xmult / econ / misc), centered at (cx, cy) at size `s`.
 */
function drawCategoryIcon(category, cx, cy, s) {
  const color = CATEGORY_ICON_COLOR[category] || CATEGORY_ICON_COLOR.misc;
  const r = s / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.09);

  if (category === 'chips') {
    // Stacked poker chips
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.45, r * 0.85, r * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.85, cy - r * 0.45);
    ctx.lineTo(cx - r * 0.85, cy + r * 0.15);
    ctx.moveTo(cx + r * 0.85, cy - r * 0.45);
    ctx.lineTo(cx + r * 0.85, cy + r * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.15, r * 0.85, r * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (category === 'mult' || category === 'xmult') {
    // Rounded square with + or ×
    const q = r * 0.95;
    ctx.beginPath();
    ctx.roundRect(cx - q, cy - q, q * 2, q * 2, q * 0.35);
    ctx.stroke();
    ctx.lineWidth = Math.max(1.2, s * 0.11);
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (category === 'mult') {
      ctx.moveTo(cx, cy - q * 0.5); ctx.lineTo(cx, cy + q * 0.5);
      ctx.moveTo(cx - q * 0.5, cy); ctx.lineTo(cx + q * 0.5, cy);
    } else {
      ctx.moveTo(cx - q * 0.5, cy - q * 0.5); ctx.lineTo(cx + q * 0.5, cy + q * 0.5);
      ctx.moveTo(cx + q * 0.5, cy - q * 0.5); ctx.lineTo(cx - q * 0.5, cy + q * 0.5);
    }
    ctx.stroke();
  } else if (category === 'econ') {
    // Coin with $
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `bold ${s}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy + s * 0.05);
  } else {
    // Four-point sparkle
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx + r * 0.18, cy - r * 0.18, cx + r, cy);
    ctx.quadraticCurveTo(cx + r * 0.18, cy + r * 0.18, cx, cy + r);
    ctx.quadraticCurveTo(cx - r * 0.18, cy + r * 0.18, cx - r, cy);
    ctx.quadraticCurveTo(cx - r * 0.18, cy - r * 0.18, cx, cy - r);
    ctx.stroke();
  }
  ctx.restore();
}

function drawConsumable(cons, x, y, w, h) {
  const c = getThemeColors();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fillStyle = c.surface;
  ctx.fill();
  ctx.strokeStyle = '#a371f7';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = `${h * 0.28}px serif`;
  ctx.fillStyle = '#a371f7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('☾', x + w / 2, y + h * 0.35);

  ctx.font = `${Math.min(8, w * 0.12)}px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.ink;
  ctx.textBaseline = 'top';
  const name = cons.name.length > 12 ? `${cons.name.slice(0, 11)}…` : cons.name;
  ctx.fillText(name, x + w / 2, y + h * 0.58);
  ctx.restore();
}

function drawPanel(x, y, w, h, title) {
  const c = getThemeColors();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fillStyle = c.surface;
  ctx.fill();
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  if (title) {
    ctx.font = `bold 11px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = c.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, x + 10, y + 8);
  }
  ctx.restore();
}

/* ─── Main render ────────────────────────────────────────────────────────── */

function render() {
  if (!canvas || !ctx) return;

  const c = getThemeColors();
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width;
  const H = rect.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, W, H);

  if (!snap || !snap.ready) {
    drawIdleState(W, H, c);
    animationFrame = requestAnimationFrame(render);
    return;
  }

  drawTopBar(W, c);
  drawConsumableRow(W, c);
  drawJokerRow(c);
  drawHandArea(W, H, c);
  drawStatePanel(W, H, c);
  drawBottomStatus(W, H, c);

  animationFrame = requestAnimationFrame(render);
}

function drawIdleState(W, H, c) {
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  ctx.font = `bold 16px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = c.faint;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OPTILATRO — REAL ENGINE', W / 2, H / 2 - 16);
  ctx.font = `11px 'IBM Plex Mono', monospace`;
  ctx.fillText('Loading the actual Python bot (Pyodide)…', W / 2, H / 2 + 10);
}

function drawTopBar(W, c) {
  const s = snap;
  const pad = 16;

  // Blind info (left)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `bold 13px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = c.ink;
  ctx.fillText(`${s.blind.name.toUpperCase()}${s.blind.bossDisplay ? ` — ${s.blind.bossDisplay}` : ''}`, pad, pad);

  ctx.font = `11px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.muted;
  ctx.fillText(`Target ${s.blind.target.toLocaleString()}   Scored ${s.chipsScored.toLocaleString()}`, pad, pad + 18);
  ctx.fillText(`Hands ${s.handsLeft}   Discards ${s.discardsLeft}   Deck ${s.deckRemaining}`, pad, pad + 33);

  // Chips progress bar
  const barW = Math.min(260, W * 0.3);
  const frac = Math.min(1, s.chipsScored / Math.max(1, s.blind.target));
  ctx.beginPath();
  ctx.roundRect(pad, pad + 50, barW, 7, 3);
  ctx.fillStyle = c.line;
  ctx.fill();
  if (frac > 0) {
    ctx.beginPath();
    ctx.roundRect(pad, pad + 50, barW * frac, 7, 3);
    ctx.fillStyle = frac >= 1 ? c.good : c.accent;
    ctx.fill();
  }

  // Money + ante (right)
  ctx.textAlign = 'right';
  ctx.font = `bold 20px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = '#f5a623';
  ctx.fillText(`$${s.dollars}`, W - pad, pad);
  ctx.font = `11px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.muted;
  ctx.fillText(`Ante ${s.ante}/8 · seed ${s.seed} · heuristic_v10`, W - pad, pad + 26);
}

function drawJokerRow(c) {
  const s = snap;
  if (!s.jokers.length) return;
  const jokerW = 78;
  const jokerH = 72;
  const gap = 10;
  const x0 = 16;
  const y0 = 100; // card bottom = 172; effect text extends ~28px below each card

  ctx.font = `10px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.faint;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`JOKERS ${s.jokers.length}/5`, x0, y0 - 14);

  s.jokers.forEach((j, i) => {
    drawJoker(j, x0 + i * (jokerW + gap), y0, jokerW, jokerH);
  });
}

function drawConsumableRow(W, c) {
  const s = snap;
  if (!s.consumables.length) return;
  const w = 52;
  const h = 58;
  const gap = 6;
  const totalW = s.consumables.length * w + (s.consumables.length - 1) * gap;
  const x0 = W - 16 - totalW; // upper-right corner, under the money readout
  const y0 = 74;

  ctx.font = `10px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.faint;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('CONSUMABLES', W - 16, y0 - 14);

  s.consumables.forEach((cons, i) => {
    drawConsumable(cons, x0 + i * (w + gap), y0, w, h);
  });
}

function drawHandArea(W, H, c) {
  const s = snap;
  const cards = s.hand || [];
  if (!cards.length) return;

  const cardW = Math.min(64, (W - 80) / Math.max(cards.length, 1) - 8);
  const cardH = cardW * 1.42;
  const gap = 8;
  const totalW = cards.length * cardW + (cards.length - 1) * gap;
  const x0 = (W - totalW) / 2;
  const y0 = H - cardH - 44;

  ctx.font = `10px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.faint;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`HAND (${cards.length})`, x0, y0 - 16);

  cards.forEach((card, i) => {
    drawCard(card, x0 + i * (cardW + gap), y0, cardW, cardH);
  });
}

function drawStatePanel(W, H, c) {
  const s = snap;

  if (s.state === 'SHOP' && s.shop.length) {
    const panelW = Math.min(460, W - 32);
    const rowH = 20;
    const panelH = 34 + s.shop.length * rowH;
    const x = (W - panelW) / 2;
    const y = 218; // below the joker row + effect text
    drawPanel(x, y, panelW, panelH, 'SHOP — BOT DECIDING');

    ctx.font = `11px 'IBM Plex Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    s.shop.forEach((item, i) => {
      const ry = y + 26 + i * rowH;
      const kind = KIND_LABELS[item.kind] || item.kind.toUpperCase();
      const ed = item.edition !== 'None' ? ` [${item.edition}]` : '';
      ctx.fillStyle = item.sold ? c.faint : c.ink;
      const label = `${kind.padEnd(8)} ${item.name}${ed}`;
      ctx.fillText(label, x + 12, ry);
      ctx.textAlign = 'right';
      ctx.fillStyle = item.sold ? c.faint : '#f5a623';
      ctx.fillText(item.sold ? 'SOLD' : `$${item.price}`, x + panelW - 12, ry);
      ctx.textAlign = 'left';
    });
  }

  if (s.state === 'BOOSTER_OPEN' && s.boosterChoices.length) {
    const panelW = Math.min(460, W - 32);
    const rowH = 20;
    const panelH = 34 + s.boosterChoices.length * rowH;
    const x = (W - panelW) / 2;
    const y = 218; // below the joker row + effect text
    drawPanel(x, y, panelW, panelH, 'BOOSTER PACK — BOT PICKING');

    ctx.font = `11px 'IBM Plex Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    s.boosterChoices.forEach((choice, i) => {
      const ry = y + 26 + i * rowH;
      const kind = KIND_LABELS[choice.kind] || choice.kind.toUpperCase();
      const ed = choice.edition && choice.edition !== 'None' ? ` [${choice.edition}]` : '';
      ctx.fillStyle = c.ink;
      ctx.fillText(`${kind.padEnd(8)} ${choice.name}${ed}`, x + 12, ry);
    });
  }

  if (s.state === 'BLIND_SELECT') {
    ctx.font = `bold 12px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = c.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('SELECTING BLIND — bot weighing skip vs play…', W / 2, H * 0.45);
  }

  if (s.state === 'ROUND_EVAL') {
    ctx.font = `bold 12px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = c.good;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('ROUND CLEAR — collecting payout…', W / 2, H * 0.45);
  }

  if (s.done) {
    ctx.save();
    ctx.fillStyle = s.won ? 'rgba(76, 217, 100, 0.12)' : 'rgba(255, 59, 48, 0.10)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = `bold 26px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = s.won ? c.good : c.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.won ? '★ ANTE 8 CLEARED — WIN' : `ELIMINATED — ANTE ${s.ante}`, W / 2, H / 2);
    ctx.font = `12px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = c.muted;
    ctx.fillText(`seed ${s.seed} · starting next run…`, W / 2, H / 2 + 26);
    ctx.restore();
  }
}

function drawBottomStatus(W, H, c) {
  if (!lastActionText) return;
  ctx.font = `11px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.muted;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  const text = lastActionText.length > 110 ? `${lastActionText.slice(0, 109)}…` : lastActionText;
  ctx.fillText(text, W / 2, H - 10);
}

/* ─── Sidebar DOM updates ────────────────────────────────────────────────── */

function updateStats() {
  const el = (id) => document.getElementById(id);
  if (el('stat-winrate')) {
    el('stat-winrate').textContent = gamesPlayed > 0
      ? `${((wins / gamesPlayed) * 100).toFixed(1)}%` : '—';
  }
  if (el('stat-games')) el('stat-games').textContent = gamesPlayed;
  if (el('stat-ante')) el('stat-ante').textContent = snap ? `${snap.ante} / 8` : '—';
  if (el('stat-blind')) {
    el('stat-blind').textContent = snap
      ? (snap.blind.bossDisplay || snap.blind.kind)
      : '—';
  }
}

function updateHandEvalPanel() {
  const el = document.getElementById('sim-hand-eval');
  if (!el) return;

  if (!lastEval) {
    el.innerHTML = '<p class="sim-placeholder-text">Waiting for the bot to play a hand…</p>';
    return;
  }

  el.innerHTML = `
    <div class="hand-eval-row">
      <span class="hand-eval-label">Last Hand Played</span>
      <span class="hand-eval-value hand-eval-value--accent">${lastEval.type}</span>
    </div>
    <div class="hand-eval-row">
      <span class="hand-eval-label">Cards Played</span>
      <span class="hand-eval-value">${lastEval.count}</span>
    </div>
    <div class="hand-eval-row">
      <span class="hand-eval-label">Chips Gained</span>
      <span class="hand-eval-value">+${(lastEval.gained || 0).toLocaleString()}</span>
    </div>
    <div class="hand-eval-row hand-eval-row--total">
      <span class="hand-eval-label">Blind Progress</span>
      <span class="hand-eval-value hand-eval-value--accent">${snap ? `${Math.min(100, Math.round((snap.chipsScored / Math.max(1, snap.blind.target)) * 100))}%` : '—'}</span>
    </div>
  `;
}

function updateJokerPanel() {
  const el = document.getElementById('sim-joker-panel');
  if (!el) return;
  if (!snap || snap.jokers.length === 0) {
    el.innerHTML = '<p class="sim-placeholder-text">No jokers owned yet</p>';
    return;
  }
  el.innerHTML = snap.jokers.map((j) => {
    const meta = jokerMeta(j.key);
    const iconFile = `${meta.category}.svg`;
    const ed = j.edition !== 'None' ? `<span class="joker-edition">${j.edition}</span>` : '';
    const effect = meta.effect
      ? `<span class="joker-effect" title="${meta.effect.replace(/"/g, '"')}">${meta.effect}</span>`
      : '';
    return `
      <div class="joker-row">
        <img class="joker-row__icon" src="${new URL(`icons/${iconFile}`, ENGINE_BASE).href}" alt="" width="18" height="18">
        <div class="joker-row__body">
          <div class="joker-row__head">
            <span class="joker-name">${j.name}</span>
            ${ed}
          </div>
          ${effect}
        </div>
      </div>
    `;
  }).join('');
}

function updatePanels() {
  updateStats();
  updateHandEvalPanel();
  updateJokerPanel();
}

function addLog(msg, type = '') {
  const el = document.getElementById('sim-log');
  if (!el) return;

  const now = new Date();
  const time = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const entry = document.createElement('div');
  entry.className = `sim-log__entry ${type ? `sim-log__entry--${type}` : ''}`;
  entry.innerHTML = `<span class="sim-log__time">${time}</span><span class="sim-log__msg"></span>`;
  entry.querySelector('.sim-log__msg').textContent = msg;
  el.appendChild(entry);
  el.scrollTop = el.scrollHeight;

  while (el.children.length > 80) {
    el.removeChild(el.firstChild);
  }
}

/* ─── Controls ───────────────────────────────────────────────────────────── */

function syncButtons() {
  const startBtn = document.getElementById('sim-start-btn');
  const pauseBtn = document.getElementById('sim-pause-btn');
  if (startBtn) {
    startBtn.disabled = running || !engineReady;
    startBtn.textContent = !engineReady ? 'Loading engine…' : (running ? 'Running…' : 'Start Run');
  }
  if (pauseBtn) {
    pauseBtn.disabled = !running;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  }
}

function bindControls() {
  const startBtn = document.getElementById('sim-start-btn');
  const pauseBtn = document.getElementById('sim-pause-btn');
  const resetBtn = document.getElementById('sim-reset-btn');
  const speedSlider = document.getElementById('sim-speed');
  const speedValue = document.getElementById('sim-speed-value');

  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      if (running) return;
      try {
        await ensureEngine();
      } catch {
        return; // error already surfaced
      }
      running = true;
      paused = false;
      syncButtons();
      runLoop();
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!running) return;
      paused = !paused;
      syncButtons();
      if (!paused) runLoop();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      running = false;
      paused = false;
      loopGen++; // cancel any in-flight loop
      snap = null;
      lastEval = null;
      lastActionText = '';
      gamesPlayed = 0;
      wins = 0;
      nextSeed = 0;

      const logEl = document.getElementById('sim-log');
      if (logEl) {
        logEl.innerHTML = '';
        addLog('Simulator reset. Press Start Run to begin.', 'system');
      }

      updatePanels();
      syncButtons();
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      speed = parseInt(speedSlider.value, 10);
      if (speedValue) speedValue.textContent = `${speed}x`;
    });
  }
}

/* ─── Public API ─────────────────────────────────────────────────────────── */

let initialized = false;

export function initOptilatroViewer() {
  if (initialized) return;
  initialized = true;

  canvas = document.getElementById('optilatro-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  bindControls();
  syncButtons();
  render();

  // Begin loading the engine immediately (runs while the user reads the page).
  ensureEngine().catch(() => { /* surfaced in overlay + log */ });
}