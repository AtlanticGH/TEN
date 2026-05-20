import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(command, args, label) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  child.on('exit', (code, signal) => {
    if (signal) return
    if (code && code !== 0) {
      // eslint-disable-next-line no-console
      console.error(`[dev:all] ${label} exited with code ${code}`)
      shutdown(code)
    }
  })
  return child
}

const children = [
  run('node', ['server/index.js'], 'API'),
  run('npm', ['run', 'dev'], 'Vite'),
]

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
