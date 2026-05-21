import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { LegacyMemberCourseRedirect, LegacyMemberLessonRedirect } from './components/routing/LegacyMemberRedirects'
import { RouterErrorBoundary } from './components/routing/RouterErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { MentorRoute } from './components/auth/MentorRoute'
import { SuperAdminRoute } from './components/auth/SuperAdminRoute'

import {
  AboutPage,
  AdminAnnouncementsPage,
  AdminApplicationsPage,
  AdminCoursesPage,
  AdminContentPage,
  AdminCourseEditorPage,
  AdminGate,
  AdminLayout,
  AdminLogsPage,
  AdminMediaPage,
  AdminMembersPage,
  AdminOverviewPage,
  AdminResourcesPage,
  AdminMemberProgressPage,
  AdminSessionsPage,
  AdminSettingsPage,
  ContactPage,
  CourseDetailsPage,
  CoursesPage,
  DashboardPage,
  HomePage,
  LessonPage,
  MemberActivityPage,
  MemberLayout,
  MentorLayout,
  MentorDashboardPage,
  MentorStudentsPage,
  MentorCoursesPage,
  MentorCourseEditorPage,
  MentorAssignmentsPage,
  ChangePasswordPage,
  PageFallback,
  ProfilePage,
  ProgramComponentsPage,
  ProgramsPage,
  ResourcesPage,
} from './router/lazyPages'
import { queryClient } from './lib/queryClient'
import { supabaseIsConfigured } from './lib/supabaseClient'
import { SupabaseConfigRequired } from './components/system/SupabaseConfigRequired'

