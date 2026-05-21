import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dialog } from '@/components/ui/Dialog'
import {
  WorkspaceAlert,
  WorkspaceHeader,
  WorkspaceMutedPanel,
  WorkspacePage,
  WorkspacePanel,
  WorkspaceSplit,
} from '@/components/workspace/WorkspaceChrome'
import { listAssignments } from '@/services/assignments'
import { createMentorAssignment, deleteMentorAssignment } from '@/services/mentorAssignments'
import { deleteMentorLessonFile, listLessonFiles, uploadMentorLessonFile } from '@/services/mentorLessonFiles'
import {
  createMentorLesson,
  createMentorModule,
  deleteMentorLesson,
  deleteMentorModule,
  getMentorCourse,
  listMentorCourseModules,
  listMentorModuleLessons,
  publishMentorLesson,
  reorderMentorLessons,
  reorderMentorModules,
  unpublishMentorLesson,
  updateMentorLesson,
  updateMentorModule,
} from '@/services/mentorCourseBuilder'

function IconButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
      {...props}
    >
      {children}
    </button>
  )
}

export function MentorCourseEditorPage() {
  const { courseId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [lessonsByModule, setLessonsByModule] = useState({})
  const [busy, setBusy] = useState('')
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' })
  const [contentLesson, setContentLesson] = useState(null)
  const [sectionsDraft, setSectionsDraft] = useState([])
  const [assignmentLesson, setAssignmentLesson] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', file: null })
  const [filesLesson, setFilesLesson] = useState(null)
  const [files, setFiles] = useState([])
  const [fileTitle, setFileTitle] = useState('')
  const [fileObj, setFileObj] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, ms] = await Promise.all([getMentorCourse(courseId), listMentorCourseModules(courseId)])
      setCourse(c)
      setModules(ms)
      const lessonPairs = await Promise.all(ms.map(async (m) => [m.id, await listMentorModuleLessons(m.id)]))
      const map = {}
      lessonPairs.forEach(([id, ls]) => {
        map[id] = ls
      })
      setLessonsByModule(map)
    } catch (err) {
      setError(err?.message || 'Unable to load course builder.')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [refresh])

  const totalLessons = useMemo(
    () => Object.values(lessonsByModule).reduce((acc, ls) => acc + (ls?.length || 0), 0),
    [lessonsByModule],
  )

  if (loading) return <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
  if (error && !course) return <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
  if (!course) return null

  return (
    <WorkspacePage>
      <WorkspaceHeader
        label="Course builder"
        title={course.title}
        description={`${modules.length} modules • ${totalLessons} lessons • ${course.published ? 'Published' : 'Draft'}. Add modules, lessons, downloadable files, content, and assignments.`}
        actions={
          <Link
            to="/mentor/courses"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200"
          >
            Back to courses
          </Link>
        }
      />

      <WorkspaceAlert message={error} />

      <WorkspaceSplit>
        <WorkspaceMutedPanel>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Add module</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              if (!moduleForm.title.trim()) return
              setBusy('module:create')
              try {
                await createMentorModule({
                  course_id: course.id,
                  title: moduleForm.title.trim(),
                  description: moduleForm.description.trim(),
                })
                setModuleForm({ title: '', description: '' })
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create module.')
              } finally {
                setBusy('')
              }
            }}
          >
            <input
              value={moduleForm.title}
              onChange={(e) => setModuleForm((v) => ({ ...v, title: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              placeholder="Module title"
            />
            <textarea
              value={moduleForm.description}
              onChange={(e) => setModuleForm((v) => ({ ...v, description: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              placeholder="Description (optional)"
            />
            <button
              type="submit"
              disabled={busy === 'module:create'}
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50"
            >
              {busy === 'module:create' ? 'Creating…' : 'Create module'}
            </button>
          </form>
        </WorkspaceMutedPanel>

        <div className="space-y-4">
          {modules.length ? (
            modules.map((m, idx) => (
              <MentorModuleCard
                key={m.id}
                module={m}
                lessons={lessonsByModule[m.id] || []}
                busy={busy}
                onBusy={setBusy}
                onError={setError}
                onRefresh={refresh}
                onEditContent={(lesson) => {
                  setContentLesson(lesson)
                  setSectionsDraft(Array.isArray(lesson?.content?.sections) ? lesson.content.sections : [])
                }}
                onEditAssignments={async (lesson) => {
                  setError('')
                  setAssignmentLesson(lesson)
                  setAssignmentForm({ title: '', description: '', file: null })
                  try {
                    setAssignments(await listAssignments(lesson.id))
                  } catch (err) {
                    setAssignments([])
                    setError(err?.message || 'Unable to load assignments.')
                  }
                }}
                onEditFiles={async (lesson) => {
                  setError('')
                  setFilesLesson(lesson)
                  setFileTitle('')
                  setFileObj(null)
                  try {
                    setFiles(await listLessonFiles(lesson.id))
                  } catch (err) {
                    setFiles([])
                    setError(err?.message || 'Unable to load lesson files.')
                  }
                }}
                onMoveModule={async (dir) => {
                  const next = modules.slice()
                  const j = dir === 'up' ? idx - 1 : idx + 1
                  if (j < 0 || j >= next.length) return
                  ;[next[idx], next[j]] = [next[j], next[idx]]
                  setBusy('modules:reorder')
                  try {
                    await reorderMentorModules(course.id, next.map((x) => x.id))
                    await refresh()
                  } catch (err) {
                    setError(err?.message || 'Unable to reorder modules.')
                  } finally {
                    setBusy('')
                  }
                }}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              No modules yet. Create your first module.
            </p>
          )}
        </div>
      </WorkspaceSplit>

      <Dialog
        open={!!filesLesson}
        onClose={() => setFilesLesson(null)}
        title={filesLesson ? `Downloads: ${filesLesson.title}` : 'Lesson downloads'}
        footer={
          filesLesson ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-zinc-500">
                {files.length} file{files.length === 1 ? '' : 's'} — students can download after the lesson is published.
              </p>
              <button
                type="button"
                disabled={busy === `lesson:files:${filesLesson.id}` || !fileObj}
                onClick={async () => {
                  if (!fileObj) return
                  setBusy(`lesson:files:${filesLesson.id}`)
                  setError('')
                  try {
                    await uploadMentorLessonFile({ lessonId: filesLesson.id, title: fileTitle, file: fileObj })
                    setFiles(await listLessonFiles(filesLesson.id))
                    setFileTitle('')
                    setFileObj(null)
                  } catch (err) {
                    setError(err?.message || 'Unable to upload file.')
                  } finally {
                    setBusy('')
                  }
                }}
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50"
              >
                {busy === `lesson:files:${filesLesson.id}` ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          ) : null
        }
      >
        {filesLesson ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_1.2fr]">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">File title (optional)</label>
                <input
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="e.g. Workbook PDF"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Upload file</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.zip,application/pdf"
                  onChange={(e) => setFileObj(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-sm"
                />
                {fileObj ? <p className="mt-2 text-xs text-zinc-500">Selected: {fileObj.name}</p> : null}
              </div>
            </div>
            {files.length ? (
              <ul className="space-y-2">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-semibold">{f.title || f.path}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {f.file_type || 'file'}
                        {f.mime_type ? ` • ${f.mime_type}` : ''}
                        {f.size_bytes ? ` • ${(f.size_bytes / (1024 * 1024)).toFixed(1)} MB` : ''}
                      </p>
                      {f.download_url ? (
                        <a
                          href={f.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-sm font-semibold text-orange-600 dark:text-orange-300"
                        >
                          Preview download link
                        </a>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
                      onClick={async () => {
                        if (!confirm('Delete this file?')) return
                        setBusy(`lesson:file:delete:${f.id}`)
                        try {
                          await deleteMentorLessonFile(f)
                          setFiles(await listLessonFiles(filesLesson.id))
                        } catch (err) {
                          setError(err?.message || 'Unable to delete file.')
                        } finally {
                          setBusy('')
                        }
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No downloadable files yet. Upload PDFs, docs, or images for students.</p>
            )}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={!!assignmentLesson}
        onClose={() => setAssignmentLesson(null)}
        title={assignmentLesson ? `Assignments: ${assignmentLesson.title}` : 'Assignments'}
      >
        {assignmentLesson ? (
          <div className="space-y-4">
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!assignmentForm.title.trim()) return
                setBusy(`lesson:assignment:create:${assignmentLesson.id}`)
                setError('')
                try {
                  await createMentorAssignment({
                    lessonId: assignmentLesson.id,
                    title: assignmentForm.title,
                    description: assignmentForm.description,
                    file: assignmentForm.file,
                  })
                  setAssignmentForm({ title: '', description: '', file: null })
                  setAssignments(await listAssignments(assignmentLesson.id))
                } catch (err) {
                  setError(err?.message || 'Unable to create assignment.')
                } finally {
                  setBusy('')
                }
              }}
            >
              <input
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm((v) => ({ ...v, title: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Assignment title *"
              />
              <textarea
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm((v) => ({ ...v, description: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Instructions (optional)"
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,application/pdf"
                onChange={(e) => setAssignmentForm((v) => ({ ...v, file: e.target.files?.[0] || null }))}
                className="block w-full text-sm"
              />
              <button
                type="submit"
                disabled={busy === `lesson:assignment:create:${assignmentLesson.id}`}
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy === `lesson:assignment:create:${assignmentLesson.id}` ? 'Saving…' : 'Add assignment'}
              </button>
            </form>
            {assignments.length ? (
              <ul className="space-y-2">
                {assignments.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-semibold">{a.title}</p>
                      {a.description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{a.description}</p> : null}
                      {a.download_url ? (
                        <a
                          href={a.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-sm font-semibold text-orange-600 dark:text-orange-300"
                        >
                          Open attachment
                        </a>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
                      onClick={async () => {
                        if (!confirm('Delete this assignment?')) return
                        setBusy(`lesson:assignment:delete:${a.id}`)
                        try {
                          await deleteMentorAssignment(a)
                          setAssignments(await listAssignments(assignmentLesson.id))
                        } catch (err) {
                          setError(err?.message || 'Unable to delete assignment.')
                        } finally {
                          setBusy('')
                        }
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No assignments yet.</p>
            )}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={!!contentLesson}
        onClose={() => setContentLesson(null)}
        title={contentLesson ? `Lesson content: ${contentLesson.title}` : 'Lesson content'}
        footer={
          contentLesson ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSectionsDraft((v) => v.concat({ type: 'text', value: '' }))}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-700"
              >
                + Text block
              </button>
              <button
                type="button"
                disabled={busy === `lesson:content:${contentLesson.id}`}
                onClick={async () => {
                  setBusy(`lesson:content:${contentLesson.id}`)
                  setError('')
                  try {
                    await updateMentorLesson(contentLesson.id, { content: { sections: sectionsDraft } })
                    await refresh()
                    setContentLesson(null)
                  } catch (err) {
                    setError(err?.message || 'Unable to save content.')
                  } finally {
                    setBusy('')
                  }
                }}
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50"
              >
                {busy === `lesson:content:${contentLesson.id}` ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : null
        }
      >
        {contentLesson ? (
          <div className="space-y-3">
            {sectionsDraft.length ? (
              sectionsDraft.map((s, idx) => (
                <textarea
                  key={idx}
                  value={s.value || ''}
                  onChange={(e) =>
                    setSectionsDraft((v) => v.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder={`${s.type || 'text'} block`}
                />
              ))
            ) : (
              <p className="text-sm text-zinc-500">No content blocks yet.</p>
            )}
          </div>
        ) : null}
      </Dialog>
    </WorkspacePage>
  )
}

function MentorModuleCard({ module, lessons, busy, onBusy, onError, onRefresh, onEditContent, onEditFiles, onEditAssignments, onMoveModule }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ title: module.title || '', description: module.description || '' })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '' })

  return (
    <WorkspacePanel>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                value={local.title}
                onChange={(e) => setLocal((v) => ({ ...v, title: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
              />
              <textarea
                value={local.description}
                onChange={(e) => setLocal((v) => ({ ...v, description: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.14em] text-orange-500">Module {module.position}</p>
              <h3 className="mt-1 font-semibold">{module.title}</h3>
              {module.description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{module.description}</p> : null}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <IconButton disabled={busy} onClick={() => onMoveModule('up')}>
            ↑
          </IconButton>
          <IconButton disabled={busy} onClick={() => onMoveModule('down')}>
            ↓
          </IconButton>
          {editing ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  onError('')
                  onBusy(`module:save:${module.id}`)
                  try {
                    await updateMentorModule(module.id, {
                      title: local.title.trim(),
                      description: local.description.trim(),
                    })
                    setEditing(false)
                    await onRefresh()
                  } catch (err) {
                    onError(err?.message || 'Unable to save module.')
                  } finally {
                    onBusy('')
                  }
                }}
                className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white"
              >
                Save
              </button>
              <IconButton onClick={() => setEditing(false)}>Cancel</IconButton>
            </>
          ) : (
            <>
              <IconButton onClick={() => setEditing(true)}>Edit</IconButton>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!confirm('Delete this module and all its lessons?')) return
                  onBusy(`module:delete:${module.id}`)
                  try {
                    await deleteMentorModule(module.id)
                    await onRefresh()
                  } catch (err) {
                    onError(err?.message || 'Unable to delete module.')
                  } finally {
                    onBusy('')
                  }
                }}
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!lessonForm.title.trim()) return
          onBusy(`lesson:create:${module.id}`)
          try {
            await createMentorLesson({
              module_id: module.id,
              title: lessonForm.title.trim(),
              description: lessonForm.description.trim(),
            })
            setLessonForm({ title: '', description: '' })
            await onRefresh()
          } catch (err) {
            onError(err?.message || 'Unable to create lesson.')
          } finally {
            onBusy('')
          }
        }}
      >
        <input
          value={lessonForm.title}
          onChange={(e) => setLessonForm((v) => ({ ...v, title: e.target.value }))}
          placeholder="Lesson title"
          className="flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
        />
        <button
          type="submit"
          disabled={busy === `lesson:create:${module.id}`}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add lesson
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {lessons.map((l, i) => (
          <MentorLessonRow
            key={l.id}
            lesson={l}
            busy={busy}
            onBusy={onBusy}
            onError={onError}
            onRefresh={onRefresh}
            onEditContent={() => onEditContent(l)}
            onEditAssignments={() => onEditAssignments(l)}
            onEditFiles={() => onEditFiles(l)}
            onMove={async (dir) => {
              const next = lessons.slice()
              const j = dir === 'up' ? i - 1 : i + 1
              if (j < 0 || j >= next.length) return
              ;[next[i], next[j]] = [next[j], next[i]]
              onBusy('lessons:reorder')
              try {
                await reorderMentorLessons(module.id, next.map((x) => x.id))
                await onRefresh()
              } catch (err) {
                onError(err?.message || 'Unable to reorder lessons.')
              } finally {
                onBusy('')
              }
            }}
          />
        ))}
      </ul>
    </WorkspacePanel>
  )
}

function MentorLessonRow({ lesson, busy, onBusy, onError, onRefresh, onEditContent, onEditFiles, onEditAssignments, onMove }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ title: lesson.title || '', description: lesson.description || '' })
  const isPublished = lesson.status === 'published'

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">
          Lesson {lesson.position} • {isPublished ? 'Published' : 'Draft'}
        </p>
        {editing ? (
          <input
            value={local.title}
            onChange={(e) => setLocal((v) => ({ ...v, title: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950/30"
          />
        ) : (
          <p className="mt-1 text-sm font-semibold">{lesson.title}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <IconButton disabled={busy} onClick={() => onMove('up')}>
          ↑
        </IconButton>
        <IconButton disabled={busy} onClick={() => onMove('down')}>
          ↓
        </IconButton>
        {editing ? (
          <button
            type="button"
            className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white"
            onClick={async () => {
              onBusy(`lesson:save:${lesson.id}`)
              try {
                await updateMentorLesson(lesson.id, { title: local.title.trim(), description: local.description.trim() })
                setEditing(false)
                await onRefresh()
              } catch (err) {
                onError(err?.message || 'Unable to save lesson.')
              } finally {
                onBusy('')
              }
            }}
          >
            Save
          </button>
        ) : (
          <>
            <IconButton onClick={() => setEditing(true)}>Edit</IconButton>
            <IconButton onClick={onEditContent}>Content</IconButton>
            <IconButton onClick={onEditFiles}>Downloads</IconButton>
            <IconButton onClick={onEditAssignments}>Assignments</IconButton>
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${isPublished ? 'bg-zinc-700' : 'bg-emerald-600'}`}
              onClick={async () => {
                onBusy(`lesson:toggle:${lesson.id}`)
                try {
                  if (isPublished) await unpublishMentorLesson(lesson.id)
                  else await publishMentorLesson(lesson.id)
                  await onRefresh()
                } catch (err) {
                  onError(err?.message || 'Unable to update lesson.')
                } finally {
                  onBusy('')
                }
              }}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button
              type="button"
              className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
              onClick={async () => {
                if (!confirm('Delete this lesson?')) return
                onBusy(`lesson:delete:${lesson.id}`)
                try {
                  await deleteMentorLesson(lesson.id)
                  await onRefresh()
                } catch (err) {
                  onError(err?.message || 'Unable to delete lesson.')
                } finally {
                  onBusy('')
                }
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  )
}
