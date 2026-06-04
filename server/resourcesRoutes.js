/**
 * Admin + public resource downloads API.
 */

function encodeStoragePath(path) {
  return String(path || '')
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
}

function publicObjectUrl(supabaseUrl, bucket, path) {
  const base = String(supabaseUrl || '').replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`
}

export function registerResourcesRoutes(app, { supabase, verifyUser, requireStaff, requireSupabase, supabaseUrl }) {
  app.get('/api/public/resources', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const limit = Math.max(1, Math.min(500, Number(req.query?.limit || 200)))
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Resources error' })
    }
  })

  app.get('/api/admin/resources', verifyUser, requireStaff, async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const limit = Math.max(1, Math.min(500, Number(req.query?.limit || 200)))
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Resources list error' })
    }
  })

  app.post('/api/admin/resources', verifyUser, requireStaff, async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const p = req.body && typeof req.body === 'object' ? req.body : {}
      const bucket = p.bucket ? String(p.bucket).trim() : ''
      const path = p.path ? String(p.path).trim() : ''
      let fileUrl = p.file_url ? String(p.file_url).trim() : ''
      if (!fileUrl && bucket && path) {
        fileUrl = publicObjectUrl(supabaseUrl, bucket, path)
      }
      if (!fileUrl) return res.status(400).json({ error: 'file_url or uploaded file path is required' })
      const { data, error } = await supabase
        .from('resources')
        .insert({
          title: String(p.title || '').trim(),
          description: (p.description || '').trim() || null,
          category: (p.category || '').trim() || null,
          bucket: p.bucket || null,
          path: p.path || null,
          file_url: fileUrl,
          mime_type: p.mime_type || null,
          size_bytes: p.size_bytes || null,
          published: p.published !== false,
        })
        .select('*')
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Create resource error' })
    }
  })

  app.delete('/api/admin/resources/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const id = String(req.params.id || '')
      const { data: row, error: getErr } = await supabase.from('resources').select('*').eq('id', id).single()
      if (getErr) throw getErr
      if (row?.path) await supabase.storage.from(row.bucket || 'public').remove([row.path]).catch(() => {})
      const { error } = await supabase.from('resources').delete().eq('id', id)
      if (error) throw error
      res.json({ ok: true })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Delete resource error' })
    }
  })
}