const memberCourseRoutes = [
  {
    path: 'courses',
    element: (
      <PageFallback>
        <CoursesPage />
      </PageFallback>
    ),
  },
  {
    path: 'courses/:courseId',
    element: (
      <PageFallback>
        <CourseDetailsPage />
      </PageFallback>
    ),
  },
  {
    path: 'courses/:courseId/lessons/:lessonId',
    element: (
      <PageFallback>
        <LessonPage />
      </PageFallback>
    ),
  },
]

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <PageFallback><HomePage /></PageFallback> },
      { path: 'about', element: <PageFallback><AboutPage /></PageFallback> },
      { path: 'programs', element: <PageFallback><ProgramsPage /></PageFallback> },
      { path: 'program-components', element: <PageFallback><ProgramComponentsPage /></PageFallback> },
      { path: 'resources', element: <PageFallback><ResourcesPage /></PageFallback> },
      { path: 'auth', element: <Navigate to="/login" replace /> },
      {
        path: 'dashboard',
        lazy: async () => {
          const m = await import('./pages/Dashboard')
          return {
            Component: () => (
              <ProtectedRoute>
                <PageFallback>
                  <m.DashboardPage />
                </PageFallback>
              </ProtectedRoute>
            ),
          }
        },
      },
      { path: 'join', element: <Navigate to="/apply" replace /> },
      { path: 'contact', element: <PageFallback><ContactPage /></PageFallback> },
      {
        path: 'login',
        lazy: async () => {
          const m = await import('./pages/Login')
          return { Component: m.LoginPage }
        },
      },
      {
        path: 'apply',
        lazy: async () => {
          const m = await import('./pages/Apply')
          return { Component: m.ApplyPage }
        },
      },
      {
        path: 'forgot-password',
        lazy: async () => {
          const m = await import('./pages/ForgotPassword')
          return { Component: m.ForgotPasswordPage }
        },
      },
      {
        path: 'reset-password',
        lazy: async () => {
          const m = await import('./pages/ResetPassword')
          return { Component: m.ResetPasswordPage }
        },
      },
      {
        path: 'member',
        element: (
          <ProtectedRoute>
            <PageFallback>
              <MemberLayout />
            </PageFallback>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <PageFallback>
                <DashboardPage />
              </PageFallback>
            ),
          },
          {
            path: 'change-password',
            element: (
              <PageFallback>
                <ChangePasswordPage />
              </PageFallback>
            ),
          },
          {
            path: 'profile',
            element: (
              <PageFallback>
                <ProfilePage />
              </PageFallback>
            ),
          },
          {
            path: 'activity',
            element: (
              <PageFallback>
                <MemberActivityPage />
              </PageFallback>
            ),
          },
          ...memberCourseRoutes,
        ],
      },
      {
        path: 'mentor',
        element: (
          <ProtectedRoute>
            <MentorRoute>
              <PageFallback>
                <MentorLayout />
              </PageFallback>
            </MentorRoute>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <PageFallback>
                <MentorDashboardPage />
              </PageFallback>
            ),
          },
          {
            path: 'students',
            element: (
              <PageFallback>
                <MentorStudentsPage />
              </PageFallback>
            ),
          },
          {
            path: 'courses',
            element: (
              <PageFallback>
                <MentorCoursesPage />
              </PageFallback>
            ),
          },
          {
            path: 'courses/:courseId',
            element: (
              <PageFallback>
                <MentorCourseEditorPage />
              </PageFallback>
            ),
          },
          {
            path: 'assignments',
            element: (
              <PageFallback>
                <MentorAssignmentsPage />
              </PageFallback>
            ),
          },
          {
            path: 'profile',
            element: (
              <PageFallback>
                <ProfilePage />
              </PageFallback>
            ),
          },
          {
            path: 'change-password',
            element: (
              <PageFallback>
                <ChangePasswordPage />
              </PageFallback>
            ),
          },
        ],
      },
      // /dashboard is now a real page (see above). Keep /member as the default authed area.
      { path: 'profile', element: <Navigate to="/member/profile" replace /> },
      { path: 'courses', element: <Navigate to="/member/courses" replace /> },
      { path: 'courses/:courseId', element: <LegacyMemberCourseRedirect /> },
      { path: 'courses/:courseId/lessons/:lessonId', element: <LegacyMemberLessonRedirect /> },
      {
        path: 'admin',
        element: (
          <PageFallback>
            <AdminGate />
          </PageFallback>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          {
            element: (
              <PageFallback>
                <AdminLayout />
              </PageFallback>
            ),
            children: [
              { path: 'dashboard', element: <PageFallback><AdminOverviewPage /></PageFallback> },
              { path: 'applications', element: <PageFallback><AdminApplicationsPage /></PageFallback> },
              { path: 'users', element: <PageFallback><AdminMembersPage /></PageFallback> },
              { path: 'courses', element: <PageFallback><AdminCoursesPage /></PageFallback> },
              { path: 'courses/:courseId', element: <PageFallback><AdminCourseEditorPage /></PageFallback> },
              { path: 'announcements', element: <PageFallback><AdminAnnouncementsPage /></PageFallback> },
              { path: 'members', element: <Navigate to="/admin/users" replace /> },
              { path: 'sessions', element: <PageFallback><AdminSessionsPage /></PageFallback> },
              { path: 'content', element: <PageFallback><AdminContentPage /></PageFallback> },
              { path: 'resources', element: <PageFallback><AdminResourcesPage /></PageFallback> },
              { path: 'progress', element: <PageFallback><AdminMemberProgressPage /></PageFallback> },
              { path: 'media', element: <PageFallback><AdminMediaPage /></PageFallback> },
              { path: 'logs', element: <PageFallback><AdminLogsPage /></PageFallback> },
              {
                path: 'settings',
                element: (
                  <PageFallback>
                    <SuperAdminRoute>
                      <AdminSettingsPage />
                    </SuperAdminRoute>
                  </PageFallback>
                ),
              },
            ],
          },
        ],
      },
      { path: 'index.html', element: <Navigate to="/" replace /> },
      { path: 'about.html', element: <Navigate to="/about" replace /> },
      { path: 'programs.html', element: <Navigate to="/programs" replace /> },
      { path: 'program-components.html', element: <Navigate to="/program-components" replace /> },
      { path: 'community', element: <Navigate to="/apply" replace /> },
      { path: 'community.html', element: <Navigate to="/apply" replace /> },
      { path: 'resources.html', element: <Navigate to="/resources" replace /> },
      { path: 'join.html', element: <Navigate to="/apply" replace /> },
      { path: 'contact.html', element: <Navigate to="/contact" replace /> },
      { path: 'login.html', element: <Navigate to="/login" replace /> },
      { path: 'signup.html', element: <Navigate to="/apply" replace /> },
      { path: '*', element: <RouterErrorBoundary /> },
    ],
  },
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
