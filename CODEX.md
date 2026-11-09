# CODEX.md — PhysioTimer

PhysioTimer is a dependency-free static PWA written in HTML, CSS and vanilla JavaScript.
Its structure deliberately matches Sebrbo's PhysioTempo, PhysioReact and PhysioStroop.

## Layout
- `index.html` is the UI shell; IDs are a stable contract with `js/app.js`.
- `css/style.css` styles mobile, desktop, countdown, dialogs and fullscreen.
- `js/core.js` is testable timing math and session scheduling, with no DOM.
- `js/i18n.js` holds FR/EN strings and UI translation.
- `js/app.js` manages session state, Web Audio, Wake Lock, settings and presets.
- `service-worker.js` and `manifest.webmanifest` make the site an offline PWA.
- `tests/test-core.cjs` uses Node's built-in test runner.

## Contracts and sensitive areas
- Never rename/remove an HTML ID without checking every `js/app.js` reference.
- Preserve the `physiotimer-v1` localStorage key or provide a documented migration.
- The segment order intentionally excludes rest after the final effort of each cycle.
- Between cycles use only cycle rest; do not also append round rest.
- Maintain monotonic elapsed timing via `performance.now()`, not callback counts.
- Changing app shell paths requires updating service worker precache and CACHE_NAME.
- Do not assume background audio works reliably on mobile browsers.
- Check language strings in both French and English when editing labels.
- Avoid frameworks/build systems unless the user explicitly wants them.
- Keep feature changes, visual redesign and offline cache work separate when practical.

## Tests
Run `node --test tests/test-core.cjs`.
Manually verify start, pause, resume, reset, rounds/cycles, skipped final rest,
program saved/loaded while same mode selected, audio, language and iPhone viewport.

## Licensing
Code: PolyForm Noncommercial 1.0.0 (`LICENCE`).
Non-code assets: CC BY-NC 4.0 (`LICENSE-CC-BY-NC-4.0`).
These are source-available noncommercial licenses, not OSI-approved open source licenses.
