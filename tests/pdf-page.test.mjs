import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/components/PDFPage.vue", import.meta.url), "utf8");

test("PDF page uses repository-managed pdfjs worker instead of runtime CDN", () => {
  assert.doesNotMatch(source, /cdnjs\.cloudflare\.com/);
  assert.match(source, /pdfjs-dist\/build\/pdf\.worker\.min\.js\?url/);
});

test("PDF page exposes bounded loading, error, and retry UI", () => {
  assert.match(source, /loadState === ['"]loading['"]/);
  assert.match(source, /loadState === ['"]error['"]/);
  assert.match(source, /role=["']alert["']/);
  assert.match(source, /@click=["']loadPdf["']/);
});

test("PDF page emits page-ready only through the successful load path", () => {
  assert.match(source, /await renderPdfPage\(/);
  assert.match(source, /emit\(['"]page-ready['"]\)/);
});
