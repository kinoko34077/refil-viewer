# Current State

Base version: `0.3.8`

Last verified: 2026-09-29 — Issue #6 / PR #7 accepted on main `02c86bce848c3faf5f8c1a205189de785fa309a1`; post-main Verify run `36515794679` passed.

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
- Refil page records are validated as one document before viewer-state commit: supported type, normalized unique ID, and required source are fail-closed.
- Page readiness no longer constructs a CSS selector from document-provided page IDs; Markdown pages emit the component event directly.
- Invalid Refil documents preserve the last accepted page set while exposing a bounded retryable load error.
- The legacy public PDF.js Refil adapter/wrapper is unsupported and absent from accepted shipped source; the supported Refil surface is the primary Vue/Vite application.
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
- Issue #5 reviewed head `f10b1b52a04a7a1ad0ddd248f66ff511a0036309`: Verify Run `36486294332` passed 15/15 tests and the Vite production build; PR #10 merged as `183e9a66bbab2de0bff3c6efb58287b96e6df407` and post-merge Verify Run `36486478107` passed.
- Issue #6 / PR #7 integrated head `2dcd13cb2bc0a13e0717bb1ff3fceddf67541b37`: Verify Run `36486913934` passed; exact-head independent review approved the change; PR #7 merged as main `02c86bce848c3faf5f8c1a205189de785fa309a1` at 2026-09-29T03:08:07Z; post-main Verify `36515794679` passed.
- The Windows `knt verify` wrapper promotes the pre-existing `pdfjs-dist` Rollup eval warning from stderr; this reproduces on unchanged main, so GitHub Verify remains the authoritative Base gate for affected branches.
- `knt doctor`
- `knt setup`
- `knt test`
- `knt verify`
