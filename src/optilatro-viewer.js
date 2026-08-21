/**
 * optilatro-viewer.js — Canvas-based Balatro game state visualization.
 *
 * Renders a simplified but visually faithful Balatro playfield:
 *   • Hand of 8 cards with suits and ranks
 *   • Joker row with mini-card previews
 *   • Score / mult / chips readout
 *   • Blind target bar
 *   • Animated card selection and scoring
 *
 * The "bot" selects hands using a greedy heuristic (highest-scoring hand
 * type available). This is a *visual demo* — the real Optilatro engine
 * runs Python; here we replay its decision style in-browser.
 */

/* ─── Constants ──────────────────────────────────────────────────────────── */

const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_COLORS = { '♠': '#d0d0cb', '♥': '#ff3b30', '♦': '#5ba3f5', '♣': '#4cd964' };
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11 };

const HAND_TYPES = [
  { name: 'Royal Flush',    base: 100, mult: 8,  min: 5 },
  { name: 'Straight Flush',  base: 100, mult: 8,  min: 5 },
  { name: 'Four of a Kind', base: 60,  mult: 7,  min: 4 },
  { name: 'Full House',     base: 40,  mult: 4,  min: 5 },
  { name: 'Flush',          base: 35,  mult: 4,  min: 5 },
  { name: 'Straight',       base: 30,  mult: 4,  min: 5 },
  { name: 'Three of a Kind',base: 30,  mult: 3,  min: 3 },
  { name: 'Two Pair',       base: 20,  mult: 2,  min: 4 },
  { name: 'Pair',           base: 10,  mult: 2,  min: 2 },
  { name: 'High Card',      base: 5,   mult: 1,  min: 1 },
];

const BLINDS = [
  { name: 'Small Blind',  base: 300 },
  { name: 'Big Blind',    base: 450 },
  { name: 'Boss Blind',   base: 600 },
];

const JOKER_DEFS = [
  { name: 'Joker',        effect: '+4 Mult',        color: '#e5484d' },
  { name: 'Greedy Joker', effect: '+3 Mult per Diamond played', color: '#5ba3f5' },
  { name: 'Lusty Joker',  effect: '+3 Mult per Heart played',   color: '#ff3b30' },
  { name: 'Wrathful Joker', effect: '+3 Mult per Spade played', color: '#d0d0cb' },
  { name: 'Gluttony Joker', effect: '+3 Mult per Club played',  color: '#4cd964' },
  { name: 'Abstract Joker', effect: '+3 Mult per Joker owned',  color: '#a371f7' },
  { name: 'Half Joker',   effect: '+20 Mult if hand ≤ 3 cards', color: '#f5a623' },
  { name: 'Mystic Summit', effect: '+15 Mult if discards = 0',  color: '#2dd4bf' },
];

const CARD_BACK_COLORS = {
  light: { bg: '#ffffff', border: '#d8d7d2', shadow: '#c8c8c2' },
  dark:  { bg: '#1a1a1a', border: '#2c2c2a', shadow: '#0b0b0b' },
};

/* ─── State ──────────────────────────────────────────────────────────────── */

let canvas, ctx;
let animationFrame;
let simRunning = false;
let simPaused = false;
let simSpeed = 5;
let simState = null;
let simLog = [];
let startTime = 0;

/* ─── Card class ─────────────────────────────────────────────────────────── */

class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
    this.selected = false;
    this.scored = false;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.scale = 1;
    this.opacity = 1;
    this.rotation = 0;
    this.targetRotation = 0;
  }

  get value() { return RANK_VALUES[this.rank]; }
  get color() { return SUIT_COLORS[this.suit]; }
  get isRed() { return this.suit === '♥' || this.suit === '♦'; }
}

/* ─── Deck / Hand utilities ──────────────────────────────────────────────── */

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(new Card(rank, suit));
    }
  }
  return shuffle(deck);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Hand evaluation (simplified) ───────────────────────────────────────── */

