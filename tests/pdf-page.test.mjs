import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { normalizePdfPageNumber, renderPdfPage } from "../src/pdf-page-loader.js";

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
  assert.match(source, /loadState\.value = ['"]ready['"][\s\S]*emit\(['"]page-ready['"]\)/);
});

test("PDF loader renders the requested page and updates canvas dimensions", async () => {
  const calls = [];
  const context = { kind: "2d" };
  const canvas = {
    width: 0,
    height: 0,
    getContext(type) {
      calls.push(["context", type]);
      return context;
    },
  };
  const viewport = { width: 960, height: 540 };
  const pdfPage = {
    getViewport(options) {
      calls.push(["viewport", options]);
      return viewport;
    },
    render(options) {
      calls.push(["render", options]);
      return { promise: Promise.resolve() };
    },
  };
  const pdf = {
    numPages: 3,
    async getPage(pageNumber) {
      calls.push(["page", pageNumber]);
      return pdfPage;
    },
  };
  const getDocument = (src) => {
    calls.push(["document", src]);
    return { promise: Promise.resolve(pdf) };
  };

  const pageNumber = await renderPdfPage({
    src: "/sample.pdf",
    page: 2,
    canvas,
    getDocument,
  });

  assert.equal(pageNumber, 2);
  assert.equal(canvas.width, 960);
  assert.equal(canvas.height, 540);
  assert.deepEqual(calls[0], ["context", "2d"]);
  assert.deepEqual(calls[1], ["document", "/sample.pdf"]);
  assert.deepEqual(calls[2], ["page", 2]);
  assert.deepEqual(calls[3], ["viewport", { scale: 1.5 }]);
  assert.equal(calls[4][0], "render");
  assert.equal(calls[4][1].canvasContext, context);
  assert.equal(calls[4][1].viewport, viewport);
});

test("PDF loader defaults to page 1 and rejects invalid or out-of-range page numbers", async () => {
  assert.equal(normalizePdfPageNumber(undefined), 1);
  assert.throws(() => normalizePdfPageNumber(0), /1 以上の整数/);
  assert.throws(() => normalizePdfPageNumber(1.5), /1 以上の整数/);

  const canvas = { getContext: () => ({}) };
  const getDocument = () => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage() {
        throw new Error("getPage must not run for out-of-range input");
      },
    }),
  });

  await assert.rejects(
    renderPdfPage({ src: "/sample.pdf", page: 3, canvas, getDocument }),
    /範囲外/,
  );
});

test("PDF loader propagates load, canvas, and render failures for visible recovery", async () => {
  await assert.rejects(
    renderPdfPage({
      src: "",
      page: 1,
      canvas: { getContext: () => ({}) },
      getDocument: () => ({ promise: Promise.resolve({}) }),
    }),
    /読み込み先/,
  );

  await assert.rejects(
    renderPdfPage({
      src: "/sample.pdf",
      page: 1,
      canvas: { getContext: () => null },
      getDocument: () => ({ promise: Promise.resolve({}) }),
    }),
    /2D context/,
  );

  await assert.rejects(
    renderPdfPage({
      src: "/sample.pdf",
      page: 1,
      canvas: { getContext: () => ({}) },
      getDocument: () => ({ promise: Promise.reject(new Error("network failed")) }),
    }),
    /network failed/,
  );

  await assert.rejects(
    renderPdfPage({
      src: "/sample.pdf",
      page: 1,
      canvas: { getContext: () => ({}) },
      getDocument: () => ({
        promise: Promise.resolve({
          numPages: 1,
          getPage: async () => ({
            getViewport: () => ({ width: 100, height: 100 }),
            render: () => ({ promise: Promise.reject(new Error("render failed")) }),
          }),
        }),
      }),
    }),
    /render failed/,
  );
});
