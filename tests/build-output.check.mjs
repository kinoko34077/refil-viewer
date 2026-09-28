import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const distUrl = new URL('../dist/', import.meta.url)
const read = (path) => fs.readFile(new URL(path, distUrl), 'utf8')
const exists = async (path) => {
  try {
    await fs.access(new URL(path, distUrl))
    return true
  } catch {
    return false
  }
}

assert.equal(await exists('pdfjs/web/refil-adapter.js'), false,
  'legacy Refil adapter must not be present in production output')
assert.equal(await exists('pdfjs-wrapper.html'), false,
  'legacy Refil PDF.js wrapper must not be present in production output')

const viewer = await read('pdfjs/web/viewer.html')
assert.doesNotMatch(viewer, /refil-adapter\.js/,
  'production PDF.js viewer must not load the legacy Refil adapter')

console.log('PASS: production output excludes legacy PDF.js Refil execution surface')
