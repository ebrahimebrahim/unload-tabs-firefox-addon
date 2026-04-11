# Unload Tabs - Firefox Addon

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser)](https://addons.mozilla.org/firefox/)

> **Disclaimer:** This extension is AI-generated slop. Use at your own risk.

A lightweight Firefox addon that unloads all inactive tabs with one click, freeing memory on machines with limited RAM. Unloaded tabs stay visible in the tab bar — clicking one reloads it on demand.

## Features

- One-click unloading of all inactive tabs via a toolbar button
- Shows tab stats before you click (how many will be unloaded, how many already are)
- Option to skip pinned tabs (on by default)
- Option to include tabs from all windows (off by default — only current window)
- Preferences are remembered across sessions
- Supports light and dark Firefox themes
- Requires Firefox 79+

## Installation

### Temporary install (for development / testing)

1. Open Firefox and navigate to `about:debugging`
2. Click **"This Firefox"** in the left sidebar
3. Click **"Load Temporary Add-on..."**
4. Navigate to this project folder and select `manifest.json`
5. The addon icon appears in the toolbar — click it to use

> **Note:** Temporary addons are removed when Firefox restarts.

### Using web-ext (recommended for development)

```bash
npm install
npm start
```

This opens Firefox with the addon loaded and auto-reloads on file changes.

## Usage

1. Click the **Unload Tabs** icon in the toolbar
2. Review the tab stats shown in the popup
3. Adjust options if needed:
   - **Skip pinned tabs** — checked by default, keeps pinned tabs loaded
   - **Include all windows** — unchecked by default, only affects the current window
4. Click **"Unload Inactive Tabs"**
5. The result shows how many tabs were unloaded

Unloaded tabs remain in the tab bar. When you click an unloaded tab, Firefox reloads its content.

## Development

### Prerequisites

- Node.js 18+
- Firefox

### Setup

```bash
npm install
```

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

### Run in Firefox

```bash
npm start
```

Launches Firefox with the addon loaded. Watches for file changes and reloads automatically.

## How it works

The addon uses Firefox's [`browser.tabs.discard()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/discard) API to unload tabs from memory without closing them. This is the same mechanism Firefox uses internally when it auto-discards tabs under memory pressure, but triggered manually by the user.

The core filtering logic (which tabs to unload) is extracted into `lib/tab-utils.js` with no browser API dependencies, making it fully testable under Node.js.