import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AdminRoute } from './components/auth/AdminRoute'
import { SuperAdminRoute } from './components/auth/SuperAdminRoute'
import { RouterErrorBoundary } from './components/routing/RouterErrorBoundary'
import { PageFallback } from './router/lazyPages'
import { queryClient } from './lib/queryClient'
import { supabaseIsConfigured } from './lib/supabaseClient'
import { SupabaseConfigRequired } from './components/system/SupabaseConfigRequired'
import { HomePage } from './pages/HomePage'

// ── Public pages (lazy) ─────────────────────────────────────────────────────
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ProgramsPage = lazy(() => import('./pages/ProgramsPage').then((m) => ({ default: m.ProgramsPage })))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const JoinCommunityPage = lazy(() => import('./pages/JoinCommunityPage').then((m) => ({ default: m.JoinCommunityPage })))

// ── Admin pages (lazy) ──────────────────────────────────────────────────────
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLoginPage })))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverview').then((m) => ({ default: m.AdminOverviewPage })))
const AdminApplicationsPage = lazy(() => import('./pages/admin/AdminApplications').then((m) => ({ default: m.AdminApplicationsPage })))
const AdminMembersPage = lazy(() => import('./pages/admin/AdminMembers').then((m) => ({ default: m.AdminMembersPage })))
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCourses').then((m) => ({ default: m.AdminCoursesPage })))
const AdminCourseEditorPage = lazy(() => import('./pages/admin/AdminCourseEditor').then((m) => ({ default: m.AdminCourseEditorPage })))
const AdminContentPage = lazy(() => import('./pages/admin/AdminContent').then((m) => ({ default: m.AdminContentPage })))
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncements').then((m) => ({ default: m.AdminAnnouncementsPage })))
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMedia').then((m) => ({ default: m.AdminMediaPage })))
const AdminResourcesPage = lazy(() => import('./pages/admin/AdminResources').then((m) => ({ default: m.AdminResourcesPage })))
const AdminSessionsPage = lazy(() => import('./pages/admin/AdminSessions').then((m) => ({ default: m.AdminSessionsPage })))
const AdminMemberProgressPage = lazy(() => import('./pages/admin/AdminMemberProgress').then((m) => ({ default: m.AdminMemberProgressPage })))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage').then((m) => ({ default: m.AdminLogsPage })))

const router = createBrowserRouter([
  // ── Public marketing site (wrapped in MainLayout via App) ──────────────────
  {
    path: '/',
    element: <App />,
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <PageFallback><AboutPage /></PageFallback> },
      { path: 'programs', element: <PageFallback><ProgramsPage /></PageFallback> },
      { path: 'resources', element: <PageFallback><ResourcesPage /></PageFallback> },
      { path: 'contact', element: <PageFallback><ContactPage /></PageFallback> },
      { path: 'community', element: <PageFallback><JoinCommunityPage /></PageFallback> },
    ],
  },

  // ── Admin login (standalone) ───────────────────────────────────────────────
  { path: '/admin/login', element: <PageFallback><AdminLoginPage /></PageFallback> },

  // ── Admin CMS (protected) ──────────────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <PageFallback>
          <AdminLayout />
        </PageFallback>
      </AdminRoute>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: 'overview', element: <AdminOverviewPage /> },
      { path: 'applications', element: <AdminApplicationsPage /> },
      { path: 'members', element: <AdminMembersPage /> },
      { path: 'courses', element: <AdminCoursesPage /> },
      { path: 'courses/:courseId/edit', element: <AdminCourseEditorPage /> },
      { path: 'content', element: <AdminContentPage /> },
      { path: 'announcements', element: <AdminAnnouncementsPage /> },
      { path: 'media', element: <AdminMediaPage /> },
      { path: 'resources', element: <AdminResourcesPage /> },
      { path: 'sessions', element: <AdminSessionsPage /> },
      { path: 'progress', element: <AdminMemberProgressPage /> },
      { path: 'settings', element: <SuperAdminRoute><AdminSettingsPage /></SuperAdminRoute> },
      { path: 'logs', element: <AdminLogsPage /> },
    ],
  },

  // ── Redirects for removed member/applicant routes ──────────────────────────
  { path: '/login', element: <Navigate to="/" replace /> },
  { path: '/auth', element: <Navigate to="/" replace /> },
  { path: '/apply', element: <Navigate to="/community" replace /> },
  { path: '/join', element: <Navigate to="/community" replace /> },
  { path: '/dashboard', element: <Navigate to="/admin" replace /> },
  { path: '/forgot-password', element: <Navigate to="/" replace /> },
  { path: '/reset-password', element: <Navigate to="/" replace /> },
  { path: '/member/*', element: <Navigate to="/" replace /> },
  { path: '/mentor/*', element: <Navigate to="/" replace /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

const appTree = supabaseIsConfigured ? (
  <AuthProvider>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </AuthProvider>
) : (
  <SupabaseConfigRequired />
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>{appTree}</QueryClientProvider>
  </StrictMode>,
)
