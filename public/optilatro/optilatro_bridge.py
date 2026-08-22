"""optilatro_bridge.py — JSON bridge between the browser (Pyodide) and the
REAL Optilatro engine (vendor/balatro-rl/balatro_sim).

This module runs unmodified inside Pyodide (CPython compiled to WebAssembly).
Every decision is made by the actual `HeuristicV10` policy operating on the
actual `BalatroGame` simulator — identical to what `bench_agent_v10.py` runs
locally. Nothing here re-implements game logic; it only serializes state to
JSON for the canvas renderer.

Exposed API (called from JS via pyodide.globals):
    new_game(seed) -> snapshot JSON string
    step()         -> {"action": {...}, "snapshot": {...}} JSON string
    snapshot()     -> snapshot JSON string
"""
from __future__ import annotations

import json
import os
import sys
import time

# Layout A (Pyodide):  /optilatro/optilatro_bridge.py
#                      /optilatro/vendor/balatro-rl/balatro_sim/…
#                      /optilatro/tools/synergy_tree.json   ← mirrors the repo,
#                      so synergy_tree.load_tree() finds its data files.
# Layout B (local test): balatro_sim sits next to this file; override the
#                      package root via the OPTILATRO_ROOT env var.
_HERE = os.path.dirname(os.path.abspath(__file__))
_VENDOR = os.path.join(_HERE, "vendor", "balatro-rl")
if os.path.isdir(os.path.join(_VENDOR, "balatro_sim")):
    if _VENDOR not in sys.path:
        sys.path.insert(0, _VENDOR)
else:
    _OPTILATRO_ROOT = os.environ.get("OPTILATRO_ROOT", _HERE)
    if _OPTILATRO_ROOT not in sys.path:
        sys.path.insert(0, _OPTILATRO_ROOT)

from balatro_sim.game import BalatroGame, State          # noqa: E402
from balatro_sim.agent_v10 import HeuristicV10           # noqa: E402
from balatro_sim.hand_eval import evaluate_hand          # noqa: E402
from balatro_sim.shop import JOKER_CATALOGUE             # noqa: E402
from balatro_sim.rollout import _force_progress          # noqa: E402
from balatro_sim import consumables as _cons             # noqa: E402

_game: BalatroGame | None = None
_policy: HeuristicV10 | None = None
_seed = 0
_last: dict | None = None  # description of the most recent action
_stalled = 0              # stall-guard counter (mirrors rollout.py)


def _progress_sig(g: BalatroGame) -> tuple:
    """State signature for stall detection — mirrors rollout._progress_sig."""
    return (
        g.state,
        len(g.hand),
        g.hands_left,
        g.discards_left,
        g.chips_scored,
        g.dollars,
        len(g.jokers),
        len(g.consumable_hand),
        g.blind_idx,
        g.ante,
    )

_SUIT_SYMBOL = {"Spades": "♠", "Hearts": "♥", "Diamonds": "♦", "Clubs": "♣"}


# ─── Serialization helpers ──────────────────────────────────────────────────

def _card(c) -> dict:
    return {
        "rank": c.rank,
        "rankName": c.rank_name,
        "suit": c.suit,
        "symbol": _SUIT_SYMBOL.get(c.suit, "?"),
        "enhancement": c.enhancement,
        "edition": c.edition,
        "seal": c.seal,
        "debuffed": bool(c.debuffed),
        "flipped": bool(c.flipped),
    }


def _joker(j) -> dict:
    info = JOKER_CATALOGUE.get(j.key, {})
    return {"key": j.key, "name": info.get("name", j.key), "edition": j.edition}


def _consumable_name(key: str) -> str:
    for attr in ("PLANET_NAME", "TAROT_NAME", "SPECTRAL_NAME"):
        table = getattr(_cons, attr, None)
        if table and key in table:
            return table[key]
    return key


def _booster_choice(ch) -> dict:
    if isinstance(ch, tuple) and ch:
        if ch[0] == "joker":
            info = JOKER_CATALOGUE.get(ch[1], {})
            return {"kind": "joker", "key": ch[1],
                    "name": info.get("name", ch[1]), "edition": ch[2]}
        if ch[0] == "card":
            d = _card(ch[1])
            d["kind"] = "card"
            d["name"] = f"{d['rankName']}{d['symbol']}"
            return d
    key = str(ch)
    return {"kind": "consumable", "key": key, "name": _consumable_name(key)}


def _boss_display(key: str) -> str:
    if not key:
        return ""
    return key.replace("bl_", "").replace("_", " ").title()


# ─── Snapshot ───────────────────────────────────────────────────────────────

def snapshot() -> str:
    if _game is None:
        return json.dumps({"ready": False})
    g = _game

    shop = []
    if g.state == State.SHOP:
        for it in g.current_shop:
            shop.append({
                "kind": it.kind,
                "key": it.key,
                "name": it.name,
                "price": it.discounted_price(g.shop_discount),
                "edition": it.edition,
                "sold": bool(it.sold),
            })

    booster = []
    if g.state == State.BOOSTER_OPEN:
        booster = [_booster_choice(c) for c in g.booster_choices]

    won = bool(g.ante > 8 and g.state == State.GAME_OVER)

    return json.dumps({
        "ready": True,
        "seed": _seed,
        "state": g.state.name,
        "ante": g.ante,
        "blindIdx": g.blind_idx,
        "blind": {
            "name": g.current_blind.name,
            "kind": g.current_blind.kind,
            "target": g.current_blind.chips_target,
            "bossKey": g.current_blind.boss_key,
            "bossDisplay": _boss_display(g.current_blind.boss_key),
        },
        "chipsScored": g.chips_scored,
        "handsLeft": g.hands_left,
        "discardsLeft": g.discards_left,
        "dollars": g.dollars,
        "deckRemaining": len(g.deck),
        "handSize": len(g.hand),
        "hand": [_card(c) for c in g.hand],
        "jokers": [_joker(j) for j in g.jokers],
        "consumables": [{"key": k, "name": _consumable_name(k)}
                        for k in g.consumable_hand],
        "shop": shop,
        "boosterChoices": booster,
        "won": won,
        "done": g.state == State.GAME_OVER,
        "lastAction": _last,
    })


