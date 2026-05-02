/**
 * Pure utility functions for tab filtering and counting.
 * No dependency on browser.* APIs — fully testable in Node.js.
 */

// Firefox silently refuses to discard tabs with these URL schemes.
const UNDISCARDABLE_PREFIXES = ['about:', 'chrome:', 'resource:', 'moz-extension:'];

function canDiscard(tab) {
  if (!tab.url) return true;
  return !UNDISCARDABLE_PREFIXES.some(prefix => tab.url.startsWith(prefix));
}

function isInScope(tab, { skipPinned = true } = {}) {
  return !tab.active && (!skipPinned || !tab.pinned) && canDiscard(tab);
}

function filterTabsToUnload(tabs, opts = {}) {
  return tabs.filter(t => isInScope(t, opts) && !t.discarded);
}

function getTabStats(tabs, opts = {}) {
  const inScope = tabs.filter(t => isInScope(t, opts));
  return {
    total: inScope.length,
    loaded: inScope.filter(t => !t.discarded).length,
  };
}

function getTabIds(tabs) {
  return tabs.map(tab => tab.id);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterTabsToUnload, getTabStats, getTabIds, canDiscard };
}
