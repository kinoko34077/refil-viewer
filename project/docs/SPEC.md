# Project Specification

Status: active — first repository-local Base adoption

## Purpose

`refil-viewer` is a Vue/Vite browser viewer for refil content. Existing
rendering, data handling, export behavior, and browser presentation remain the
Project's implementation.

## Acceptance

1. Existing Vue/Vite behavior remains unchanged.
2. `knt doctor` validates the local Project Overlay and Base.
3. `knt verify` reaches the existing Vite build gate.
4. No Domain file is moved merely to satisfy the Base structure.

## Ownership boundary

- Vue UI, viewer rendering, data formats, public assets, and release behavior
  remain in the existing repository root.
- KiNoTch Base files and repository operations live under `.kinotch/`.
- The Project Manifest, contracts, and adoption state live under `project/`.
- No generic Web or Runtime helper replaces the existing Vite implementation.

## Commands

- Setup: `npm ci`
- Development: `npm run dev`
- Build / Verify: `npm run build` through `knt verify` fallback

## Constraints

The Base does not impose a framework, PWA structure, data format, or Runtime
dependency on this Project. Existing implementation boundaries remain
authoritative.

## Refil page-record contract

Before a loaded Refil document becomes current viewer state:

- `pages` must be an array of page records;
- each page ID must be a non-empty string or finite number and is normalized to a string identity;
- normalized page IDs must be unique within the document;
- supported page types are exactly `markdown`, `image`, and `pdf`; unknown types are invalid and are not reinterpreted as another type;
- every supported page requires a non-empty string `src`;
- validation completes for the whole document before `refilData.pages` is replaced; a validation failure keeps the previous/empty accepted document state and exposes one bounded load error;
- page IDs are data identities, not CSS selector fragments. Page readiness is communicated through component events rather than selector construction from an ID.
