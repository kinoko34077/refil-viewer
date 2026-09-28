import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const repoUrl = new URL('../', import.meta.url)
const read = (path) => fs.readFile(new URL(path, repoUrl), 'utf8')
const exists = async (path) => {
  try {
    await fs.access(new URL(path, repoUrl))
    return true
  } catch {
    return false
  }
}

test('legacy PDF.js Refil adapter is not a shipped source entry point', async () => {
  assert.equal(await exists('public/pdfjs/web/refil-adapter.js'), false)
  assert.equal(await exists('public/pdfjs-wrapper.html'), false)

  const viewer = await read('public/pdfjs/web/viewer.html')
  assert.doesNotMatch(viewer, /refil-adapter\.js/)
})

test('primary Vue PDF renderer does not depend on the legacy public PDF.js Refil surface', async () => {
  const pdfPage = await read('src/components/PDFPage.vue')
  assert.match(pdfPage, /from ['"]pdfjs-dist['"]/)
  assert.doesNotMatch(pdfPage, /pdfjs\/web\/viewer|pdfjs-wrapper|refil-adapter/)
})
