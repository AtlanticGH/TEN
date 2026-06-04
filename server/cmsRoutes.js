/**
 * CMS v2 API — pages, blocks, settings, navigation, users, blog taxonomy.
 */

const PAGE_STAFF_FIELDS = [
  'title',
  'slug',
  'status',
  'layout_mode',
  'sort_order',
  'featured_image_url',
  'seo_title',
  'seo_description',
  'og_title',
  'og_description',
  'og_image_url',
  'canonical_url',
  'robots',
]
const BLOCK_STAFF_FIELDS = ['block_type', 'content', 'sort_order', 'enabled']
const NAV_ITEM_FIELDS = ['label', 'href', 'external', 'sort_order', 'enabled', 'parent_id']
const PROFILE_ADMIN_FIELDS = ['full_name', 'role', 'status', 'username']
const PROFILE_ROLES = new Set(['super_admin', 'admin', 'editor', 'viewer', 'staff'])

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function logActivity(supabase, { userId, action, entityType, entityId, meta }) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId ? String(entityId) : null,
      meta: meta || {},
    })
  } catch {
    /* non-fatal */
  }
}

async function requireAdmin(req, res, next) {
  try {
    const actor = req.actorProfile
    if (!actor || !['admin', 'super_admin'].includes(actor.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Auth error' })
  }
}

export function registerCmsRoutes(app, deps) {
  const { supabase, verifyUser, requireStaff, pickFields, requireSupabase, getMyProfileRow } = deps

  // -------------------------------------------------------------------------
  // Public CMS reads
  // -------------------------------------------------------------------------

  app.get('/api/public/cms/settings', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const key = String(req.query?.key || 'global.v1')
      const { data: row, error } = await supabase.from('site_settings').select('key,value,updated_at').eq('key', key).maybeSingle()
      if (error) throw error
      if (row) return res.json(row)
      const { data: legacy, error: lErr } = await supabase.from('site_content').select('key,value,updated_at').eq('key', key).maybeSingle()
      if (lErr) throw lErr
      res.json(legacy || null)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Settings error' })
    }
  })

  app.get('/api/public/cms/navigation/:key', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const key = String(req.params.key || 'main')
      const { data: nav, error: nErr } = await supabase.from('navigation').select('id,key,label').eq('key', key).maybeSingle()
      if (nErr) throw nErr
      if (!nav) return res.json({ key, label: key, items: [] })
      const { data: items, error: iErr } = await supabase
        .from('navigation_items')
        .select('id,label,href,external,sort_order,parent_id')
        .eq('navigation_id', nav.id)
        .eq('enabled', true)
        .order('sort_order')
      if (iErr) throw iErr
      res.json({ ...nav, items: items || [] })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Navigation error' })
    }
  })

  app.get('/api/public/cms/pages/:slug', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const slug = String(req.params.slug || '')
      const { data: page, error: pErr } = await supabase.from('pages').select('*').eq('slug', slug).eq('status', 'published').maybeSingle()
      if (pErr) throw pErr
      if (!page) return res.status(404).json({ error: 'Page not found' })
      const { data: blocks, error: bErr } = await supabase
        .from('page_blocks')
        .select('id,block_type,content,sort_order')
        .eq('page_id', page.id)
        .eq('enabled', true)
        .order('sort_order')
      if (bErr) throw bErr
      res.json({ page, blocks: blocks || [] })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Page error' })
    }
  })

  app.get('/api/public/cms/pages', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const { data, error } = await supabase
        .from('pages')
        .select('id,slug,title,seo_title,seo_description,featured_image_url,sort_order')
        .eq('status', 'published')
        .order('sort_order')
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Pages list error' })
    }
  })

  // -------------------------------------------------------------------------
  // Admin — site settings
  // -------------------------------------------------------------------------

  app.get('/api/admin/site-settings', verifyUser, requireStaff, async (req, res) => {
    try {
      const key = String(req.query?.key || 'global.v1')
      const { data, error } = await supabase.from('site_settings').select('*').eq('key', key).maybeSingle()
      if (error) throw error
      res.json(data || { key, value: {} })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Settings read error' })
    }
  })

  app.put('/api/admin/site-settings', verifyUser, requireStaff, async (req, res) => {
    try {
      const payload = req.body && typeof req.body === 'object' ? req.body : {}
      const key = String(payload.key || 'global.v1')
      const row = { key, value: payload.value ?? {}, updated_by: req.user.id }
      const { data, error } = await supabase.from('site_settings').upsert(row, { onConflict: 'key' }).select('*').single()
      if (error) throw error
      await logActivity(supabase, { userId: req.user.id, action: 'site_settings.update', entityType: 'site_settings', entityId: key })
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Settings update error' })
    }
  })

  // -------------------------------------------------------------------------
  // Admin — pages & blocks
  // -------------------------------------------------------------------------

  app.get('/api/admin/pages', verifyUser, requireStaff, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('pages').select('*').order('sort_order')
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Pages list error' })
    }
  })

  app.post('/api/admin/pages', verifyUser, requireStaff, async (req, res) => {
    try {
      const payload = req.body && typeof req.body === 'object' ? req.body : {}
      const slug = slugify(payload.slug || payload.title)
      if (!slug) return res.status(400).json({ error: 'Slug is required' })
      const row = {
        ...pickFields(payload, PAGE_STAFF_FIELDS),
        slug,
        updated_by: req.user.id,
      }
      if (!row.title) row.title = slug
      const { data, error } = await supabase.from('pages').insert(row).select('*').single()
      if (error) throw error
      await logActivity(supabase, { userId: req.user.id, action: 'page.create', entityType: 'page', entityId: data.id })
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Page create error' })
    }
  })

  app.put('/api/admin/pages/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const patch = pickFields(req.body, PAGE_STAFF_FIELDS)
      if (patch.slug) patch.slug = slugify(patch.slug)
      patch.updated_by = req.user.id
      const { data, error } = await supabase.from('pages').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      await logActivity(supabase, { userId: req.user.id, action: 'page.update', entityType: 'page', entityId: id })
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Page update error' })
    }
  })

  app.delete('/api/admin/pages/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { error } = await supabase.from('pages').delete().eq('id', id)
      if (error) throw error
      await logActivity(supabase, { userId: req.user.id, action: 'page.delete', entityType: 'page', entityId: id })
      res.json({ ok: true })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Page delete error' })
    }
  })

  app.post('/api/admin/pages/:id/duplicate', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { data: source, error: srcErr } = await supabase.from('pages').select('*').eq('id', id).single()
      if (srcErr || !source) return res.status(404).json({ error: 'Page not found' })

      const baseSlug = `${source.slug}-copy`
      let slug = baseSlug
      let n = 2
      for (;;) {
        const { data: existing } = await supabase.from('pages').select('id').eq('slug', slug).maybeSingle()
        if (!existing) break
        slug = `${baseSlug}-${n}`
        n += 1
      }

      const row = {
        title: `${source.title} (copy)`,
        slug,
        status: 'draft',
        sort_order: source.sort_order,
        featured_image_url: source.featured_image_url,
        seo_title: source.seo_title,
        seo_description: source.seo_description,
        og_title: source.og_title,
        og_description: source.og_description,
        og_image_url: source.og_image_url,
        canonical_url: source.canonical_url,
        robots: source.robots,
        updated_by: req.user.id,
      }
      const { data: page, error: pageErr } = await supabase.from('pages').insert(row).select('*').single()
      if (pageErr) throw pageErr

      const { data: blocks } = await supabase.from('page_blocks').select('*').eq('page_id', id).order('sort_order')
      if (blocks?.length) {
        const inserts = blocks.map((b) => ({
          page_id: page.id,
          block_type: b.block_type,
          content: b.content,
          sort_order: b.sort_order,
          enabled: b.enabled,
          updated_by: req.user.id,
        }))
        const { error: blocksErr } = await supabase.from('page_blocks').insert(inserts)
        if (blocksErr) throw blocksErr
      }

      await logActivity(supabase, {
        userId: req.user.id,
        action: 'page.duplicate',
        entityType: 'page',
        entityId: page.id,
        meta: { source_id: id },
      })
      res.json(page)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Page duplicate error' })
    }
  })

  app.get('/api/admin/pages/:id/blocks', verifyUser, requireStaff, async (req, res) => {
    try {
      const pageId = String(req.params.id || '')
      const { data, error } = await supabase.from('page_blocks').select('*').eq('page_id', pageId).order('sort_order')
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Blocks list error' })
    }
  })

  const BLOCK_MUTATIONS_DISABLED =
    'Page block editing is disabled. Use Gallery, People, Navigation, or Site settings.'

  app.post('/api/admin/pages/:id/blocks', verifyUser, requireStaff, async (_req, res) => {
    return res.status(403).json({ error: BLOCK_MUTATIONS_DISABLED })
  })

  app.put('/api/admin/page-blocks/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const patch = pickFields(req.body, BLOCK_STAFF_FIELDS)
      if (req.body?.content !== undefined) patch.content = req.body.content
      patch.updated_by = req.user.id
      const { data, error } = await supabase.from('page_blocks').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Block update error' })
    }
  })

  app.delete('/api/admin/page-blocks/:id', verifyUser, requireStaff, async (_req, res) => {
    return res.status(403).json({ error: BLOCK_MUTATIONS_DISABLED })
  })

  app.put('/api/admin/pages/:id/blocks/reorder', verifyUser, requireStaff, async (_req, res) => {
    return res.status(403).json({ error: BLOCK_MUTATIONS_DISABLED })
  })

  app.get('/api/admin/block-types', verifyUser, requireStaff, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('block_types').select('*').order('sort_order')
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Block types error' })
    }
  })

  // -------------------------------------------------------------------------
  // Admin — navigation
  // -------------------------------------------------------------------------

  app.get('/api/admin/navigation/:key', verifyUser, requireStaff, async (req, res) => {
    try {
      const key = String(req.params.key || 'main')
      const { data: nav, error: nErr } = await supabase.from('navigation').select('*').eq('key', key).maybeSingle()
      if (nErr) throw nErr
      if (!nav) return res.json({ key, label: key, items: [] })
      const { data: items, error: iErr } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('navigation_id', nav.id)
        .order('sort_order')
      if (iErr) throw iErr
      res.json({ ...nav, items: items || [] })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Navigation error' })
    }
  })

  app.put('/api/admin/navigation/:key', verifyUser, requireStaff, async (req, res) => {
    try {
      const key = String(req.params.key || 'main')
      const payload = req.body && typeof req.body === 'object' ? req.body : {}
      let { data: nav, error: nErr } = await supabase.from('navigation').select('id').eq('key', key).maybeSingle()
      if (nErr) throw nErr
      if (!nav) {
        const ins = await supabase.from('navigation').insert({ key, label: payload.label || key }).select('id').single()
        if (ins.error) throw ins.error
        nav = ins.data
      }
      const items = Array.isArray(payload.items) ? payload.items : []
      await supabase.from('navigation_items').delete().eq('navigation_id', nav.id)
      if (items.length) {
        const rows = items.map((item, idx) => ({
          navigation_id: nav.id,
          label: item.label,
          href: item.href || '/',
          external: !!item.external,
          sort_order: Number.isFinite(item.sort_order) ? item.sort_order : idx,
          enabled: item.enabled !== false,
          parent_id: item.parent_id || null,
        }))
        const { error: insErr } = await supabase.from('navigation_items').insert(rows)
        if (insErr) throw insErr
      }
      const { data: fresh, error } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('navigation_id', nav.id)
        .order('sort_order')
      if (error) throw error
      res.json({ key, items: fresh || [] })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Navigation update error' })
    }
  })

  // -------------------------------------------------------------------------
  // Admin — users (role management)
  // -------------------------------------------------------------------------

  app.get('/api/admin/users', verifyUser, requireStaff, requireAdmin, async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(200, Number(req.query?.limit || 50)))
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id,full_name,email,username,role,status,joined_at,updated_at')
        .order('joined_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Users list error' })
    }
  })

  app.put('/api/admin/users/:userId', verifyUser, requireStaff, requireAdmin, async (req, res) => {
    try {
      const userId = String(req.params.userId || '')
      const patch = pickFields(req.body, PROFILE_ADMIN_FIELDS)
      if (patch.role && !PROFILE_ROLES.has(patch.role)) {
        return res.status(400).json({ error: 'Invalid role' })
      }
      if (patch.role === 'super_admin' && req.actorProfile?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only super admins can assign super_admin' })
      }
      const { data, error } = await supabase.from('profiles').update(patch).eq('user_id', userId).select('*').single()
      if (error) throw error
      await logActivity(supabase, { userId: req.user.id, action: 'user.update', entityType: 'profile', entityId: userId, meta: { role: patch.role } })
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'User update error' })
    }
  })

  // -------------------------------------------------------------------------
  // Admin — blog taxonomy
  // -------------------------------------------------------------------------

  app.get('/api/admin/blog-categories', verifyUser, requireStaff, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('blog_categories').select('*').order('sort_order')
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Categories error' })
    }
  })

  app.post('/api/admin/blog-categories', verifyUser, requireStaff, async (req, res) => {
    try {
      const payload = req.body || {}
      const slug = slugify(payload.slug || payload.name)
      const { data, error } = await supabase
        .from('blog_categories')
        .insert({ name: payload.name, slug, description: payload.description || null })
        .select('*')
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Category create error' })
    }
  })

  app.get('/api/admin/blog-tags', verifyUser, requireStaff, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('blog_tags').select('*').order('name')
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Tags error' })
    }
  })

  // -------------------------------------------------------------------------
  // Enhanced dashboard summary
  // -------------------------------------------------------------------------

  app.get('/api/admin/cms-summary', verifyUser, requireStaff, async (_req, res) => {
    try {
      const [
        pages,
        blocks,
        media,
        posts,
        apps,
        logs,
      ] = await Promise.all([
        supabase.from('pages').select('id', { count: 'exact', head: true }),
        supabase.from('page_blocks').select('id', { count: 'exact', head: true }),
        supabase.from('media_assets').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }),
      ])
      res.json({
        pages: pages.count ?? 0,
        page_blocks: blocks.count ?? 0,
        media_assets: media.count ?? 0,
        blog_posts: posts.count ?? 0,
        applications_pending: apps.count ?? 0,
        activity_logs: logs.count ?? 0,
      })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Summary error' })
    }
  })

  app.get('/api/admin/activity-logs/recent', verifyUser, requireStaff, async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(100, Number(req.query?.limit || 20)))
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Activity error' })
    }
  })

  void getMyProfileRow
}
