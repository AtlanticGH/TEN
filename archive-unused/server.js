import express from 'express'
import cors from 'cors'

import inviteApplicant from '../api/inviteApplicant.js'
import approveApplication from '../api/applications/approve.js'
import rejectApplication from '../api/applications/reject.js'
import markComplete from '../api/progress/mark-complete.js'
import markIncomplete from '../api/progress/mark-incomplete.js'

const app = express()

const PORT = Number(process.env.PORT || '3000')

const frontendOrigin =
  (process.env.FRONTEND_ORIGIN || process.env.SITE_URL || '')
    .trim()
    .replace(/\/$/, '') || null

app.set('trust proxy', true)

app.use(
  cors({
    origin: frontendOrigin
      ? [frontendOrigin]
      : process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['content-type', 'authorization'],
  }),
)

app.use(express.json({ limit: '1mb' }))

app.get('/healthz', (_req, res) => res.status(200).send('ok'))

app.post('/api/inviteApplicant', (req, res) => inviteApplicant(req, res))
app.post('/api/applications/approve', (req, res) => approveApplication(req, res))
app.post('/api/applications/reject', (req, res) => rejectApplication(req, res))
app.post('/api/progress/mark-complete', (req, res) => markComplete(req, res))
app.post('/api/progress/mark-incomplete', (req, res) => markIncomplete(req, res))

app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Not found: ${req.method} ${req.path}` })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on :${PORT}`)
})

