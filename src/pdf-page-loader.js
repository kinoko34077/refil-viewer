export function normalizePdfPageNumber(value) {
  if (value === undefined || value === null) {
    return 1
  }

  const pageNumber = Number(value)
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new Error('PDF のページ番号は 1 以上の整数で指定してください。')
  }

  return pageNumber
}

export async function renderPdfPage({
  src,
  page,
  canvas,
  getDocument,
  scale = 1.5,
}) {
  if (typeof src !== 'string' || src.trim() === '') {
    throw new Error('PDF の読み込み先が指定されていません。')
  }
  if (typeof getDocument !== 'function') {
    throw new TypeError('getDocument must be a function')
  }
  if (!canvas || typeof canvas.getContext !== 'function') {
    throw new Error('PDF 描画用 canvas を初期化できませんでした。')
  }

  const pageNumber = normalizePdfPageNumber(page)
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('PDF 描画用 2D context を取得できませんでした。')
  }

  const loadingTask = getDocument(src)
  if (!loadingTask?.promise) {
    throw new Error('PDF 読み込みタスクを開始できませんでした。')
  }

  const pdf = await loadingTask.promise
  if (Number.isInteger(pdf?.numPages) && pageNumber > pdf.numPages) {
    throw new Error(`PDF のページ番号 ${pageNumber} は範囲外です。`)
  }

  const pdfPage = await pdf.getPage(pageNumber)
  const viewport = pdfPage.getViewport({ scale })
  canvas.height = viewport.height
  canvas.width = viewport.width

  const renderTask = pdfPage.render({ canvasContext: context, viewport })
  if (!renderTask?.promise) {
    throw new Error('PDF 描画タスクを開始できませんでした。')
  }

  await renderTask.promise
  return pageNumber
}
