const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { filterTabsToUnload, getTabStats, getTabIds, canDiscard } = require('../lib/tab-utils');

// Reusable test fixtures
const mockTabs = [
  { id: 1, active: true,  pinned: false, discarded: false, url: 'https://example.com' },
  { id: 2, active: false, pinned: false, discarded: false, url: 'https://mozilla.org' },
  { id: 3, active: false, pinned: true,  discarded: false, url: 'https://pinned.com' },
  { id: 4, active: false, pinned: false, discarded: true,  url: 'https://discarded.com' },
  { id: 5, active: false, pinned: false, discarded: false, url: 'https://another.com' },
];

// --- filterTabsToUnload ---

describe('filterTabsToUnload', () => {
  it('filters out the active tab', () => {
    const result = filterTabsToUnload(mockTabs, { skipPinned: false });
    const ids = result.map(t => t.id);
    assert.ok(!ids.includes(1), 'active tab should be excluded');
  });

  it('filters out already-discarded tabs', () => {
    const result = filterTabsToUnload(mockTabs, { skipPinned: false });
    const ids = result.map(t => t.id);
    assert.ok(!ids.includes(4), 'discarded tab should be excluded');
  });

  it('filters out pinned tabs when skipPinned is true', () => {
    const result = filterTabsToUnload(mockTabs, { skipPinned: true });
    const ids = result.map(t => t.id);
    assert.ok(!ids.includes(3), 'pinned tab should be excluded');
    assert.deepStrictEqual(ids, [2, 5]);
  });

  it('keeps pinned tabs when skipPinned is false', () => {
    const result = filterTabsToUnload(mockTabs, { skipPinned: false });
    const ids = result.map(t => t.id);
    assert.ok(ids.includes(3), 'pinned tab should be included');
    assert.deepStrictEqual(ids, [2, 3, 5]);
  });

  it('defaults skipPinned to true when options omitted', () => {
    const result = filterTabsToUnload(mockTabs, {});
    const ids = result.map(t => t.id);
    assert.ok(!ids.includes(3), 'pinned tab should be excluded by default');
  });

  it('returns empty array when all tabs are active', () => {
    const tabs = [{ id: 1, active: true, pinned: false, discarded: false }];
    const result = filterTabsToUnload(tabs, { skipPinned: true });
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array when all inactive tabs are already discarded', () => {
    const tabs = [
      { id: 1, active: true,  pinned: false, discarded: false },
      { id: 2, active: false, pinned: false, discarded: true  },
      { id: 3, active: false, pinned: false, discarded: true  },
    ];
    const result = filterTabsToUnload(tabs, { skipPinned: true });
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array for empty input', () => {
    const result = filterTabsToUnload([], { skipPinned: true });
    assert.deepStrictEqual(result, []);
  });

  it('handles tabs from multiple windows', () => {
    const tabs = [
      { id: 1, active: true,  pinned: false, discarded: false, windowId: 1, url: 'https://a.com' },
      { id: 2, active: false, pinned: false, discarded: false, windowId: 1, url: 'https://b.com' },
      { id: 3, active: true,  pinned: false, discarded: false, windowId: 2, url: 'https://c.com' },
      { id: 4, active: false, pinned: false, discarded: false, windowId: 2, url: 'https://d.com' },
    ];
    const result = filterTabsToUnload(tabs, { skipPinned: true });
    const ids = result.map(t => t.id);
    assert.deepStrictEqual(ids, [2, 4]);
  });

  it('filters out about: pages that Firefox cannot discard', () => {
    const tabs = [
      { id: 1, active: true,  pinned: false, discarded: false, url: 'https://example.com' },
      { id: 2, active: false, pinned: false, discarded: false, url: 'about:debugging' },
      { id: 3, active: false, pinned: false, discarded: false, url: 'about:config' },
      { id: 4, active: false, pinned: false, discarded: false, url: 'about:blank' },
      { id: 5, active: false, pinned: false, discarded: false, url: 'https://mozilla.org' },
    ];
    const result = filterTabsToUnload(tabs, { skipPinned: false });
    const ids = result.map(t => t.id);
    assert.deepStrictEqual(ids, [5]);
  });

  it('filters out chrome:, resource:, and moz-extension: URLs', () => {
    const tabs = [
      { id: 1, active: false, pinned: false, discarded: false, url: 'chrome://browser/content/' },
      { id: 2, active: false, pinned: false, discarded: false, url: 'resource://gre/' },
      { id: 3, active: false, pinned: false, discarded: false, url: 'moz-extension://abc/popup.html' },
      { id: 4, active: false, pinned: false, discarded: false, url: 'https://ok.com' },
    ];
    const result = filterTabsToUnload(tabs, { skipPinned: false });
    const ids = result.map(t => t.id);
    assert.deepStrictEqual(ids, [4]);
  });

  it('treats tabs with no url property as discardable', () => {
    const tabs = [
      { id: 1, active: false, pinned: false, discarded: false },
    ];
    const result = filterTabsToUnload(tabs, { skipPinned: false });
    assert.strictEqual(result.length, 1);
  });
});

