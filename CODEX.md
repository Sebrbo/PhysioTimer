# CODEX.md — PhysioTimer

PhysioTimer is a dependency-free static PWA written in HTML, CSS and vanilla JavaScript.
Its structure deliberately matches Sebrbo's PhysioTempo, PhysioReact and PhysioStroop.

## Layout
- `index.html` is the UI shell; IDs are a stable contract with `js/app.js`.
- `css/style.css` styles mobile, desktop, countdown, dialogs and fullscreen.
- `js/core.js` is testable timing math and session scheduling, with no DOM.
- `js/share.js` encodes/decodes compact links and rejects invalid incoming settings.
- `js/qr.js` bundles an MIT-licensed third-party QR encoder for entirely local rendering; preserve `THIRD_PARTY_NOTICES.md`.
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

## Duration input (v0.3.2)

The 5 time settings consist of two named inputs per field: `${field}Min` and `${field}Sec`, enclosed by `.duration-entry` and a permanent `:`. The `durationFields` loop in `js/app.js` binds these to integer seconds and validates seconds under 60. Preserve input names and the colon UI if editing duration behavior.

## Sharing and QR code (v0.4.0)

- Share tokens contain only a version, mode and seven integer timing parameters; never encode patient names or health information.
- Shared sessions must stay in memory and never overwrite localStorage presets or stored program configuration without an explicit user action.
- When changing URL encoding, keep backward compatibility with version 1 tokens if possible and test invalid query values.
- QR must be generated locally without external network calls.
- A patient starts with an explicit click, which unlocks audio on mobile browsers.
- Run `node --test tests/*.cjs` including share link tests.
