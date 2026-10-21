import { access, copyFile, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
const entry = path.join(dist, 'index.html')
const fallback = path.join(dist, '404.html')
const html = await readFile(entry, 'utf8')

await copyFile(entry, fallback)
await access(fallback)

const problems = []

if (!html.includes('/docform/assets/')) {
  problems.push('The built entry does not reference /docform/assets/.')
}
if (/(?:src|href)="\/assets\//.test(html)) {
  problems.push('The built entry still contains root-absolute asset paths.')
}
if (html.includes('href="/favicon.svg"')) {
  problems.push('The favicon still uses the root path instead of the Pages base.')
}

const fallbackHtml = await readFile(fallback, 'utf8')
if (fallbackHtml !== html) {
  problems.push('The 404 fallback is not a copy of the built entry.')
}

const assets = await readdir(path.join(dist, 'assets'))
const scripts = assets.filter((name) => name.endsWith('.js'))
const scriptContents = await Promise.all(
  scripts.map((name) => readFile(path.join(dist, 'assets', name), 'utf8')),
)
if (
  !scriptContents.some(
    (content) => content.includes('.wasm') && content.includes('/docform/assets/'),
  )
) {
  problems.push('No built script references the ODT wasm asset under /docform/.')
}

if (problems.length > 0) {
  throw new Error(`Pages artifact check failed:\n- ${problems.join('\n- ')}`)
}

console.log('Pages artifact is ready at dist/ (404 fallback included).')
