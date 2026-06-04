import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AdminLoginRedirect, AdminRoot } from './components/auth/AdminRoot'
import { RouterErrorBoundary } from './components/routing/RouterErrorBoundary'
import { PageFallback } from './router/lazyPages'
import { queryClient } from './lib/queryClient'
import { supabaseIsConfigured } from './lib/supabaseClient'
import { SupabaseConfigRequired } from './components/system/SupabaseConfigRequired'
import { HomePage } from './pages/HomePage'

const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ProgramsPage = lazy(() => import('./pages/ProgramsPage').then((m) => ({ default: m.ProgramsPage })))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const JoinCommunityPage = lazy(() => import('./pages/JoinCommunityPage').then((m) => ({ default: m.JoinCommunityPage })))
const GalleryPage = lazy(() => import('./pages/GalleryPage').then((m) => ({ default: m.GalleryPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const CmsDynamicPage = lazy(() => import('./pages/CmsDynamicPage').then((m) => ({ default: m.CmsDynamicPage })))

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLoginPage })))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverview').then((m) => ({ default: m.AdminOverviewPage })))
const AdminPagesLayout = lazy(() => import('./pages/admin/AdminPagesLayout').then((m) => ({ default: m.AdminPagesLayout })))
const AdminPageSlugRedirect = lazy(() =>
  import('./pages/admin/AdminPageSlugRedirect').then((m) => ({ default: m.AdminPageSlugRedirect })),
)
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMedia').then((m) => ({ default: m.AdminMediaPage })))
const AdminGlobalSettingsPage = lazy(() =>
  import('./pages/admin/AdminGlobalSettings').then((m) => ({ default: m.AdminGlobalSettingsPage })),
)
const AdminPagesManagerPage = lazy(() =>
  import('./pages/admin/AdminPagesManager').then((m) => ({ default: m.AdminPagesManagerPage })),
)
const AdminPageBuilderPage = lazy(() =>
  import('./pages/admin/AdminPageBuilder').then((m) => ({ default: m.AdminPageBuilderPage })),
)
const AdminGalleryPage = lazy(() =>
  import('./pages/admin/AdminGallery').then((m) => ({ default: m.AdminGalleryPage })),
)
const AdminNavigationPage = lazy(() =>
  import('./pages/admin/AdminNavigation').then((m) => ({ default: m.AdminNavigationPage })),
)
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsersPage })))
const AdminContentPage = lazy(() => import('./pages/admin/AdminContent').then((m) => ({ default: m.AdminContentPage })))
const AdminPageHeroesPage = lazy(() =>
  import('./pages/admin/AdminPageHeroes').then((m) => ({ default: m.AdminPageHeroesPage })),
)
const AdminProgramsPage = lazy(() => import('./pages/admin/AdminPrograms').then((m) => ({ default: m.AdminProgramsPage })))
const AdminPeoplePage = lazy(() => import('./pages/admin/AdminPeople').then((m) => ({ default: m.AdminPeoplePage })))
const AdminResourcesPage = lazy(() =>
  import('./pages/admin/AdminResources').then((m) => ({ default: m.AdminResourcesPage })),
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <PageFallback><AboutPage /></PageFallback> },
      { path: 'programs', element: <PageFallback><ProgramsPage /></PageFallback> },
      { path: 'program-components', element: <Navigate to="/programs" replace /> },
      { path: 'resources', element: <PageFallback><ResourcesPage /></PageFallback> },
      { path: 'contact', element: <PageFallback><ContactPage /></PageFallback> },
      { path: 'community', element: <PageFallback><JoinCommunityPage /></PageFallback> },
      { path: 'gallery', element: <PageFallback><GalleryPage /></PageFallback> },
      { path: 'blog', element: <Navigate to="/gallery" replace /> },
      { path: 'blog/:slug', element: <Navigate to="/gallery" replace /> },
      { path: ':slug', element: <PageFallback><CmsDynamicPage /></PageFallback> },
      { path: '*', element: <PageFallback><NotFoundPage /></PageFallback> },
    ],
  },

  {
    path: '/admin',
    element: (
      <PageFallback>
        <AdminRoot />
      </PageFallback>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <PageFallback><AdminLoginPage /></PageFallback> },
      {
        element: (
          <PageFallback>
            <AdminLayout />
          </PageFallback>
        ),
        children: [
      { path: 'overview', element: <AdminOverviewPage /> },
      { path: 'home', element: <AdminContentPage /> },
      { path: 'heroes', element: <AdminPageHeroesPage /> },
      { path: 'programs', element: <AdminProgramsPage /> },
      { path: 'people', element: <AdminPeoplePage /> },
      { path: 'resources', element: <AdminResourcesPage /> },
      { path: 'gallery', element: <AdminGalleryPage /> },
      { path: 'pages/manage', element: <AdminPagesManagerPage /> },
      { path: 'pages/gallery/builder', element: <Navigate to="/admin/gallery" replace /> },
      { path: 'pages/:pageSlug/builder', element: <AdminPageBuilderPage /> },
      { path: 'navigation', element: <AdminNavigationPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'blog', element: <Navigate to="/admin/gallery" replace /> },
      { path: 'media', element: <AdminMediaPage /> },
      {
        path: 'pages',
        element: <AdminPagesLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/pages/manage" replace /> },
          { path: 'media', element: <AdminMediaPage /> },
          { path: 'gallery/builder', element: <Navigate to="/admin/gallery" replace /> },
          { path: ':pageSlug/builder', element: <AdminPageBuilderPage /> },
          { path: ':pageSlug', element: <AdminPageSlugRedirect /> },
        ],
      },
      { path: 'settings', element: <AdminGlobalSettingsPage /> },
      { path: 'content', element: <Navigate to="/admin/home" replace /> },
      { path: 'hero', element: <Navigate to="/admin/heroes" replace /> },
      { path: 'sections', element: <Navigate to="/admin/pages/manage" replace /> },
      { path: 'courses', element: <Navigate to="/admin/overview" replace /> },
      { path: 'courses/:courseId/edit', element: <Navigate to="/admin/overview" replace /> },
      { path: 'applications', element: <Navigate to="/admin/overview" replace /> },
      { path: 'logs', element: <Navigate to="/admin/overview" replace /> },
      { path: 'members', element: <Navigate to="/admin/overview" replace /> },
      { path: 'announcements', element: <Navigate to="/admin/overview" replace /> },
      { path: 'sessions', element: <Navigate to="/admin/overview" replace /> },
      { path: 'progress', element: <Navigate to="/admin/overview" replace /> },
        ],
      },
    ],
  },

  { path: '/admin/login', element: <AdminLoginRedirect /> },
  { path: '/login', element: <Navigate to="/admin" replace /> },
  { path: '/auth', element: <Navigate to="/admin" replace /> },
  { path: '/apply', element: <Navigate to="/contact#contact-form" replace /> },
  { path: '/join', element: <Navigate to="/community" replace /> },
  { path: '/dashboard', element: <Navigate to="/admin" replace /> },
  { path: '/forgot-password', element: <Navigate to="/" replace /> },
  { path: '/reset-password', element: <Navigate to="/" replace /> },
  { path: '/member/*', element: <Navigate to="/" replace /> },
  { path: '/mentor/*', element: <Navigate to="/" replace /> },
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
