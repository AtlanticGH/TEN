/**
 * Smoke-test a deployed TEN instance (default: Vercel production URL).
 * Run: npm run verify:prod
 * Optional: PRODUCTION_URL=https://your-app.vercel.app npm run verify:prod
 */
const base = (process.env.PRODUCTION_URL || 'https://ember-network-qc25.vercel.app').replace(/\/$/, '')

const checks = [
  { name: 'SPA home', path: '/', expectStatus: 200, expectBody: (t) => t.includes('The Ember Network') },
  { name: 'API healthz', path: '/api/healthz', expectStatus: 200, expectBody: (t) => t.trim() === 'ok' },
  {
    name: 'API public resources',
    path: '/api/public/resources?limit=1',
    expectStatus: 200,
    expectBody: (t) => {
      try {
        const j = JSON.parse(t)
        return Array.isArray(j)
      } catch {
        return false
      }
    },
    hintOn500: 'Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel and redeploy.',
  },
  {
    name: 'CMS home hero',
    path: '/api/public/site-content/home.hero.v1',
    expectStatus: 200,
    expectBody: (t) => {
      try {
        const j = JSON.parse(t)
        return j?.key === 'home.hero.v1' || j?.value != null
      } catch {
        return false
      }
    },
  },
]

let ok = true

console.log(`\nProduction verify: ${base}\n`)

for (const c of checks) {
  const url = `${base}${c.path}`
  try {
    const res = await fetch(url)
    const text = await res.text()
    const bodyOk = c.expectBody(text)
    if (res.status === c.expectStatus && bodyOk) {
      console.log(`✓ ${c.name}`)
    } else {
      console.log(`✗ ${c.name} — HTTP ${res.status}`)
      if (res.status === 500 && c.hintOn500) console.log(`  → ${c.hintOn500}`)
      else if (!bodyOk && text.length < 200) console.log(`  → ${text}`)
      ok = false
    }
  } catch (err) {
    console.log(`✗ ${c.name} — ${err?.message || err}`)
    ok = false
  }
}

console.log(ok ? '\nAll production checks passed.\n' : '\nSome checks failed.\n')
process.exit(ok ? 0 : 1)