# ─── Action description ─────────────────────────────────────────────────────

def describe(action: dict) -> str:
    atype = action.get("type", "?")
    g = _game
    if g is None:
        return f"Action: {atype}"

    if atype == "play_blind":
        return f"Play {g.current_blind.name} (target {g.current_blind.chips_target:,})"
    if atype == "skip_blind":
        return f"Skip {g.current_blind.name} — take the Tag"
    if atype == "play":
        cards = [g.hand[i] for i in action.get("cards", [])
                 if isinstance(i, int) and i < len(g.hand)]
        txt = " ".join(f"{c.rank_name}{_SUIT_SYMBOL.get(c.suit, '')}" for c in cards)
        return f"Play {len(cards)}: {txt}"
    if atype == "discard":
        cards = [g.hand[i] for i in action.get("cards", [])
                 if isinstance(i, int) and i < len(g.hand)]
        txt = " ".join(f"{c.rank_name}{_SUIT_SYMBOL.get(c.suit, '')}" for c in cards)
        return f"Discard: {txt}"
    if atype == "buy":
        idx = action.get("item_idx", 0)
        if idx < len(g.current_shop):
            it = g.current_shop[idx]
            price = it.discounted_price(g.shop_discount)
            ed = f" [{it.edition}]" if it.edition != "None" else ""
            return f"Buy {it.kind}: {it.name}{ed} (${price})"
        return "Buy (item gone)"
    if atype == "sell_joker":
        idx = action.get("joker_idx", 0)
        if idx < len(g.jokers):
            info = JOKER_CATALOGUE.get(g.jokers[idx].key, {})
            return f"Sell {info.get('name', g.jokers[idx].key)}"
        return "Sell joker"
    if atype == "use_consumable":
        ci = action.get("consumable_idx", 0)
        if ci < len(g.consumable_hand):
            key = g.consumable_hand[ci]
            tgt = action.get("target_cards") or []
            ttxt = ""
            if tgt:
                cards = [g.hand[i] for i in tgt if isinstance(i, int) and i < len(g.hand)]
                ttxt = " → " + " ".join(
                    f"{c.rank_name}{_SUIT_SYMBOL.get(c.suit, '')}" for c in cards)
            return f"Use {_consumable_name(key)}{ttxt}"
        return "Use consumable"
    if atype == "reroll":
        cost = max(0, g.reroll_cost - g.reroll_discount)
        return f"Reroll shop (${cost})"
    if atype == "reroll_boss":
        return "Reroll Boss Blind ($10)"
    if atype == "leave_shop":
        return "Leave shop"
    if atype == "pick_booster":
        names = []
        for i in action.get("indices", []):
            if i < len(g.booster_choices):
                names.append(_booster_choice(g.booster_choices[i]).get("name", "?"))
        return f"Pick from pack: {', '.join(names)}"
    if atype == "skip_booster":
        return "Skip booster pack"
    return f"Action: {atype}"


# ─── Public API ─────────────────────────────────────────────────────────────

def new_game(seed: int = 0) -> str:
    """Start a fresh run with the real V10 policy on a fixed seed."""
    global _game, _policy, _seed, _last, _stalled
    _seed = int(seed)
    _game = BalatroGame(seed=_seed, rng_mode="seed")
    _policy = HeuristicV10()
    _last = None
    _stalled = 0
    return snapshot()


def step() -> str:
    """One bot decision + one engine step. Returns JSON with the action taken
    (plus hand evaluation when a hand was played) and the fresh snapshot."""
    global _last
    if _game is None or _policy is None or _game.state == State.GAME_OVER:
        return json.dumps({"noop": True, "snapshot": json.loads(snapshot())})

    t0 = time.perf_counter()

    # Stall guard (mirrors rollout.py): if the policy proposes actions that do
    # not change state 3 times in a row (e.g. a discard under The Water, where
    # discards are 0), force a safe progress action so the run continues.
    global _stalled
    sig = _progress_sig(_game)
    action = _policy.decide(_game)
    desc = describe(action)
    atype = action.get("type")

    played_eval = None
    score_before = _game.chips_scored
    if atype == "play":
        idxs = [i for i in action.get("cards", [])]
        cards = [_game.hand[i] for i in idxs if isinstance(i, int) and i < len(_game.hand)]
        hand_type, _scoring = evaluate_hand(cards)
        played_eval = {"type": hand_type, "count": len(idxs)}

    _game.step(action)

    if _progress_sig(_game) == sig:
        _stalled += 1
        if _stalled >= 3:
            forced = _force_progress(_game)
            desc = f"{desc} ⚠ stall guard → {describe(forced)}"
            atype = f"{atype}+forced"
            _game.step(forced)
            _stalled = 0
    else:
        _stalled = 0

    if played_eval is not None:
        played_eval["gained"] = _game.chips_scored - score_before

    ms = round((time.perf_counter() - t0) * 1000.0, 1)
    _last = {"type": atype, "desc": desc, "eval": played_eval, "ms": ms}

    return json.dumps({"action": _last, "snapshot": json.loads(snapshot())})


def engine_info() -> str:
    import platform
    return json.dumps({
        "python": platform.python_version(),
        "engine": "Optilatro heuristic_v10",
        "sim": "balatro_sim (vendored balatro-rl)",
    })