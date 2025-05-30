// RefilPDFViewer.js
// PDF.js viewer を拡張して .refil 仕様のページ差し替えに対応する実験的実装

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import MarkdownIt from 'markdown-it';

// CDN 経由の worker に設定（Vite互換）
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const md = new MarkdownIt();

export default class RefilPDFViewer {
  constructor(container, refilData) {
    this.container = container;
    this.refilData = refilData.pages;
    this.currentPage = 0;
    this.pageElements = [];
  }

  async init() {
    this.container.innerHTML = ''; // 初期化
    for (let i = 0; i < this.refilData.length; i++) {
      const pageData = this.refilData[i];
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'refil-page';

      switch (pageData.type) {
        case 'pdf':
          await this.renderPDF(pageData.src, pageWrapper);
          break;
        case 'image':
          this.renderImage(pageData.src, pageWrapper);
          break;
        case 'markdown':
          this.renderMarkdown(pageData.src, pageWrapper);
          break;
        default:
          pageWrapper.innerHTML = `<div style="color:red">Unsupported type: ${pageData.type}</div>`;
      }

      this.pageElements.push(pageWrapper);
      this.container.appendChild(pageWrapper);
    }
  }

  async renderPDF(src, wrapper) {
    const pdf = await getDocument(src).promise;
    const page = await pdf.getPage(1); // 1ページのみ表示（mini viewer的）
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    wrapper.appendChild(canvas);
  }

  renderImage(src, wrapper) {
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    wrapper.appendChild(img);
  }

  renderMarkdown(src, wrapper) {
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        const html = md.render(text);
        wrapper.innerHTML = html;
      });
  }

  goToPage(index) {
    if (index >= 0 && index < this.pageElements.length) {
      this.pageElements[this.currentPage].style.display = 'none';
      this.pageElements[index].style.display = 'block';
      this.currentPage = index;
    }
  }
}
f