import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as jsyaml from 'js-yaml'
import { validateRefilDocument } from '../src/refil-document.js'

const validPage = (overrides = {}) => ({
  id: 'page-1',
  type: 'markdown',
  src: 'pages/001.md',
  ...overrides,
})

test('normalizes accepted scalar page IDs to stable strings', () => {
  const document = validateRefilDocument({ pages: [validPage({ id: 1 })] })
  assert.equal(document.pages[0].id, '1')
})

test('rejects unsupported page types instead of reinterpreting them', () => {
  assert.throws(
    () => validateRefilDocument({ pages: [validPage({ type: 'markdwon' })] }),
    /unsupported page type/i,
  )
})

test('rejects missing and duplicate page identity before commit', () => {
  assert.throws(() => validateRefilDocument({ pages: [validPage({ id: '' })] }), /page id/i)
  assert.throws(
    () => validateRefilDocument({ pages: [validPage({ id: 1 }), validPage({ id: '1' })] }),
    /duplicate page id/i,
  )
})

test('rejects missing type-specific sources before commit', () => {
  for (const type of ['markdown', 'image', 'pdf']) {
    assert.throws(
      () => validateRefilDocument({ pages: [validPage({ type, src: '   ' })] }),
      /page source/i,
    )
  }
})

test('accepts special-character IDs without treating them as selectors', () => {
  const id = "chapter']#1 / α"
  const document = validateRefilDocument({ pages: [validPage({ id })] })
  assert.equal(document.pages[0].id, id)
})

test('rejects malformed page records and preserves non-mutating validation', () => {
  const input = { pages: [validPage()] }
  const document = validateRefilDocument(input)
  assert.notEqual(document.pages, input.pages)
  assert.throws(() => validateRefilDocument({ pages: [null] }), /page record/i)
  assert.throws(() => validateRefilDocument({}), /pages/i)
})

test('existing sample Refil remains valid', () => {
  const sample = jsyaml.load(readFileSync(new URL('../public/sample.refil', import.meta.url), 'utf8'))
  const document = validateRefilDocument(sample)
  assert.deepEqual(document.pages.map((page) => page.id), ['1', '2', '3'])
})

test('primary components do not reinterpret unknown types or query CSS by page ID', () => {
  const pageViewer = readFileSync(new URL('../src/components/PageViewer.vue', import.meta.url), 'utf8')
  const markdownPage = readFileSync(new URL('../src/components/MarkdownPage.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(pageViewer, /\|\|\s*MarkdownPage/)
  assert.doesNotMatch(markdownPage, /querySelector/)
  assert.match(markdownPage, /emit\(['"]page-ready['"]\)/)
})

test('App validates before commit and preserves last-good pages on load failure', () => {
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  assert.match(app, /const validated = validateRefilDocument\(json\)[\s\S]*refilData\.pages = validated\.pages/)
  const catchBody = app.match(/} catch \(error\) \{([\s\S]*?)\n  \}\n}\n\nonMounted/)?.[1] ?? ''
  assert.doesNotMatch(catchBody, /refilData\.pages\s*=\s*\[\]/)
})
