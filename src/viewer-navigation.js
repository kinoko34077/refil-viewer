const DISPLAY_MODES = ['vertical', 'spread', 'horizontal']

export function cycleDisplayMode(mode) {
  const index = DISPLAY_MODES.indexOf(mode)
  if (index < 0) return DISPLAY_MODES[0]
  return DISPLAY_MODES[(index + 1) % DISPLAY_MODES.length]
}

export function chooseMostVisiblePageIndex(pageRects, viewport, currentIndex = 0) {
  if (!viewport || !Number.isFinite(viewport.top) || !Number.isFinite(viewport.bottom)) {
    return currentIndex
  }

  const candidates = (Array.isArray(pageRects) ? pageRects : [])
    .filter((rect) => rect && Number.isInteger(rect.index) && Number.isFinite(rect.top) && Number.isFinite(rect.bottom))
    .map((rect) => ({
      index: rect.index,
      visibleHeight: Math.max(0, Math.min(rect.bottom, viewport.bottom) - Math.max(rect.top, viewport.top)),
    }))

  if (candidates.length === 0) return currentIndex

  const maxVisibleHeight = Math.max(...candidates.map((candidate) => candidate.visibleHeight))
  if (maxVisibleHeight <= 0) return currentIndex

  const mostVisible = candidates.filter((candidate) => candidate.visibleHeight === maxVisibleHeight)
  if (mostVisible.some((candidate) => candidate.index === currentIndex)) {
    return currentIndex
  }

  return mostVisible[0].index
}
