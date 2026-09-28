# Current State

Base version: `0.3.8`

Last verified: 2026-09-28 - Issue #6 legacy PDF.js Refil execution-surface removal passed 8/8 Project tests, Vite production build, and the production-output absence gate on branch `fix/issue-6-disable-legacy-refil-pdfjs`.

## Implemented

- Repository-local KiNoTch Base v0.3.8 and Project Overlay
- `web-app` Surface declaration
- Structured `npm ci`, Vite development, test, build, and verify commands
- Existing Vue/Vite source, public assets, and viewer behavior retained
- Existing Domain files remain at their original paths; no bulk move was performed
- Project-owned duplicate `pageIndex` declaration in `src/App.vue` resolved with a one-line source deletion
- Viewer navigation regression tests run through `knt verify` before the Vite production build
- TopBar display-mode toggle is connected to the viewer and preserves the current page across mode changes
- Vertical/spread natural scrolling synchronizes current-page state from actual page visibility rather than viewport-height assumptions
- Sidebar page entries use native buttons for keyboard activation
- Refil and Markdown load failures expose user-visible error states with retry actions and HTTP-status checks
- The legacy public PDF.js Refil adapter/wrapper is unsupported and removed from shipped source; the supported Refil surface is the primary Vue/Vite application.
- `npm run verify` includes a post-build check that rejects reintroduction of the legacy PDF.js Refil adapter/wrapper in production output.

## Default state

- `web-app`: `OVERRIDE` — existing Vue/Vite viewer is authoritative

## Known constraints

- Viewer rendering, data formats, export behavior, and deployment remain Project-owned.
- `knt verify` runs Project-owned Node regression tests and then the existing Vite production build.
- Browser-specific scroll feel, focus behavior, thumbnail timing, and layout at different zoom/viewport combinations remain manual smoke-test boundaries even though current-page selection logic is covered by deterministic tests.
- The Base does not generate a framework or viewer-specific helper.
- The static `public/pdfjs/web/viewer.html` asset is not a supported Refil loader and must not load `refil-adapter.js`.

## Next work

1. Preserve the existing Vue/Vite implementation as a Project override.
2. Add further Project-specific tests only when a stable behavioral contract is defined.
3. Keep repository-local Base verification green after future Project changes.
4. Record any browser-only reproduction as a separate Issue instead of broadening the current maintenance scope.

## Verification

- Existing main/base SHA `d4b0c02d0e8afc75b597d8f7a0dca53c76dfa80f`: Verify Run #2 failed with the duplicate declaration still present.
- PR #2 first fixed head `e88d6584e7508247618895a60b63f82ebfefb43b`: Verify Run `36121976028` completed successfully.
- Issue #3 RED head `7058b35eca1c9729fea2bc3706468cb4f36e2a80`: Verify Run `36235628292` failed because the new navigation helper did not yet exist.
- Issue #3 GREEN head `90aed5deb4dfbbfd4478c6434d0595805f6354b2`: Verify Run `36235747062` passed 6/6 viewer maintenance tests and the Vite production build.
- Issue #3 Current State sync head `f971670e4f8c6476076d7714b41045d04315919c`: Verify Run `36235803764` passed after documentation synchronization.
- Issue #6 local branch verification: `npm run verify` passed 8/8 tests, Vite production build, and `tests/build-output.check.mjs`; the Windows `knt verify` wrapper also fails unchanged main because it promotes the pre-existing `pdfjs-dist` Rollup eval warning from stderr, so exact-head GitHub Verify remains the authoritative Base gate for this change.
- `knt doctor`
- `knt setup`
- `knt test`
- `knt verify`