function evaluateHand(cards) {
  if (cards.length === 0) return { type: 'None', base: 0, mult: 0, chips: 0 };

  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);
  const values = cards.map(c => c.value);

  // Count rank frequency
  const freq = {};
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1;
  const freqs = Object.values(freq).sort((a, b) => b - a);

  // Check flush
  const isFlush = suits.every(s => s === suits[0]) && cards.length >= 5;

  // Check straight
  const uniqueVals = [...new Set(values)].sort((a, b) => a - b);
  let isStraight = false;
  if (uniqueVals.length >= 5) {
    for (let i = 0; i <= uniqueVals.length - 5; i++) {
      if (uniqueVals[i + 4] - uniqueVals[i] === 4) isStraight = true;
    }
    // Ace-low straight (A-2-3-4-5)
    if (uniqueVals.includes(11) && uniqueVals.includes(2) && uniqueVals.includes(3) && uniqueVals.includes(4) && uniqueVals.includes(5)) {
      isStraight = true;
    }
  }

  let handType = 'High Card';
  let base = 5, mult = 1;

  if (isFlush && isStraight) {
    // Check royal
    const hasRoyal = values.includes(10) && values.includes(11) && ranks.includes('K') && ranks.includes('Q') && ranks.includes('J');
    if (hasRoyal && cards.length === 5) {
      handType = 'Royal Flush'; base = 100; mult = 8;
    } else {
      handType = 'Straight Flush'; base = 100; mult = 8;
    }
  } else if (freqs[0] >= 4) {
    handType = 'Four of a Kind'; base = 60; mult = 7;
  } else if (freqs[0] >= 3 && freqs[1] >= 2) {
    handType = 'Full House'; base = 40; mult = 4;
  } else if (isFlush) {
    handType = 'Flush'; base = 35; mult = 4;
  } else if (isStraight) {
    handType = 'Straight'; base = 30; mult = 4;
  } else if (freqs[0] >= 3) {
    handType = 'Three of a Kind'; base = 30; mult = 3;
  } else if (freqs[0] >= 2 && freqs[1] >= 2) {
    handType = 'Two Pair'; base = 20; mult = 2;
  } else if (freqs[0] >= 2) {
    handType = 'Pair'; base = 10; mult = 2;
  } else {
    handType = 'High Card'; base = 5; mult = 1;
  }

  const chips = base + values.reduce((s, v) => s + v, 0);
  return { type: handType, base, mult, chips, total: chips * mult };
}

/* ─── Bot decision: pick best hand from dealt cards ──────────────────────── */

function botSelectHand(hand) {
  // Try all 5-card combos to find the best hand type (simplified — real Optilatro
  // does full search, here we use a greedy heuristic).
  if (hand.length <= 5) {
    return { cards: hand, eval: evaluateHand(hand) };
  }

  let bestEval = null;
  let bestCombo = null;

  // Check all 5-card combos (brute-force is fine for 8C5 = 56 combos)
  const combos = getCombinations(hand, 5);
  for (const combo of combos) {
    const ev = evaluateHand(combo);
    if (!bestEval || ev.total > bestEval.total ||
        (ev.total === bestEval.total && handTypeRank(ev.type) < handTypeRank(bestEval.type))) {
      bestEval = ev;
      bestCombo = combo;
    }
  }

  return { cards: bestCombo || hand.slice(0, 5), eval: bestEval || evaluateHand(hand.slice(0, 5)) };
}

function handTypeRank(name) {
  return HAND_TYPES.findIndex(h => h.name === name);
}

function getCombinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

/* ─── Joker selection ────────────────────────────────────────────────────── */

function selectJokers(count) {
  const available = shuffle([...JOKER_DEFS]);
  return available.slice(0, Math.min(count, available.length));
}

function jokerMultiplier(jokers, playedCards) {
  let bonus = 0;
  for (const j of jokers) {
    if (j.name === 'Joker') bonus += 4;
    else if (j.name === 'Greedy Joker') bonus += playedCards.filter(c => c.suit === '♦').length * 3;
    else if (j.name === 'Lusty Joker') bonus += playedCards.filter(c => c.suit === '♥').length * 3;
    else if (j.name === 'Wrathful Joker') bonus += playedCards.filter(c => c.suit === '♠').length * 3;
    else if (j.name === 'Gluttony Joker') bonus += playedCards.filter(c => c.suit === '♣').length * 3;
    else if (j.name === 'Abstract Joker') bonus += jokers.length * 3;
  }
  return bonus;
}

/* ─── Drawing helpers ────────────────────────────────────────────────────── */

