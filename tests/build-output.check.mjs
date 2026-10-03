import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const distUrl = new URL('../dist/', import.meta.url)
const distPath = fileURLToPath(distUrl)
const read = (relativePath) => fs.readFile(new URL(relativePath, distUrl), 'utf8')
const exists = async (relativePath) => {
  try {
    await fs.access(new URL(relativePath, distUrl))
    return true
  } catch {
    return false
  }
}

async function listFiles(root, prefix = '') {
  const entries = await fs.readdir(root, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name)
    const absolutePath = path.join(root, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listFiles(absolutePath, relativePath))
    } else if (entry.isFile()) {
      files.push(relativePath)
    }
  }

  return files
}

assert.equal(await exists('pdfjs/web/refil-adapter.js'), false,
  'legacy Refil adapter must not be present in production output')
assert.equal(await exists('pdfjs-wrapper.html'), false,
  'legacy Refil PDF.js wrapper must not be present in production output')

const viewer = await read('pdfjs/web/viewer.html')
assert.doesNotMatch(viewer, /refil-adapter\.js/,
  'production PDF.js viewer must not load the legacy Refil adapter')

const outputFiles = await listFiles(distPath)
const bundledWorker = outputFiles.find((relativePath) =>
  /^assets\/pdf\.worker\.min-[^/]+\.js$/.test(relativePath))
assert.ok(bundledWorker,
  'production output must include the repository-managed pdfjs-dist worker asset')

for (const relativePath of outputFiles.filter((file) => /\.(?:html|css|js)$/.test(file))) {
  const text = await fs.readFile(path.join(distPath, relativePath), 'utf8')
  assert.doesNotMatch(text, /cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js/i,
    `production output must not depend on the runtime cdnjs PDF worker: ${relativePath}`)
}

console.log(`PASS: production output excludes legacy Refil PDF.js surface and bundles ${bundledWorker}`)
