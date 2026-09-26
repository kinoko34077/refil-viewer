import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chooseMostVisiblePageIndex, cycleDisplayMode } from '../src/viewer-navigation.js'

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('display mode cycling follows the existing three viewer modes', () => {
  assert.equal(cycleDisplayMode('vertical'), 'spread')
  assert.equal(cycleDisplayMode('spread'), 'horizontal')
  assert.equal(cycleDisplayMode('horizontal'), 'vertical')
  assert.equal(cycleDisplayMode('unknown'), 'vertical')
})

test('scroll synchronization chooses the page with the greatest visible height', () => {
  const viewport = { top: 0, bottom: 100 }
  const pageRects = [
    { index: 0, top: -80, bottom: 20 },
    { index: 1, top: 10, bottom: 110 },
    { index: 2, top: 120, bottom: 220 },
  ]

  assert.equal(chooseMostVisiblePageIndex(pageRects, viewport, 0), 1)
})

test('spread ties preserve the current page when both pages are equally visible', () => {
  const viewport = { top: 0, bottom: 100 }
  const pageRects = [
    { index: 2, top: 0, bottom: 100 },
    { index: 3, top: 0, bottom: 100 },
  ]

  assert.equal(chooseMostVisiblePageIndex(pageRects, viewport, 3), 3)
  assert.equal(chooseMostVisiblePageIndex(pageRects, viewport, 0), 2)
})

test('App wires visible display toggle and natural scrolling without resetting reading position', async () => {
  const source = await read('src/App.vue')

  assert.match(source, /@toggle-display=["']toggleDisplayMode["']/)
  assert.match(source, /@scroll=["']handleScroll["']/)
  assert.doesNotMatch(source, /function setDisplayMode\([^)]*\)[\s\S]*?pageIndex\.value\s*=\s*0/)
})

test('viewer and Markdown load failures expose retryable user-visible state', async () => {
  const [app, markdown] = await Promise.all([
    read('src/App.vue'),
    read('src/components/MarkdownPage.vue'),
  ])

  assert.match(app, /role=["']alert["']/)
  assert.match(app, /再試行/)
  assert.match(app, /res\.ok/)
  assert.match(markdown, /role=["']alert["']/)
  assert.match(markdown, /再試行/)
  assert.match(markdown, /res\.ok/)
})

test('Sidebar page navigation uses native buttons', async () => {
  const sidebar = await read('src/components/Sidebar.vue')

  assert.match(sidebar, /<button[\s\S]*?v-for=["']p in pages["']/)
  assert.match(sidebar, /type=["']button["']/)
})