function getThemeColors() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  if (theme === 'dark') {
    return {
      paper: '#0b0b0b', surface: '#141414', ink: '#f2f2ee',
      muted: '#8b8b85', faint: '#565650', line: '#2c2c2a',
      accent: '#ff3b30',
    };
  }
  return {
    paper: '#f4f4f1', surface: '#ffffff', ink: '#111110',
    muted: '#75746e', faint: '#a6a59f', line: '#d8d7d2',
    accent: '#ff3b30',
  };
}

function drawCard(card, x, y, w, h, opts = {}) {
  const c = getThemeColors();
  const { highlight = false, scored = false, dimmed = false, scale = 1, faceDown = false } = opts;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);

  if (dimmed) ctx.globalAlpha = 0.35;

  // Card body
  const r = 4;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.fillStyle = faceDown ? c.line : c.surface;
  ctx.fill();
  ctx.strokeStyle = highlight ? c.accent : c.line;
  ctx.lineWidth = highlight ? 2 : 1;
  ctx.stroke();

  if (faceDown) {
    // Card back pattern
    ctx.strokeStyle = c.faint;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.2 + i * w * 0.1, h * 0.15);
      ctx.lineTo(w * 0.2 + i * w * 0.1, h * 0.85);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Suit symbol (center)
  ctx.font = `${h * 0.38}px serif`;
  ctx.fillStyle = card.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(card.suit, w / 2, h * 0.5);

  // Rank (top-left)
  ctx.font = `bold ${h * 0.2}px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = card.color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.rank, w * 0.1, h * 0.06);

  // Suit small (top-left, under rank)
  ctx.font = `${h * 0.15}px serif`;
  ctx.fillText(card.suit, w * 0.1, h * 0.26);

  // Rank (bottom-right, rotated)
  ctx.save();
  ctx.translate(w * 0.9, h * 0.88);
  ctx.rotate(Math.PI);
  ctx.font = `bold ${h * 0.2}px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = card.color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.rank, 0, 0);
  ctx.font = `${h * 0.15}px serif`;
  ctx.fillText(card.suit, 0, h * 0.02);
  ctx.restore();

  // Scored overlay
  if (scored) {
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.fillStyle = 'rgba(255, 59, 48, 0.15)';
    ctx.fill();
  }

  // Highlight glow
  if (highlight) {
    ctx.shadowColor = c.accent;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawJoker(joker, x, y, w, h) {
  const c = getThemeColors();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fillStyle = c.surface;
  ctx.fill();
  ctx.strokeStyle = joker.color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Colored top stripe
  ctx.beginPath();
  ctx.roundRect(x, y, w, 4, [3, 3, 0, 0]);
  ctx.fillStyle = joker.color;
  ctx.fill();

  // Joker icon (star)
  ctx.font = `${h * 0.35}px serif`;
  ctx.fillStyle = joker.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', x + w / 2, y + h * 0.35);

  // Name
  ctx.font = `${Math.min(10, w * 0.12)}px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.ink;
  ctx.textBaseline = 'top';
  const nameLines = joker.name.split(' ');
  nameLines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, y + h * 0.6 + i * (h * 0.14));
  });

  ctx.restore();
}

function drawScorePanel(x, y, w, h, handEval, jokerMult, scoreProgress) {
  const c = getThemeColors();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fillStyle = c.surface;
  ctx.fill();
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  const pad = 10;

  // Hand type label
  ctx.font = `bold 13px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = c.accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(handEval.type.toUpperCase(), x + pad, y + pad);

  // Chips × Mult
  ctx.font = `11px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.muted;
  const totalMult = handEval.mult + jokerMult;
  ctx.fillText(`${handEval.chips} × ${totalMult}`, x + pad, y + pad + 20);

  // Total score
  const total = handEval.chips * totalMult;
  ctx.font = `bold 22px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = c.ink;
  ctx.fillText(total.toLocaleString(), x + pad, y + pad + 38);

  // Score progress bar
  const barY = y + h - 16;
  const barW = w - pad * 2;
  ctx.beginPath();
  ctx.roundRect(x + pad, barY, barW, 6, 3);
  ctx.fillStyle = c.line;
  ctx.fill();

  const fillW = Math.min(barW, barW * scoreProgress);
  if (fillW > 0) {
    ctx.beginPath();
    ctx.roundRect(x + pad, barY, fillW, 6, 3);
    ctx.fillStyle = scoreProgress >= 1 ? '#4cd964' : c.accent;
    ctx.fill();
  }

  ctx.restore();
}

function drawBlindInfo(x, y, w, blind, score, target) {
  const c = getThemeColors();

  ctx.save();

  // Blind name
  ctx.font = `bold 12px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = c.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(blind.name.toUpperCase(), x, y);

  // Target
  ctx.font = `10px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.muted;
  ctx.fillText(`Target: ${target.toLocaleString()}`, x, y + 16);

  // Score so far
  ctx.fillStyle = score >= target ? '#4cd964' : c.accent;
  ctx.fillText(`Score: ${score.toLocaleString()}`, x, y + 30);

  ctx.restore();
}

/* ─── Main render loop ───────────────────────────────────────────────────── */

function render() {
  if (!canvas || !ctx) return;

  const c = getThemeColors();
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;

  // Clear
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, W, H);

  if (!simState) {
    // Draw idle state
    drawIdleState(W, H, c);
    animationFrame = requestAnimationFrame(render);
    return;
  }

  const s = simState;

  // ── Layout regions ──
  const topPad = 16;
  const cardAreaH = H * 0.42;
  const cardY = H - cardAreaH - 16;
  const cardW = Math.min(72, (W - 100) / 9);
  const cardH = cardW * 1.45;
  const cardGap = 8;
  const totalCardsW = s.hand.length * cardW + (s.hand.length - 1) * cardGap;
  const cardStartX = (W - totalCardsW) / 2;

  // ── Top bar: Blind info + Score ──
  drawBlindInfo(16, topPad, 200, s.blind, s.currentScore, s.blindTarget);
  drawScorePanel(W - 230, topPad, 214, 90, s.handEval, s.jokerBonus, s.currentScore / s.blindTarget);

  // ── Joker row ──
  const jokerW = 64;
  const jokerH = 80;
  const jokerGap = 8;
  const jokerStartX = 16;
  const jokerY = topPad + 14;
  ctx.font = `10px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.faint;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('JOKERS', jokerStartX, jokerY - 12);

  s.jokers.forEach((j, i) => {
    drawJoker(j, jokerStartX + i * (jokerW + jokerGap), jokerY, jokerW, jokerH);
  });

  // ── Hand area label ──
  ctx.font = `10px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.faint;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('HAND', cardStartX, cardY - 16);

  // ── Draw cards ──
  s.hand.forEach((card, i) => {
    const x = cardStartX + i * (cardW + cardGap);
    const isSelected = s.selectedIndices.includes(i);
    const isPlayed = s.playedIndices.includes(i);
    const yOffset = isSelected ? -12 : 0;

    drawCard(card, x, cardY + yOffset, cardW, cardH, {
      highlight: isSelected,
      scored: isPlayed,
      dimmed: !isSelected && !isPlayed && s.phase === 'selecting',
    });
  });

  // ── Played cards area (above hand) ──
  if (s.playedCards.length > 0) {
    const playedY = cardY - cardH - 40;
    ctx.font = `10px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = c.faint;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('PLAYED', cardStartX, playedY - 14);

    const playedCardW = cardW * 0.85;
    const playedCardH = cardH * 0.85;
    s.playedCards.forEach((card, i) => {
      const px = cardStartX + i * (playedCardW + 6);
      drawCard(card, px, playedY, playedCardW, playedCardH, { scored: true });
    });
  }

  // ── Phase label ──
  ctx.font = `bold 11px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = c.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const phaseLabels = {
    idle: 'READY',
    selecting: 'BOT THINKING…',
    playing: 'SCORING',
    scoring: 'MULTIPLYING',
    result: s.currentScore >= s.blindTarget ? 'BLIND CLEARED ✓' : 'HANDS LEFT: ' + s.handsLeft,
    gameOver: 'GAME OVER',
    win: 'ANTE CLEARED!',
  };
  ctx.fillText(phaseLabels[s.phase] || '', W / 2, cardY - 50);

  // ── Decision log overlay ──
  if (s.lastDecision) {
    const logY = H - 12;
    ctx.font = `10px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = c.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(s.lastDecision, W / 2, logY);
  }

  animationFrame = requestAnimationFrame(render);
}

function drawIdleState(W, H, c) {
  // Grid pattern
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

  // Center text
  ctx.font = `bold 16px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = c.faint;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OPTILATRO', W / 2, H / 2 - 16);
  ctx.font = `11px 'IBM Plex Mono', monospace`;
  ctx.fillText('Press Start Run to begin simulation', W / 2, H / 2 + 10);
}

/* ─── Simulation engine ──────────────────────────────────────────────────── */

function initSimState() {
  const deck = createDeck();
  const hand = deck.splice(0, 8);
  const jokerCount = 2 + Math.floor(Math.random() * 3);
  const jokers = selectJokers(jokerCount);
  const blindIndex = 0;
  const blind = BLINDS[blindIndex];

  simState = {
    deck,
    hand,
    jokers,
    blind,
    blindIndex,
    blindTarget: blind.base,
    currentScore: 0,
    handsLeft: 4,
    discardsLeft: 3,
    ante: 1,
    selectedIndices: [],
    playedIndices: [],
    playedCards: [],
    handEval: { type: '—', base: 0, mult: 0, chips: 0, total: 0 },
    jokerBonus: 0,
    phase: 'idle',
    lastDecision: '',
    totalGames: 0,
    wins: 0,
    stepTimer: 0,
    scoreAnimTarget: 0,
    scoreAnimCurrent: 0,
  };

  updateStatsPanel();
  updateHandEval(null);
  updateJokerPanel();
}

function stepSim(timestamp) {
  if (!simRunning || simPaused || !simState) return;

  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  const s = simState;
  const tick = 800 / simSpeed; // ms per step

  if (timestamp - s.stepTimer < tick) {
    animationFrame = requestAnimationFrame(stepSim);
    return;
  }
  s.stepTimer = timestamp;

  switch (s.phase) {
    case 'idle':
      startNewBlind();
      break;

    case 'selecting':
      botSelectAndPlay();
      break;

    case 'playing':
      animateScoring();
      break;

    case 'scoring':
      applyScore();
      break;

    case 'result':
      advancePhase();
      break;

    case 'win':
      advanceAnte();
      break;

    case 'gameOver':
      endGame(false);
      break;
  }

  updateStatsPanel();
  animationFrame = requestAnimationFrame(stepSim);
}

function startNewBlind() {
  const s = simState;
  // Draw up to 8 cards
  while (s.hand.length < 8 && s.deck.length > 0) {
    s.hand.push(s.deck.pop());
  }

  s.blind = BLINDS[s.blindIndex % BLINDS.length];
  s.blindTarget = Math.floor(s.blind.base * (1 + (s.ante - 1) * 0.4));
  s.currentScore = 0;
  s.handsLeft = 4;
  s.discardsLeft = 3;
  s.selectedIndices = [];
  s.playedIndices = [];
  s.playedCards = [];
  s.handEval = { type: '—', base: 0, mult: 0, chips: 0, total: 0 };
  s.jokerBonus = 0;
  s.phase = 'selecting';
  s.lastDecision = `Ante ${s.ante} — ${s.blind.name} (target: ${s.blindTarget})`;
  addLog(s.lastDecision);
  updateHandEval(null);
}

function botSelectAndPlay() {
  const s = simState;
  if (s.handsLeft <= 0) {
    s.phase = 'gameOver';
    s.lastDecision = 'No hands remaining — game over';
    addLog(s.lastDecision);
    return;
  }

  // Bot evaluates and picks best hand
  const { cards, eval: ev } = botSelectHand(s.hand);
  s.playedCards = cards;
  s.handEval = ev;
  s.jokerBonus = jokerMultiplier(s.jokers, cards);

  // Mark selected indices
  s.selectedIndices = [];
  for (const played of cards) {
    const idx = s.hand.findIndex((c, i) => c === played && !s.selectedIndices.includes(i));
    if (idx !== -1) s.selectedIndices.push(idx);
  }

  s.lastDecision = `Bot plays ${ev.type} (${ev.chips} × ${ev.mult + s.jokerBonus})`;
  addLog(s.lastDecision);
  updateHandEval(ev);

  // Transition to playing
  setTimeout(() => {
    if (!simState || simState.phase !== 'selecting') return;
    simState.phase = 'playing';
    simState.playedIndices = [...simState.selectedIndices];
  }, tickMs());

  setTimeout(() => {
    if (!simState || simState.phase !== 'playing') return;
    simState.phase = 'scoring';
  }, tickMs() * 2);
}

function animateScoring() {
  // Scoring animation is handled visually; just transition
}

function applyScore() {
  const s = simState;
  const total = s.handEval.chips * (s.handEval.mult + s.jokerBonus);
  s.currentScore += total;
  s.handsLeft--;

  // Remove played cards from hand
  s.hand = s.hand.filter((_, i) => !s.playedIndices.includes(i));
  s.selectedIndices = [];
  s.playedIndices = [];
  s.playedCards = [];

  if (s.currentScore >= s.blindTarget) {
    s.phase = 'win';
    s.lastDecision = `Blind cleared! Score: ${s.currentScore.toLocaleString()}`;
    addLog(s.lastDecision, 'success');
  } else if (s.handsLeft <= 0) {
    s.phase = 'gameOver';
    s.lastDecision = `Failed to meet target. Score: ${s.currentScore.toLocaleString()} / ${s.blindTarget.toLocaleString()}`;
    addLog(s.lastDecision, 'error');
  } else {
    s.phase = 'selecting';
    s.lastDecision = `Score: ${s.currentScore.toLocaleString()} / ${s.blindTarget.toLocaleString()} — ${s.handsLeft} hands left`;
    addLog(s.lastDecision);
    updateHandEval(null);
  }
}

function advancePhase() {
  const s = simState;
  s.blindIndex++;
  if (s.blindIndex >= BLINDS.length) {
    // Ante complete
    s.phase = 'win';
    s.lastDecision = `Ante ${s.ante} complete!`;
    addLog(s.lastDecision, 'success');
  } else {
    s.phase = 'selecting';
    startNewBlind();
  }
}

function advanceAnte() {
  const s = simState;
  s.ante++;
  s.blindIndex = 0;

  if (s.ante > 8) {
    endGame(true);
    return;
  }

  // Reshuffle for next ante
  s.deck = createDeck();
  s.hand = s.deck.splice(0, 8);

  // Maybe swap jokers
  if (Math.random() > 0.5) {
    const newJokers = selectJokers(s.jokers.length);
    s.jokers = newJokers;
    s.lastDecision = `Ante ${s.ante} — new jokers acquired`;
    addLog(s.lastDecision);
    updateJokerPanel();
  }

  s.phase = 'selecting';
  startNewBlind();
}

function endGame(won) {
  const s = simState;
  s.totalGames++;
  if (won) s.wins++;

  s.phase = 'idle';
  s.lastDecision = won
    ? `Victory! Won game ${s.totalGames}. Win rate: ${((s.wins / s.totalGames) * 100).toFixed(1)}%`
    : `Defeated at Ante ${s.ante}. Win rate: ${((s.wins / s.totalGames) * 100).toFixed(1)}%`;
  addLog(s.lastDecision, won ? 'success' : 'error');

  // Auto-start next game after a pause
  setTimeout(() => {
    if (!simRunning || simPaused) return;
    initSimState();
    simState.totalGames = s.totalGames;
    simState.wins = s.wins;
    simState.phase = 'idle';
  }, tickMs() * 3);
}

function tickMs() {
  return 800 / simSpeed;
}

/* ─── UI updates ─────────────────────────────────────────────────────────── */

function updateStatsPanel() {
  if (!simState) return;
  const s = simState;
  const el = (id) => document.getElementById(id);
  if (el('stat-winrate')) el('stat-winrate').textContent = s.totalGames > 0
    ? `${((s.wins / s.totalGames) * 100).toFixed(1)}%` : '—';
  if (el('stat-games')) el('stat-games').textContent = s.totalGames;
  if (el('stat-ante')) el('stat-ante').textContent = s.ante ? `${s.ante} / 8` : '—';
  if (el('stat-blind')) el('stat-blind').textContent = s.blind ? s.blind.name : '—';
}

function updateHandEval(ev) {
  const el = document.getElementById('sim-hand-eval');
  if (!el) return;

  if (!ev || ev.type === '—') {
    el.innerHTML = '<p class="sim-placeholder-text">Bot is evaluating hands…</p>';
    return;
  }

  el.innerHTML = `
    <div class="hand-eval-row">
      <span class="hand-eval-label">Hand Type</span>
      <span class="hand-eval-value hand-eval-value--accent">${ev.type}</span>
    </div>
    <div class="hand-eval-row">
      <span class="hand-eval-label">Base Chips</span>
      <span class="hand-eval-value">${ev.base}</span>
    </div>
    <div class="hand-eval-row">
      <span class="hand-eval-label">Card Values</span>
      <span class="hand-eval-value">+${ev.chips - ev.base}</span>
    </div>
    <div class="hand-eval-row">
      <span class="hand-eval-label">Multiplier</span>
      <span class="hand-eval-value">${ev.mult}</span>
    </div>
    ${simState.jokerBonus > 0 ? `
    <div class="hand-eval-row">
      <span class="hand-eval-label">Joker Bonus</span>
      <span class="hand-eval-value hand-eval-value--accent">+${simState.jokerBonus}</span>
    </div>` : ''}
    <div class="hand-eval-row hand-eval-row--total">
      <span class="hand-eval-label">Total</span>
      <span class="hand-eval-value hand-eval-value--accent">${(ev.chips * (ev.mult + (simState?.jokerBonus || 0))).toLocaleString()}</span>
    </div>
  `;
}

function updateJokerPanel() {
  const el = document.getElementById('sim-joker-panel');
  if (!el || !simState) return;

  if (simState.jokers.length === 0) {
    el.innerHTML = '<p class="sim-placeholder-text">No jokers in play</p>';
    return;
  }

  el.innerHTML = simState.jokers.map(j => `
    <div class="joker-row">
      <span class="joker-dot" style="background:${j.color}"></span>
      <span class="joker-name">${j.name}</span>
      <span class="joker-effect">${j.effect}</span>
    </div>
  `).join('');
}

function addLog(msg, type = '') {
  const el = document.getElementById('sim-log');
  if (!el) return;

  const now = new Date();
  const time = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const entry = document.createElement('div');
  entry.className = `sim-log__entry ${type ? `sim-log__entry--${type}` : ''}`;
  entry.innerHTML = `<span class="sim-log__time">${time}</span><span class="sim-log__msg">${msg}</span>`;
  el.appendChild(entry);
  el.scrollTop = el.scrollHeight;

  // Keep log manageable
  while (el.children.length > 50) {
    el.removeChild(el.firstChild);
  }
}

/* ─── Controls ───────────────────────────────────────────────────────────── */

function bindControls() {
  const startBtn = document.getElementById('sim-start-btn');
  const pauseBtn = document.getElementById('sim-pause-btn');
  const resetBtn = document.getElementById('sim-reset-btn');
  const speedSlider = document.getElementById('sim-speed');
  const speedValue = document.getElementById('sim-speed-value');
  const overlay = document.getElementById('sim-overlay');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (simRunning && !simPaused) return;

      if (overlay) overlay.hidden = true;

      if (!simState) {
        initSimState();
      }

      simRunning = true;
      simPaused = false;
      startTime = 0;
      startBtn.textContent = 'Running…';
      startBtn.disabled = true;
      pauseBtn.disabled = false;

      animationFrame = requestAnimationFrame(stepSim);
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      simPaused = !simPaused;
      pauseBtn.textContent = simPaused ? 'Resume' : 'Pause';
      if (!simPaused) {
        startTime = 0;
        animationFrame = requestAnimationFrame(stepSim);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      simRunning = false;
      simPaused = false;
      simState = null;
      startTime = 0;
      if (animationFrame) cancelAnimationFrame(animationFrame);

      if (overlay) overlay.hidden = false;
      if (startBtn) { startBtn.textContent = 'Start Run'; startBtn.disabled = false; }
      if (pauseBtn) { pauseBtn.textContent = 'Pause'; pauseBtn.disabled = true; }

      // Clear log
      const logEl = document.getElementById('sim-log');
      if (logEl) {
        logEl.innerHTML = `<div class="sim-log__entry sim-log__entry--system">
          <span class="sim-log__time">00:00</span>
          <span class="sim-log__msg">Simulator reset. Press Start Run to begin.</span>
        </div>`;
      }

      updateStatsPanel();
      updateHandEval(null);
      updateJokerPanel();
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      simSpeed = parseInt(speedSlider.value);
      if (speedValue) speedValue.textContent = `${simSpeed}x`;
    });
  }
}

/* ─── Resize ─────────────────────────────────────────────────────────────── */

function handleResize() {
  if (canvas) {
    const container = canvas.parentElement;
    if (container) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
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

  handleResize();
  window.addEventListener('resize', handleResize);

  bindControls();
  render();
}
