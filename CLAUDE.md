# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm test` — run unit tests (Node.js built-in test runner: `node --test`)
- `npm run lint` — validate manifest and extension structure with `web-ext lint`
- `npm start` — load addon in Firefox with auto-reload via `web-ext run`

## Architecture

This is a Firefox WebExtension (Manifest V2) that unloads inactive tabs to free memory.

**Two-layer design:**

- `lib/tab-utils.js` — Pure filtering/counting logic with zero browser API dependencies. Exported functions (`filterTabsToUnload`, `getTabStats`, `getTabIds`, `canDiscard`) are the only testable code.
- `popup/popup.js` — Thin glue layer that wires DOM events to `browser.tabs.*` and `browser.storage.*` APIs. Not unit-testable; verified via `web-ext lint` and manual testing.

**Dual-context module pattern:** `lib/tab-utils.js` uses a `typeof module` check to export via CommonJS for Node.js tests, while the popup loads it as a plain `<script>` tag (functions become globals). When adding new pure functions, follow this same pattern — define as regular functions, add to the `module.exports` block at the bottom.

**Undiscardable URLs:** Firefox silently refuses to discard `about:`, `chrome:`, `resource:`, and `moz-extension:` tabs. The `canDiscard()` function filters these out so the UI count matches reality.
