import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  DashboardAlert,
  DashboardNotice,
  DashboardPage,
  DashboardPageIntro,
  DashboardPanel,
  DashboardSkeleton,
} from '../../components/dashboard/DashboardChrome'
import { ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY } from '../../components/dashboard/DashboardChrome'
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  listLessons,
  listModules,
  updateLesson,
  updateModule,
} from '../../services/adminCourses'

export function AdminCourseEditorPage() {
  const { courseId } = useParams()
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState([])
  const [lessonsByModule, setLessonsByModule] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const mods = await listModules(courseId)
      setModules(mods)
      const map = {}
      for (const m of mods) {
        map[m.id] = await listLessons(m.id)
      }
      setLessonsByModule(map)
    } catch (err) {
      setError(err?.message || 'Unable to load course structure.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) load()
  }, [courseId])

  if (loading) {
    return (
      <DashboardPage>
        <DashboardSkeleton className="h-8 w-48" />
        <DashboardSkeleton className="h-64" />
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardPageIntro
        label="Course editor"
        title="Modules & lessons"
        description="Organize lesson content for this course."
        actions={
          <Link to="/admin/courses" className={ADMIN_BTN_SECONDARY}>
            ← All courses
          </Link>
        }
      />
      {error ? <DashboardAlert message={error} /> : null}
      <DashboardNotice message={notice} />

      <DashboardPanel className="mb-4">
        <button
          type="button"
          className={ADMIN_BTN_PRIMARY}
          onClick={async () => {
            await createModule(courseId, { title: 'New module' })
            setNotice('Module added.')
            await load()
          }}
        >
          Add module
        </button>
      </DashboardPanel>

      <div className="space-y-6">
        {modules.map((mod) => (
          <DashboardPanel key={mod.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <input
                defaultValue={mod.title}
                className={ADMIN_INPUT_CLASS}
                onBlur={async (e) => {
                  if (e.target.value === mod.title) return
                  await updateModule(mod.id, { title: e.target.value })
                  setNotice('Module saved.')
                }}
              />
              <button
                type="button"
                className="text-sm font-semibold text-rose-600"
                onClick={async () => {
                  if (!window.confirm('Delete module and its lessons?')) return
                  await deleteModule(mod.id)
                  await load()
                }}
              >
                Delete module
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {(lessonsByModule[mod.id] || []).map((lesson) => (
                <li key={lesson.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <input
                    defaultValue={lesson.title}
                    className={`mb-2 ${ADMIN_INPUT_CLASS}`}
                    onBlur={async (e) => {
                      if (e.target.value === lesson.title) return
                      await updateLesson(lesson.id, { title: e.target.value })
                    }}
                  />
                  <textarea
                    defaultValue={lesson.description || ''}
                    placeholder="Lesson description / video URL notes"
                    className={`min-h-20 ${ADMIN_TEXTAREA_CLASS}`}
                    onBlur={async (e) => {
                      await updateLesson(lesson.id, { description: e.target.value })
                    }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={ADMIN_BTN_SECONDARY}
                      onClick={async () => {
                        await updateLesson(lesson.id, {
                          status: lesson.status === 'published' ? 'draft' : 'published',
                        })
                        setNotice('Lesson status updated.')
                        await load()
                      }}
                    >
                      {lesson.status === 'published' ? 'Unpublish lesson' : 'Publish lesson'}
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-rose-600"
                      onClick={async () => {
                        await deleteLesson(lesson.id)
                        await load()
                      }}
                    >
                      Delete lesson
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-4 ${ADMIN_BTN_SECONDARY}`}
              onClick={async () => {
                await createLesson(mod.id, { title: 'New lesson' })
                await load()
              }}
            >
              Add lesson
            </button>
          </DashboardPanel>
        ))}
      </div>
    </DashboardPage>
  )
}
