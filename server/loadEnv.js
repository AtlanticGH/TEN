import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Load .env then .env.local from the repo root (not process.cwd()). */
export function loadProjectEnv() {
  // Vercel injects env at runtime — never override platform vars from missing local files.
  if (process.env.VERCEL) return

  dotenv.config({
    path: [join(projectRoot, '.env'), join(projectRoot, '.env.local')],
    override: true,
  })
}

export { projectRoot }
