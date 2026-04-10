/**
 * Pure utility functions for tab filtering and counting.
 * No dependency on browser.* APIs — fully testable in Node.js.
 */

// Firefox silently refuses to discard tabs with these URL schemes.
var UNDISCARDABLE_PREFIXES = ['about:', 'chrome:', 'resource:', 'moz-extension:'];

function canDiscard(tab) {
  if (!tab.url) return true; // url may be absent without tabs permission — assume discardable
  for (var i = 0; i < UNDISCARDABLE_PREFIXES.length; i++) {
    if (tab.url.indexOf(UNDISCARDABLE_PREFIXES[i]) === 0) return false;
  }
  return true;
}

function filterTabsToUnload(tabs, options) {
  var skipPinned = options && options.skipPinned !== undefined ? options.skipPinned : true;
  return tabs.filter(function (tab) {
    if (tab.active) return false;
    if (tab.discarded) return false;
    if (skipPinned && tab.pinned) return false;
    if (!canDiscard(tab)) return false;
    return true;
  });
}

function getTabStats(tabs, options) {
  var skipPinned = options && options.skipPinned !== undefined ? options.skipPinned : true;
  var total = tabs.length;
  var active = 0;
  var alreadyDiscarded = 0;
  var pinned = 0;

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].active) active++;
    if (tabs[i].discarded) alreadyDiscarded++;
    if (tabs[i].pinned) pinned++;
  }

  var toUnload = filterTabsToUnload(tabs, { skipPinned: skipPinned }).length;

  return {
    total: total,
    active: active,
    alreadyDiscarded: alreadyDiscarded,
    pinned: pinned,
    toUnload: toUnload
  };
}

function getTabIds(tabs) {
  return tabs.map(function (tab) {
    return tab.id;
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterTabsToUnload: filterTabsToUnload, getTabStats: getTabStats, getTabIds: getTabIds, canDiscard: canDiscard };
}
