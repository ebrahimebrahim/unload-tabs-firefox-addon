/* global filterTabsToUnload, getTabStats, getTabIds */

(function () {
  var statTotalEl = document.getElementById('stat-total');
  var statUnloadEl = document.getElementById('stat-unload');
  var statDiscardedEl = document.getElementById('stat-discarded');
  var statPinnedEl = document.getElementById('stat-pinned');
  var resultEl = document.getElementById('result');
  var unloadBtn = document.getElementById('unloadBtn');
  var skipPinnedEl = document.getElementById('skipPinned');
  var allWindowsEl = document.getElementById('allWindows');

  // Load saved preferences, then refresh the stats display.
  function init() {
    browser.storage.local.get({ skipPinned: true, allWindows: false }).then(function (prefs) {
      skipPinnedEl.checked = prefs.skipPinned;
      allWindowsEl.checked = prefs.allWindows;
      refreshStats();
    });
  }

  // Query tabs based on current options and display counts.
  function refreshStats() {
    var query = allWindowsEl.checked ? {} : { currentWindow: true };
    browser.tabs.query(query).then(function (tabs) {
      var stats = getTabStats(tabs, { skipPinned: skipPinnedEl.checked });
      statTotalEl.textContent = stats.total + ' tab' + (stats.total !== 1 ? 's' : '') + ' total';
      statUnloadEl.textContent = stats.toUnload + ' can be unloaded';
      statDiscardedEl.textContent = stats.alreadyDiscarded + ' already unloaded';
      statPinnedEl.textContent = stats.pinned > 0 ? stats.pinned + ' pinned' : '';
      unloadBtn.disabled = stats.toUnload === 0;
      resultEl.textContent = '';
      resultEl.className = '';
    });
  }

  // Save a preference and refresh.
  function onOptionChange() {
    browser.storage.local.set({
      skipPinned: skipPinnedEl.checked,
      allWindows: allWindowsEl.checked
    });
    refreshStats();
  }

  // Unload the eligible tabs.
  function onUnload() {
    var query = allWindowsEl.checked ? {} : { currentWindow: true };
    unloadBtn.disabled = true;
    browser.tabs.query(query).then(function (tabs) {
      var toDiscard = filterTabsToUnload(tabs, { skipPinned: skipPinnedEl.checked });
      if (toDiscard.length === 0) {
        resultEl.textContent = 'No tabs to unload.';
        resultEl.className = 'result-none';
        return;
      }
      var ids = getTabIds(toDiscard);
      var count = ids.length;
      return browser.tabs.discard(ids).then(function () {
        resultEl.textContent = 'Unloaded ' + count + ' tab' + (count !== 1 ? 's' : '') + '.';
        resultEl.className = 'result-success';
        refreshStats();
      });
    }).catch(function (err) {
      resultEl.textContent = 'Error: ' + err.message;
      resultEl.className = 'result-error';
      unloadBtn.disabled = false;
    });
  }

  skipPinnedEl.addEventListener('change', onOptionChange);
  allWindowsEl.addEventListener('change', onOptionChange);
  unloadBtn.addEventListener('click', onUnload);

  document.addEventListener('DOMContentLoaded', init);
  // Also call init immediately in case DOMContentLoaded already fired (popup scripts load after DOM).
  if (document.readyState !== 'loading') {
    init();
  }
})();
