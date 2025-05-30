// Removed unsupported imports for browser context
// import { RenderingStates, ScrollMode, SpreadMode } from "./ui_utils.js";
// import { AppOptions } from "./app_options.js";
// import { LinkTarget } from "./pdf_link_service.js";
// import { PDFViewerApplication } from "./app.js";

// Removed imports incompatible with direct browser usage
// import * as pdfjsLib from "pdfjs-dist/build/pdf";
// import "pdfjs-dist/build/pdf.worker";

const pdfjsLib = window['pdfjsLib'];
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js`;

function renderPdfDirectly(pdfUrl, container) {
  pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      pdf.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        container.appendChild(canvas);
        page.render({ canvasContext: context, viewport: viewport });
      });
    }
  });
}

function webViewerLoad() {
  const container = document.getElementById("viewer") || document.body;

  fetch("/sample.refil")
    .then((res) => res.json())
    .then((refil) => {
      const firstPage = refil.pages.find((p) => p.type === "pdf");
      if (firstPage) {
        renderPdfDirectly(firstPage.src, container);
      } else {
        console.warn("No PDF page found in .refil file.");
      }
    });
}

document.blockUnblockOnload?.(true);

if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  webViewerLoad();
} else {
  document.addEventListener("DOMContentLoaded", webViewerLoad, true);
}
