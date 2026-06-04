import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const API_MAX_RESTARTS = 8

let apiRestarts = 0
let shuttingDown = false
const children = []

function run(command, args, label) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  child.on('exit', (code, signal) => {
    if (shuttingDown || signal) return
    if (code && code !== 0) {
      // eslint-disable-next-line no-console
      console.error(`[dev:all] ${label} exited with code ${code}`)
      if (label === 'API' && apiRestarts < API_MAX_RESTARTS) {
        apiRestarts += 1
        // eslint-disable-next-line no-console
        console.warn(`[dev:all] Restarting API (${apiRestarts}/${API_MAX_RESTARTS})…`)
        children[0] = startApi()
        return
      }
      shutdown(code)
    }
  })
  return child
}

function startApi() {
  return run('node', ['server/index.js'], 'API')
}

function startVite() {
  return run('npm', ['run', 'dev'], 'Vite')
}

children.push(startApi(), startVite())

function shutdown(code = 0) {
  shuttingDown = true
  for (const child of children) {
    if (child && !child.killed) child.kill('SIGTERM')
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

// eslint-disable-next-line no-console
console.log('[dev:all] API on http://localhost:3000 · Vite on http://localhost:5173')
