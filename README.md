# Unload Tabs - Firefox Addon

[![CI](https://github.com/ebrahimebrahim/unload-tabs-firefox-addon/actions/workflows/ci.yml/badge.svg)](https://github.com/ebrahimebrahim/unload-tabs-firefox-addon/actions/workflows/ci.yml)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser)](https://addons.mozilla.org/firefox/addon/unload-tabs-button/)


A lightweight Firefox addon that unloads all inactive tabs with one click, freeing memory on machines with limited RAM. Unloaded tabs stay visible in the tab bar — clicking one reloads it on demand.

## Features

- One-click unloading of all inactive tabs via a toolbar button
- Shows how many inactive tabs are currently loaded before you click
- Option to skip pinned tabs (on by default)
- Option to include tabs from all windows (off by default — only current window)
- Preferences are remembered across sessions
- Supports light and dark Firefox themes
- Requires Firefox 79+

## Install

**[Install from Firefox Add-ons](https://addons.mozilla.org/firefox/addon/unload-tabs-button/)**

## Usage

1. Click the **Unload Tabs** icon in the toolbar
2. Review the tab stats shown in the popup
3. Adjust options if needed:
   - **Skip pinned tabs** — checked by default, keeps pinned tabs loaded
   - **Include all windows** — unchecked by default, only affects the current window
4. Click **"Unload Inactive Tabs"** — the popup closes once the tabs have been unloaded

Unloaded tabs remain in the tab bar. When you click an unloaded tab, Firefox reloads its content.

## Development

### Prerequisites

- Node.js 18+
- Firefox

### Setup

```bash
npm install
```

### Load addon locally

Load via `about:debugging` → "This Firefox" → "Load Temporary Add-on" → select `manifest.json`. Or run `npm start` to launch Firefox with auto-reload.

### Run tests

```bash
npm test
```

Runs unit tests for the core tab filtering/counting logic using Node.js built-in test runner.

### Lint the extension

```bash
npm run lint
```

Validates `manifest.json` and extension structure using `web-ext lint`.

### Build a release artifact

```bash
npm run build
```

Produces `web-ext-artifacts/unload_tabs-<version>.zip`, suitable for uploading to [addons.mozilla.org](https://addons.mozilla.org/) as a new version. Bump the `version` in both `manifest.json` and `package.json` first.

## How it works

The addon uses Firefox's [`browser.tabs.discard()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/discard) API to unload tabs from memory without closing them. This is the same mechanism Firefox uses internally when it auto-discards tabs under memory pressure, but triggered manually by the user.

The core filtering logic (which tabs to unload) is extracted into `lib/tab-utils.js` with no browser API dependencies, making it fully testable under Node.js.