// --- getTabStats ---

describe('getTabStats', () => {
  it('excludes active and pinned tabs from total and loaded when skipPinned is true', () => {
    const stats = getTabStats(mockTabs, { skipPinned: true });
    assert.strictEqual(stats.total, 3);
    assert.strictEqual(stats.loaded, 2);
  });

  it('includes pinned tabs but excludes active when skipPinned is false', () => {
    const stats = getTabStats(mockTabs, { skipPinned: false });
    assert.strictEqual(stats.total, 4);
    assert.strictEqual(stats.loaded, 3);
  });

  it('defaults skipPinned to true when options omitted', () => {
    const stats = getTabStats(mockTabs);
    assert.strictEqual(stats.total, 3);
    assert.strictEqual(stats.loaded, 2);
  });

  it('always excludes the active tab regardless of skipPinned', () => {
    const tabs = [
      { id: 1, active: true,  pinned: false, discarded: false },
      { id: 2, active: false, pinned: false, discarded: false },
    ];
    assert.strictEqual(getTabStats(tabs, { skipPinned: true }).total, 1);
    assert.strictEqual(getTabStats(tabs, { skipPinned: false }).total, 1);
  });

  it('reports total 0 when only the active tab is in scope', () => {
    const tabs = [{ id: 1, active: true, pinned: false, discarded: false }];
    const stats = getTabStats(tabs, { skipPinned: true });
    assert.strictEqual(stats.total, 0);
    assert.strictEqual(stats.loaded, 0);
  });

  it('reports loaded === total when no inactive tabs are discarded', () => {
    const tabs = [
      { id: 1, active: true,  pinned: false, discarded: false },
      { id: 2, active: false, pinned: false, discarded: false },
      { id: 3, active: false, pinned: false, discarded: false },
    ];
    const stats = getTabStats(tabs, { skipPinned: true });
    assert.strictEqual(stats.total, 2);
    assert.strictEqual(stats.loaded, 2);
  });

  it('reports loaded 0 when every in-scope inactive tab is discarded', () => {
    const tabs = [
      { id: 1, active: false, pinned: false, discarded: true },
      { id: 2, active: false, pinned: false, discarded: true },
    ];
    const stats = getTabStats(tabs, { skipPinned: true });
    assert.strictEqual(stats.total, 2);
    assert.strictEqual(stats.loaded, 0);
  });

  it('handles empty tabs array', () => {
    const stats = getTabStats([], { skipPinned: true });
    assert.strictEqual(stats.total, 0);
    assert.strictEqual(stats.loaded, 0);
  });

  it('excludes tabs with undiscardable URLs', () => {
    const tabs = [
      { id: 1, active: true,  pinned: false, discarded: false, url: 'https://example.com' },
      { id: 2, active: false, pinned: false, discarded: false, url: 'about:newtab' },
      { id: 3, active: false, pinned: false, discarded: false, url: 'chrome://browser/content/' },
      { id: 4, active: false, pinned: false, discarded: false, url: 'https://b.com' },
    ];
    const stats = getTabStats(tabs, { skipPinned: true });
    assert.strictEqual(stats.total, 1);
    assert.strictEqual(stats.loaded, 1);
  });
});

// --- canDiscard ---

describe('canDiscard', () => {
  it('returns false for about: URLs', () => {
    assert.strictEqual(canDiscard({ url: 'about:debugging' }), false);
    assert.strictEqual(canDiscard({ url: 'about:config' }), false);
    assert.strictEqual(canDiscard({ url: 'about:blank' }), false);
    assert.strictEqual(canDiscard({ url: 'about:newtab' }), false);
  });

  it('returns false for chrome: URLs', () => {
    assert.strictEqual(canDiscard({ url: 'chrome://browser/content/' }), false);
  });

  it('returns false for resource: URLs', () => {
    assert.strictEqual(canDiscard({ url: 'resource://gre/modules/' }), false);
  });

  it('returns false for moz-extension: URLs', () => {
    assert.strictEqual(canDiscard({ url: 'moz-extension://abc-123/popup.html' }), false);
  });

  it('returns true for https: URLs', () => {
    assert.strictEqual(canDiscard({ url: 'https://example.com' }), true);
  });

  it('returns true for http: URLs', () => {
    assert.strictEqual(canDiscard({ url: 'http://example.com' }), true);
  });

  it('returns true when url is absent', () => {
    assert.strictEqual(canDiscard({}), true);
  });
});

// --- getTabIds ---

describe('getTabIds', () => {
  it('extracts IDs from tab objects', () => {
    const tabs = [{ id: 10 }, { id: 20 }, { id: 30 }];
    assert.deepStrictEqual(getTabIds(tabs), [10, 20, 30]);
  });

  it('returns empty array for empty input', () => {
    assert.deepStrictEqual(getTabIds([]), []);
  });
});
