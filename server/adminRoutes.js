/**
 * Admin CMS API — applications, courses, blog, public application submit.
 */

const APPLICATION_STAFF_UPDATABLE = ['status', 'notes', 'rejection_reason']
const APPLICATION_STATUSES = new Set(['submitted', 'waitlist', 'approved', 'rejected'])
const MODULE_STAFF_UPDATABLE = ['title', 'description', 'position', 'content']
const LESSON_STAFF_UPDATABLE = ['title', 'description', 'position', 'content', 'status', 'published_at']
const LESSON_STATUSES = new Set(['draft', 'published'])
const COURSE_STAFF_UPDATABLE = [
  'title',
  'description',
  'instructor',
  'duration',
  'thumbnail_url',
  'category',
  'difficulty',
  'published',
]
const BLOG_STAFF_UPDATABLE = [
  'title',
  'slug',
  'excerpt',
  'body',
  'cover_image_url',
  'tags',
  'published',
  'published_at',
  'seo_title',
  'seo_description',
  'author_id',
  'category_id',
]

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function registerAdminRoutes(app, { supabase, verifyUser, requireStaff, pickFields, requireSupabase }) {
  app.post('/api/public/applications', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const payload = req.body && typeof req.body === 'object' ? req.body : {}
      const row = {
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone || null,
        address: payload.address || null,
        interest_role: payload.interest_role || null,
        message: payload.message || null,
        status: 'submitted',
      }
      const { data, error } = await supabase.from('applications').insert(row).select('id, created_at').single()
      if (error) throw error
      res.json({ ok: true, data })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Application submit error' })
    }
  })

  app.get('/api/public/blog-posts', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const limit = Math.max(1, Math.min(100, Number(req.query?.limit || 20)))
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id,title,slug,body,cover_image_url,tags,published_at,created_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Blog list error' })
    }
  })

  app.get('/api/public/blog-posts/:slug', async (req, res) => {
    try {
      if (!requireSupabase(res)) return
      const slug = String(req.params.slug || '')
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle()
      if (error) throw error
      if (!data) return res.status(404).json({ error: 'Post not found' })
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Blog post error' })
    }
  })

  app.get('/api/admin/summary', verifyUser, requireStaff, async (_req, res) => {
    try {
      const [
        { count: content_blocks, error: cErr },
        { count: media_assets, error: mErr },
        { count: blog_posts, error: bErr },
        { count: courses, error: coErr },
        { count: applications_pending, error: aErr },
      ] = await Promise.all([
        supabase.from('site_content').select('key', { count: 'exact', head: true }),
        supabase.from('media_assets').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
      ])
      if (cErr) throw cErr
      if (mErr) throw mErr
      if (bErr && !bErr.message?.includes('blog_posts')) throw bErr
      if (coErr) throw coErr
      if (aErr) throw aErr
      res.json({
        content_blocks: content_blocks || 0,
        media_assets: media_assets || 0,
        blog_posts: blog_posts || 0,
        courses: courses || 0,
        applications_pending: applications_pending || 0,
      })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Summary error' })
    }
  })

  app.get('/api/admin/applications', verifyUser, requireStaff, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Applications list error' })
    }
  })

  app.put('/api/admin/applications/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const patch = pickFields(req.body, APPLICATION_STAFF_UPDATABLE)
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields provided' })
      }
      if (patch.status !== undefined && !APPLICATION_STATUSES.has(String(patch.status))) {
        return res.status(400).json({ error: `Invalid status: ${patch.status}` })
      }
      patch.reviewed_by = req.user.id
      patch.reviewed_at = new Date().toISOString()
      const { data, error } = await supabase.from('applications').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Update application error' })
    }
  })

  app.get('/api/admin/courses', verifyUser, requireStaff, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Courses list error' })
    }
  })

  app.post('/api/admin/courses', verifyUser, requireStaff, async (req, res) => {
    try {
      const title = String(req.body?.title || '').trim()
      if (!title) return res.status(400).json({ error: 'Title is required' })
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title,
          description: req.body?.description || null,
          published: !!req.body?.published,
        })
        .select('*')
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Create course error' })
    }
  })

  app.put('/api/admin/courses/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const patch = pickFields(req.body, COURSE_STAFF_UPDATABLE)
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields provided' })
      }
      const { data, error } = await supabase.from('courses').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Update course error' })
    }
  })

  app.delete('/api/admin/courses/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
      res.json({ ok: true })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Delete course error' })
    }
  })

  app.get('/api/admin/courses/:courseId/modules', verifyUser, requireStaff, async (req, res) => {
    try {
      const courseId = String(req.params.courseId || '')
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true })
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'List modules error' })
    }
  })

  app.post('/api/admin/courses/:courseId/modules', verifyUser, requireStaff, async (req, res) => {
    try {
      const courseId = String(req.params.courseId || '')
      const { count, error: countErr } = await supabase
        .from('modules')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId)
      if (countErr) throw countErr
      const position = (count || 0) + 1
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: req.body?.title || 'New module',
          description: req.body?.description || null,
          position,
        })
        .select('*')
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Create module error' })
    }
  })

  app.put('/api/admin/modules/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const patch = pickFields(req.body, MODULE_STAFF_UPDATABLE)
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields provided' })
      }
      const { data, error } = await supabase.from('modules').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Update module error' })
    }
  })

  app.delete('/api/admin/modules/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { error } = await supabase.from('modules').delete().eq('id', id)
      if (error) throw error
      res.json({ ok: true })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Delete module error' })
    }
  })

  app.get('/api/admin/modules/:moduleId/lessons', verifyUser, requireStaff, async (req, res) => {
    try {
      const moduleId = String(req.params.moduleId || '')
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('position', { ascending: true })
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'List lessons error' })
    }
  })

  app.post('/api/admin/modules/:moduleId/lessons', verifyUser, requireStaff, async (req, res) => {
    try {
      const moduleId = String(req.params.moduleId || '')
      const { count, error: countErr } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('module_id', moduleId)
      if (countErr) throw countErr
      const position = (count || 0) + 1
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          module_id: moduleId,
          title: req.body?.title || 'New lesson',
          description: req.body?.description || null,
          position,
          status: 'draft',
        })
        .select('*')
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Create lesson error' })
    }
  })

  app.put('/api/admin/lessons/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const patch = pickFields(req.body, LESSON_STAFF_UPDATABLE)
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields provided' })
      }
      if (patch.status !== undefined && !LESSON_STATUSES.has(String(patch.status))) {
        return res.status(400).json({ error: `Invalid status: ${patch.status}` })
      }
      if (patch.status === 'published' && !patch.published_at) {
        patch.published_at = new Date().toISOString()
      }
      const { data, error } = await supabase.from('lessons').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Update lesson error' })
    }
  })

  app.delete('/api/admin/lessons/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { error } = await supabase.from('lessons').delete().eq('id', id)
      if (error) throw error
      res.json({ ok: true })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Delete lesson error' })
    }
  })

  app.get('/api/admin/blog-posts', verifyUser, requireStaff, async (_req, res) => {
    try {
      const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Blog list error' })
    }
  })

  app.post('/api/admin/blog-posts', verifyUser, requireStaff, async (req, res) => {
    try {
      const title = String(req.body?.title || '').trim()
      if (!title) return res.status(400).json({ error: 'Title is required' })
      const slug = slugify(req.body?.slug || title)
      const published = !!req.body?.published
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title,
          slug,
          body: req.body?.body || '',
          cover_image_url: req.body?.cover_image_url || null,
          tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
          published,
          published_at: published ? new Date().toISOString() : null,
          author_id: req.user.id,
        })
        .select('*')
        .single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Create blog post error' })
    }
  })

  app.put('/api/admin/blog-posts/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const patch = pickFields(req.body, BLOG_STAFF_UPDATABLE)
      if (patch.slug !== undefined) patch.slug = slugify(patch.slug)
      if (patch.published === true && !patch.published_at) {
        patch.published_at = new Date().toISOString()
      }
      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields provided' })
      }
      patch.updated_at = new Date().toISOString()
      const { data, error } = await supabase.from('blog_posts').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Update blog post error' })
    }
  })

  app.delete('/api/admin/blog-posts/:id', verifyUser, requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
      res.json({ ok: true })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Delete blog post error' })
    }
  })
}
