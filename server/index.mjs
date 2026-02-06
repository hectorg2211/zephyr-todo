import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleParse, handleBreakDown } from './openai-api.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

// Comma-separated list of origins allowed to call the API (browser CORS). No spaces.
// Browser sends Origin without trailing slash; we normalize so env can have or omit it.
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173,https://zephyr-todo.onrender.com')
    .split(',')
    .map(o => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
)

function setCors(res, req) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res, statusCode, data, req) {
  setCors(res, req)
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = statusCode
  res.end(JSON.stringify(data))
}

function serveStatic(res, pathname) {
  const file = pathname === '/' ? join(DIST, 'index.html') : join(DIST, pathname.slice(1))
  if (!existsSync(file)) return false
  try {
    const content = readFileSync(file)
    const ext = extname(file)
    res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream')
    res.statusCode = 200
    res.end(content)
    return true
  } catch {
    return false
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  const pathname = url.pathname
  const method = req.method ?? ''

  if (pathname === '/api/openai/parse' || pathname === '/api/openai/break-down') {
    if (method === 'OPTIONS') {
      setCors(res, req)
      res.statusCode = 204
      res.end()
      return
    }
    if (method === 'POST' && pathname === '/api/openai/parse') {
      try {
        const raw = await readBody(req)
        const body = raw ? JSON.parse(raw) : {}
        const result = await handleParse(body)
        sendJson(res, 200, result, req)
      } catch (err) {
        sendJson(res, 500, { error: err instanceof Error ? err.message : 'Something went wrong.' }, req)
      }
      return
    }
    if (method === 'POST' && pathname === '/api/openai/break-down') {
      try {
        const raw = await readBody(req)
        const body = raw ? JSON.parse(raw) : {}
        const result = await handleBreakDown(body)
        sendJson(res, 200, result, req)
      } catch (err) {
        sendJson(res, 500, { error: err instanceof Error ? err.message : 'Something went wrong.' }, req)
      }
      return
    }
  }

  if (serveStatic(res, pathname)) return
  if (extname(pathname) === '') {
    if (serveStatic(res, '/index.html')) return
  }
  res.statusCode = 404
  res.end('Not found')
})

const port = Number(process.env.PORT) || 4173
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
