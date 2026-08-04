/**
 * utils.js — Tiny helpers shared across modules.
 */

/**
 * Escapes a string for safe interpolation into HTML (text nodes and
 * double-quoted attributes). Config content is user-owned, but this keeps
 * values like `A & B` or `<C++>` from breaking the markup.
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}
