function isMentorRole(role) {
  return String(role || '') === 'mentor'
}

export function registerMentorRoutes(app, { supabase, verifyUser, getMyProfileRow, pickFields }) {
  async function requireMentor(req, res, next) {
    try {
      if (!supabase) return res.status(500).json({ error: 'Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
      const actor = await getMyProfileRow(req.user.id, req.user)
      if (!actor || actor.status !== 'active' || !isMentorRole(actor.role)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      req.actorProfile = actor
      next()
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Mentor auth error' })
    }
  }

  async function isMenteeOf(mentorUserId, studentUserId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('mentor_user_id')
      .eq('user_id', studentUserId)
      .maybeSingle()
    if (error) throw error
    return data?.mentor_user_id === mentorUserId
  }

  const COURSE_FIELDS = ['title', 'description', 'instructor', 'duration', 'thumbnail_url', 'category', 'difficulty', 'published']

  app.get('/api/mentor/summary', verifyUser, requireMentor, async (req, res) => {
    try {
      const mentorId = req.user.id
      const [{ count: mentees, error: mErr }, { count: myCourses, error: cErr }, { data: menteeRows, error: pErr }] =
        await Promise.all([
          supabase.from('profiles').select('user_id', { count: 'exact', head: true }).eq('mentor_user_id', mentorId),
          supabase.from('courses').select('id', { count: 'exact', head: true }).eq('created_by', mentorId),
          supabase.from('profiles').select('user_id').eq('mentor_user_id', mentorId),
        ])
      if (mErr) throw mErr
      if (cErr) throw cErr
      if (pErr) throw pErr

      const menteeIds = (menteeRows || []).map((r) => r.user_id).filter(Boolean)
      let pendingReviews = 0
      if (menteeIds.length) {
        const { count, error: sErr } = await supabase
          .from('assignment_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'submitted')
          .in('user_id', menteeIds)
        if (sErr) throw sErr
        pendingReviews = count || 0
      }

      res.json({
        mentees: mentees || 0,
        my_courses: myCourses || 0,
        pending_reviews: pendingReviews,
      })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Mentor summary error' })
    }
  })

  app.get('/api/mentor/students', verifyUser, requireMentor, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role, status, joined_at, goals')
        .eq('mentor_user_id', req.user.id)
        .order('joined_at', { ascending: false })
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Mentor students error' })
    }
  })

  app.get('/api/mentor/students/:userId/progress', verifyUser, requireMentor, async (req, res) => {
    try {
      const userId = String(req.params.userId || '')
      if (!(await isMenteeOf(req.user.id, userId))) {
        return res.status(403).json({ error: 'Not your mentee' })
      }

      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, role, status, joined_at, goals')
        .eq('user_id', userId)
        .single()
      if (pErr) throw pErr

      const [
        { data: enrollments, error: eErr },
        { data: courseCompletions, error: ccErr },
        { data: lessonCompletions, error: lcErr },
        { data: submissions, error: sErr },
      ] = await Promise.all([
        supabase.from('enrollments').select('*').eq('user_id', userId).order('enrolled_at', { ascending: false }),
        supabase.from('course_completions').select('*').eq('user_id', userId),
        supabase.from('lesson_completions').select('*').eq('user_id', userId),
        supabase.from('assignment_submissions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      ])
      if (eErr) throw eErr
      if (ccErr) throw ccErr
      if (lcErr) throw lcErr
      if (sErr) throw sErr

      const courseIds = Array.from(new Set((enrollments || []).map((x) => x.course_id))).filter(Boolean)
      let courses = []
      if (courseIds.length) {
        const { data: cs, error: cErr } = await supabase.from('courses').select('id, title, published').in('id', courseIds)
        if (cErr) throw cErr
        courses = cs || []
      }

      res.json({
        profile,
        enrollments: enrollments || [],
        courses,
        course_completions: courseCompletions || [],
        lesson_completions: lessonCompletions || [],
        assignment_submissions: submissions || [],
      })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Mentee progress error' })
    }
  })

  app.get('/api/mentor/courses', verifyUser, requireMentor, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('created_by', req.user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      res.json(data || [])
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Mentor courses error' })
    }
  })

  app.post('/api/mentor/courses', verifyUser, requireMentor, async (req, res) => {
    try {
      const p = pickFields(req.body, COURSE_FIELDS)
      if (!String(p.title || '').trim()) return res.status(400).json({ error: 'Title is required' })
      const row = {
        ...p,
        title: String(p.title).trim(),
        description: (p.description || '').trim() || null,
        instructor: (p.instructor || '').trim() || null,
        duration: (p.duration || '').trim() || null,
        category: (p.category || '').trim() || null,
        published: !!p.published,
        created_by: req.user.id,
      }
      const { data, error } = await supabase.from('courses').insert(row).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Create course error' })
    }
  })

  app.put('/api/mentor/courses/:id', verifyUser, requireMentor, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { data: existing, error: getErr } = await supabase.from('courses').select('created_by').eq('id', id).single()
      if (getErr) throw getErr
      if (existing?.created_by !== req.user.id) return res.status(403).json({ error: 'You can only edit your own courses' })

      const p = pickFields(req.body, COURSE_FIELDS)
      if (p.title != null) p.title = String(p.title).trim()
      const { data, error } = await supabase.from('courses').update(p).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Update course error' })
    }
  })

  app.get('/api/mentor/submissions', verifyUser, requireMentor, async (req, res) => {
    try {
      const status = String(req.query?.status || 'submitted')
      const { data: mentees, error: mErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .eq('mentor_user_id', req.user.id)
      if (mErr) throw mErr
      const menteeIds = (mentees || []).map((m) => m.user_id).filter(Boolean)
      if (!menteeIds.length) return res.json([])

      let q = supabase
        .from('assignment_submissions')
        .select('*')
        .in('user_id', menteeIds)
        .order('updated_at', { ascending: false })
      if (status && status !== 'all') q = q.eq('status', status)

      const { data: subs, error: sErr } = await q
      if (sErr) throw sErr

      const assignmentIds = Array.from(new Set((subs || []).map((s) => s.assignment_id))).filter(Boolean)
      let assignmentMap = {}
      if (assignmentIds.length) {
        const { data: assignments, error: aErr } = await supabase
          .from('assignments')
          .select('id, title, lesson_id')
          .in('id', assignmentIds)
        if (aErr) throw aErr
        ;(assignments || []).forEach((a) => {
          assignmentMap[a.id] = a
        })
      }

      const menteeMap = {}
      ;(mentees || []).forEach((m) => {
        menteeMap[m.user_id] = m
      })

      const rows = (subs || []).map((s) => ({
        ...s,
        student: menteeMap[s.user_id] || null,
        assignment: assignmentMap[s.assignment_id] || null,
      }))
      res.json(rows)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Mentor submissions error' })
    }
  })

  app.put('/api/mentor/submissions/:id', verifyUser, requireMentor, async (req, res) => {
    try {
      const id = String(req.params.id || '')
      const { data: row, error: getErr } = await supabase.from('assignment_submissions').select('*').eq('id', id).single()
      if (getErr) throw getErr
      if (!(await isMenteeOf(req.user.id, row.user_id))) {
        return res.status(403).json({ error: 'Not your mentee' })
      }

      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const status = String(body.status || row.status || 'submitted')
      if (!['submitted', 'approved', 'needs_revision'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
      }

      const patch = {
        status,
        grade: body.grade != null ? String(body.grade).trim() || null : row.grade,
        mentor_feedback: body.mentor_feedback != null ? String(body.mentor_feedback).trim() || null : row.mentor_feedback,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from('assignment_submissions').update(patch).eq('id', id).select('*').single()
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Review submission error' })
    }
  })

  // Student: submit / view own work
  app.get('/api/assignments/:assignmentId/my-submission', verifyUser, async (req, res) => {
    try {
      const assignmentId = String(req.params.assignmentId || '')
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('user_id', req.user.id)
        .maybeSingle()
      if (error) throw error
      res.json(data || null)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Submission fetch error' })
    }
  })

  app.post('/api/assignments/:assignmentId/submit', verifyUser, async (req, res) => {
    try {
      const assignmentId = String(req.params.assignmentId || '')
      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const notes = String(body.notes || '').trim() || null
      const link_url = String(body.link_url || '').trim() || null
      if (!notes && !link_url) return res.status(400).json({ error: 'Add notes or a link to your work.' })

      const { data: existing } = await supabase
        .from('assignment_submissions')
        .select('id, status')
        .eq('assignment_id', assignmentId)
        .eq('user_id', req.user.id)
        .maybeSingle()

      if (existing?.status === 'approved') {
        return res.status(400).json({ error: 'This assignment is already approved.' })
      }

      const row = {
        assignment_id: assignmentId,
        user_id: req.user.id,
        status: 'submitted',
        notes,
        link_url,
        mentor_feedback: null,
        grade: null,
        reviewed_by: null,
        reviewed_at: null,
      }

      let data
      let error
      if (existing?.id) {
        ;({ data, error } = await supabase
          .from('assignment_submissions')
          .update(row)
          .eq('id', existing.id)
          .select('*')
          .single())
      } else {
        ;({ data, error } = await supabase.from('assignment_submissions').insert(row).select('*').single())
      }
      if (error) throw error
      res.json(data)
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Submit assignment error' })
    }
  })
}
