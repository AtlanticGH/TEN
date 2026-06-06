import { spawn } from 'node:child_process'
import net from 'node:net'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const API_MAX_RESTARTS = 8

let apiRestarts = 0
let shuttingDown = false
const children = []

function canBindPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '0.0.0.0')
  })
}

async function pickPort(preferred, fallbacks = []) {
  for (const port of [preferred, ...fallbacks]) {
    if (await canBindPort(port)) return port
  }
  throw new Error(`No free port found (tried ${[preferred, ...fallbacks].join(', ')})`)
}

async function waitForApi(port, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/healthz`, {
        headers: { Accept: 'application/json' },
      })
      const text = await res.text()
      if (res.ok && text.trim() === 'ok') return
    } catch {
      // API still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`TEN API did not start on port ${port} within ${timeoutMs / 1000}s`)
}

let apiPort = 3000
let vitePort = 5173

function run(command, args, label, env = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  })
  child.on('exit', (code, signal) => {
    if (shuttingDown || signal) return
    if (label === 'API') {
      if (code === 0) return
      if (apiRestarts < API_MAX_RESTARTS) {
        apiRestarts += 1
        // eslint-disable-next-line no-console
        console.warn(
          `[dev:all] API stopped (code ${code ?? 'unknown'}). Restarting (${apiRestarts}/${API_MAX_RESTARTS})…`,
        )
        children[0] = startApi()
        return
      }
      // eslint-disable-next-line no-console
      console.error('[dev:all] API failed to stay running. Stop dev:all (Ctrl+C) and start again.')
      return
    }
    if (code && code !== 0) {
      // eslint-disable-next-line no-console
      console.error(`[dev:all] ${label} exited with code ${code}`)
      shutdown(code)
    }
  })
  return child
}

function startApi() {
  return run('node', ['server/index.js'], 'API', { PORT: String(apiPort) })
}

function startVite() {
  return run('npm', ['run', 'dev:vite', '--', '--port', String(vitePort), '--strictPort'], 'Vite', {
    DEV_API_PORT: String(apiPort),
  })
}

// Prefer dedicated TEN ports to avoid clashing with other local apps on 5173/3000.
apiPort = await pickPort(3090, [3091, 3092, 3001, 3002, 3000])
vitePort = await pickPort(5190, [5191, 5192, 5193, 5174, 5175])

if (apiPort !== 3090 || vitePort !== 5190) {
  // eslint-disable-next-line no-console
  console.warn(
    `[dev:all] Using API :${apiPort} and Vite :${vitePort} (5190/3090 preferred for TEN).`,
  )
}

const siteUrl = `http://localhost:${vitePort}`
writeFileSync(join(root, '.ten-dev-url'), `${siteUrl}\n`, 'utf8')

// eslint-disable-next-line no-console
console.log(`\n[dev:all] Starting TEN API on http://localhost:${apiPort} …`)
children.push(startApi())

try {
  await waitForApi(apiPort)
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(`[dev:all] ${err.message}`)
  shutdown(1)
}

// eslint-disable-next-line no-console
console.log(`[dev:all] API ready. Starting Vite on ${siteUrl} …\n`)
children.push(startVite())

// eslint-disable-next-line no-console
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
// eslint-disable-next-line no-console
console.log(`  TEN site:  ${siteUrl}`)
// eslint-disable-next-line no-console
console.log(`  TEN admin: ${siteUrl}/admin`)
// eslint-disable-next-line no-console
console.log(`  TEN API:   http://localhost:${apiPort}/api/healthz`)
// eslint-disable-next-line no-console
console.log('  Open only the TEN URL above — not another project on :5173.')
// eslint-disable-next-line no-console
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

function shutdown(code = 0) {
  shuttingDown = true
  for (const child of children) {
    if (child && !child.killed) child.kill('SIGTERM')
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
