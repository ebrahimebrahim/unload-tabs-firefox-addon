/* global filterTabsToUnload, getTabStats, getTabIds */

(() => {
  const statTotalEl = document.getElementById('stat-total');
  const statUnloadEl = document.getElementById('stat-unload');
  const statDiscardedEl = document.getElementById('stat-discarded');
  const statPinnedEl = document.getElementById('stat-pinned');
  const resultEl = document.getElementById('result');
  const unloadBtn = document.getElementById('unloadBtn');
  const skipPinnedEl = document.getElementById('skipPinned');
  const allWindowsEl = document.getElementById('allWindows');

  const getQuery = () => allWindowsEl.checked ? {} : { currentWindow: true };

  function refreshStats() {
    browser.tabs.query(getQuery()).then(tabs => {
      const stats = getTabStats(tabs, { skipPinned: skipPinnedEl.checked });
      statTotalEl.textContent = `${stats.total} tab${stats.total !== 1 ? 's' : ''} total`;
      statUnloadEl.textContent = `${stats.toUnload} can be unloaded`;
      statDiscardedEl.textContent = `${stats.alreadyDiscarded} already unloaded`;
      statPinnedEl.textContent = stats.pinned > 0 ? `${stats.pinned} pinned` : '';
      unloadBtn.disabled = stats.toUnload === 0;
      resultEl.textContent = '';
      resultEl.className = '';
    });
  }

  function init() {
    browser.storage.local.get({ skipPinned: true, allWindows: false }).then(prefs => {
      skipPinnedEl.checked = prefs.skipPinned;
      allWindowsEl.checked = prefs.allWindows;
      refreshStats();
    });
  }

  function onOptionChange() {
    browser.storage.local.set({
      skipPinned: skipPinnedEl.checked,
      allWindows: allWindowsEl.checked
    });
    refreshStats();
  }

  function onUnload() {
    unloadBtn.disabled = true;
    browser.tabs.query(getQuery()).then(tabs => {
      const toDiscard = filterTabsToUnload(tabs, { skipPinned: skipPinnedEl.checked });
      if (toDiscard.length === 0) {
        resultEl.textContent = 'No tabs to unload.';
        resultEl.className = 'result-none';
        return;
      }
      const ids = getTabIds(toDiscard);
      return browser.tabs.discard(ids).then(() => {
        window.close();
      });
    }).catch(err => {
      resultEl.textContent = `Error: ${err.message}`;
      resultEl.className = 'result-error';
      unloadBtn.disabled = false;
    });
  }

  skipPinnedEl.addEventListener('change', onOptionChange);
  allWindowsEl.addEventListener('change', onOptionChange);
  unloadBtn.addEventListener('click', onUnload);

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
