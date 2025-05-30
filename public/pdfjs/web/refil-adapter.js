// web/refil-adapter.js
import yaml from 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm'

async function loadRefil() {
  const urlParams = new URLSearchParams(window.location.search)
  const refilPath = urlParams.get('refil')
  if (!refilPath) return

  const raw = await (await fetch(`/${refilPath}`)).text()
  const refil = yaml.load(raw)

  const viewer = document.getElementById('viewer')
  viewer.innerHTML = '' // 既存ページを消す

  for (const [i, page] of refil.pages.entries()) {
    const div = document.createElement('div')
    div.className = 'page'
    div.style = 'margin: 20px; border: 1px solid #ccc; padding: 20px;'

    if (page.type === 'pdf') {
      const iframe = document.createElement('iframe')
      iframe.src = page.src
      iframe.style = 'width: 100%; height: 800px; border: none;'
      div.appendChild(iframe)
    } else if (page.type === 'image') {
      const img = new Image()
      img.src = page.src
      img.style = 'width: 100%;'
      div.appendChild(img)
    } else if (page.type === 'markdown') {
      const text = await (await fetch(page.src)).text()
      const html = markdownToHtml(text)
      div.innerHTML = html
    }

    viewer.appendChild(div)
  }
}

function markdownToHtml(md) {
  // 超簡易なMarkdown変換（本番は marked.js などを使うべき）
  return md
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

window.addEventListener('DOMContentLoaded', loadRefil)
