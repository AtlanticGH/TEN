/**
 * Optional starter course for local/staging (idempotent by title).
 * Run: npm run bootstrap:sample
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: ['.env', '.env.local'], override: true })

const SAMPLE_TITLE = 'Getting Started with TEN'

const url = process.env.SUPABASE_URL?.trim()
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: existing } = await supabase
  .from('courses')
  .select('id, title, published')
  .eq('title', SAMPLE_TITLE)
  .maybeSingle()

let courseId = existing?.id

if (!courseId) {
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .insert({
      title: SAMPLE_TITLE,
      description:
        'A short introduction to The Ember Network platform. Use this course to verify publishing, modules, and member access.',
      instructor: 'Ember Network Team',
      duration: '15 min',
      category: 'Onboarding',
      difficulty: 'beginner',
      published: true,
    })
    .select('id')
    .single()
  if (courseErr) {
    console.error('Course insert failed:', courseErr.message)
    process.exit(1)
  }
  courseId = course.id
  console.log(`Created course: ${SAMPLE_TITLE}`)
} else {
  if (!existing.published) {
    await supabase.from('courses').update({ published: true }).eq('id', courseId)
  }
  console.log(`Course already exists: ${SAMPLE_TITLE}`)
}

const { data: modExisting } = await supabase
  .from('modules')
  .select('id')
  .eq('course_id', courseId)
  .eq('position', 1)
  .maybeSingle()

let moduleId = modExisting?.id
if (!moduleId) {
  const { data: mod, error: modErr } = await supabase
    .from('modules')
    .insert({
      course_id: courseId,
      title: 'Welcome',
      description: 'Your first module on TEN.',
      position: 1,
    })
    .select('id')
    .single()
  if (modErr) {
    console.error('Module insert failed:', modErr.message)
    process.exit(1)
  }
  moduleId = mod.id
  console.log('Created module: Welcome')
}

const { data: lessonExisting } = await supabase
  .from('lessons')
  .select('id')
  .eq('module_id', moduleId)
  .eq('position', 1)
  .maybeSingle()

if (!lessonExisting?.id) {
  const { error: lessonErr } = await supabase.from('lessons').insert({
    module_id: moduleId,
    title: 'What is The Ember Network?',
    description: 'Overview of the community and how to use the learning platform.',
    position: 1,
    status: 'published',
    published_at: new Date().toISOString(),
  })
  if (lessonErr) {
    console.error('Lesson insert failed:', lessonErr.message)
    process.exit(1)
  }
  console.log('Created lesson: What is The Ember Network?')
} else {
  console.log('Lesson already exists for module Welcome')
}

console.log(`Done. Course id: ${courseId}`)
console.log('Admin: http://localhost:5173/admin/courses')
