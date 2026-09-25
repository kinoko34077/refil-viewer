# Current State

Base version: `0.3.8`

Last verified: 2026-09-25 — Project-owned duplicate `pageIndex` declaration removed; repository Verify workflow restored to green on PR #2

## Implemented

- Repository-local KiNoTch Base v0.3.8 and Project Overlay
- `web-app` Surface declaration
- Structured `npm ci`, Vite development, and build commands
- Existing Vue/Vite source, public assets, and viewer behavior retained
- Existing Domain files remain at their original paths; no bulk move was performed
- Project-owned duplicate `pageIndex` declaration in `src/App.vue` resolved with a one-line source deletion

## Default state

- `web-app`: `OVERRIDE` — existing Vue/Vite viewer is authoritative

## Known constraints

- Viewer rendering, data formats, export behavior, and deployment remain Project-owned.
- There is no Project test script currently registered; `knt verify` falls back to the existing Vite build command.
- The Base does not generate a framework or viewer-specific helper.
- Build verification does not replace interactive viewer-behavior checks when UI behavior itself changes.

## Next work

1. Preserve the existing Vue/Vite implementation as a Project override.
2. Add Project-specific automated tests only when a stable behavioral check is defined.
3. Keep repository-local Base verification green after future Project changes.

## Verification

- Existing main/base SHA `d4b0c02d0e8afc75b597d8f7a0dca53c76dfa80f`: Verify Run #2 failed with the duplicate declaration still present.
- PR #2 first fixed head `e88d6584e7508247618895a60b63f82ebfefb43b`: Verify Run `36121976028` completed successfully.
- `knt doctor`
- `knt base-check`
- `knt setup`
- `knt verify`
