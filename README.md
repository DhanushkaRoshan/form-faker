# Form Faker

> Originally built in 2024. Uploaded to GitHub in 2026.

A Firefox extension that fills form fields with realistic random data. Right-click any input field to get smart suggestions powered by [Faker.js](https://fakerjs.dev/).

## Features

- **Smart Detection** — Detects input type from `type`, `name`, `id`, `placeholder`, `label`, and `autocomplete` attributes
- **Filtered Menu** — Shows only relevant options based on the detected field type
- **Auto Fill** — One-click best guess fill for the focused field
- **Fill All** — Fills every field on the page with appropriate random data
- **18 Data Types** — Names, emails, phones, addresses, passwords, URLs, dates, UUIDs, and more

## Install

1. Clone this repo
2. Run `npm install && npm run build`
3. Open Firefox and go to `about:debugging#/runtime/this-firefox`
4. Click **Load Temporary Add-on** and select `manifest.json`

## Usage

1. Right-click any input field or textarea
2. Hover over **🎲 Random Inputs**
3. Pick a data type or click **✨ Auto Fill** for the best guess

## Development

```bash
npm install
npm run build
```

After editing `src/background-entry.js`, run `npm run build` to rebundle, then reload the extension in `about:debugging`.

## Tech

- [Faker.js](https://fakerjs.dev/) for data generation
- [esbuild](https://esbuild.github.io/) for bundling
- Firefox WebExtension APIs (`contextMenus`, `contextMenus.onShown`)
