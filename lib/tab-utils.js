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

function filterTabsToUnload(tabs, { skipPinned = true } = {}) {
  return tabs.filter(tab => {
    if (tab.active) return false;
    if (tab.discarded) return false;
    if (skipPinned && tab.pinned) return false;
    if (!canDiscard(tab)) return false;
    return true;
  });
}

function getTabStats(tabs, { skipPinned = true } = {}) {
  const active = tabs.filter(t => t.active).length;
  const alreadyDiscarded = tabs.filter(t => t.discarded).length;
  const pinned = tabs.filter(t => t.pinned).length;
  const toUnload = filterTabsToUnload(tabs, { skipPinned }).length;

  return { total: tabs.length, active, alreadyDiscarded, pinned, toUnload };
}

function getTabIds(tabs) {
  return tabs.map(tab => tab.id);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterTabsToUnload, getTabStats, getTabIds, canDiscard };
}
