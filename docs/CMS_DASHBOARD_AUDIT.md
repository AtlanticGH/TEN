# TEN dashboard consolidation audit (Step 1)

Generated before CMS-only rebuild. Student/mentor **page trees are already removed** from `src/`; remnants are listed below.

## 1. Student dashboard — exclusive (delete / already deleted)

| Path | Notes |
|------|--------|
| `src/pages/member/*` | **Gone** — no directory |
| `src/hooks/useMemberDashboard.js` | **Deleted** |
| `src/hooks/useMemberCourses.js` | **Deleted** |
| `src/components/workspace/WorkspaceChrome.jsx` | **Deleted** |
| `src/components/profile/SharedProfileView.jsx` | **Deleted** |
| `src/components/dashboard/AnnouncementNavBadge.jsx` | **Deleted** |
| `server/mentorRoutes.js` (member assignment routes) | **Deleted** |

## 2. Mentor dashboard — exclusive (delete / already deleted)

| Path | Notes |
|------|--------|
| `src/pages/mentor/*` | **Gone** |
| `src/components/auth/MentorRoute.jsx` | **Deleted** |
| `src/pages/admin/AdminGate.jsx` | **Deleted** |
| `src/hooks/useMentorDashboard.js` | **Deleted** |
| `src/hooks/useMentorStudentAnnouncements.js` | **Deleted** |
| `src/services/mentor.js` | **Deleted** |
| `src/services/mentor*.js` (7 files) | **Deleted** |
| `scripts/create-mentor.mjs`, `create-student.mjs` | **Deleted** |

## 3. Shared — keep, clean student/mentor branches

| Path | Action |
|------|--------|
| `src/components/layout/MainDashboardLayout.tsx` | Keep — admin shell |
| `src/components/dashboard/DashboardChrome.jsx` | Keep |
| `src/components/auth/AdminRoute.jsx` | Keep — tighten to admin roles |
| `src/context/AuthContext.jsx` | Keep — uses `getMyProfile` only |
| `src/services/db.js` | **Trim** — remove LMS helpers unused by admin |
| `src/lib/rbac.js` | **Cleaned** — staff-only paths |
| `src/lib/layoutPaths.js` | **Clean** — remove mentor/member prefixes |
| `server/index.js` | Keep — CMS + restore admin apps/courses/blog |
| `api/applications/*`, `api/inviteApplicant.js` | Keep for optional legacy; admin uses `/api/admin/*` |

## 4. React Router — student/mentor

| Route | Status |
|-------|--------|
| `/member/*` | Redirect → `/` |
| `/mentor/*` | Redirect → `/` |
| `/login`, `/auth` | Redirect → `/admin/login` |

## 5. Supabase — mentor/student-only (do not drop tables)

| Item | Action |
|------|--------|
| `courses`, `modules`, `lessons`, `enrollments`, … | **Keep tables** — admin CMS uses courses |
| `applications` | **Keep** — admin review |
| `mentor_announcements`, `mentor_students`, … | **Keep tables** — flag `// TEN-CLEANUP: mentor-era` in new migration comments |
| RLS `courses_manage_mentor_own`, `courses_select_mentor` | **Flag only** — not dropped |
| New `blog_posts` table | **Add** for Blog section |

## 6. Role strings in code (post-cleanup target)

Remaining references are marketing copy on public pages (`HomePage`, `AboutPage`, …) or DB types — not dashboard routing.
