const SUPPORTED_PAGE_TYPES = new Set(['markdown', 'image', 'pdf'])

export class RefilFormatError extends Error {
  constructor(message) {
    super(message)
    this.name = 'RefilFormatError'
  }
}

function normalizePageId(value, index) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new RefilFormatError(`Page ${index + 1}: invalid page ID.`)
    }
    return String(value)
  }

  if (typeof value !== 'string' || value.trim() === '' || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new RefilFormatError(`Page ${index + 1}: invalid page ID.`)
  }
  return value
}

function validatePage(page, index, seenIds) {
  if (!page || typeof page !== 'object' || Array.isArray(page)) {
    throw new RefilFormatError(`Page ${index + 1}: invalid page record.`)
  }

  const id = normalizePageId(page.id, index)
  if (seenIds.has(id)) {
    throw new RefilFormatError(`Page ${index + 1}: duplicate page ID.`)
  }
  seenIds.add(id)

  if (typeof page.type !== 'string' || !SUPPORTED_PAGE_TYPES.has(page.type)) {
    throw new RefilFormatError(`Page ${index + 1}: unsupported page type.`)
  }

  if (typeof page.src !== 'string' || page.src.trim() === '') {
    throw new RefilFormatError(`Page ${index + 1}: invalid page source.`)
  }

  return {
    ...page,
    id,
    src: page.src.trim(),
  }
}

export function validateRefilDocument(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new RefilFormatError('Refil document is invalid.')
  }
  if (!Array.isArray(document.pages)) {
    throw new RefilFormatError('Refil pages must be an array.')
  }

  const seenIds = new Set()
  return {
    ...document,
    pages: document.pages.map((page, index) => validatePage(page, index, seenIds)),
  }
}
