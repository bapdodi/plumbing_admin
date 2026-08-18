import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const JobsPage = lazy(() => import('./pages/JobsPage'))
const PostsPage = lazy(() => import('./pages/PostsPage'))
const VendorsPage = lazy(() => import('./pages/VendorsPage'))
const BuildingsPage = lazy(() => import('./pages/BuildingsPage'))
const DongsPage = lazy(() => import('./pages/DongsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const InquiriesPage = lazy(() => import('./pages/InquiriesPage'))
const BlocksPage = lazy(() => import('./pages/BlocksPage'))
const AppVersionPage = lazy(() => import('./pages/AppVersionPage'))

function RequireAuth({ children }) {
  const token = localStorage.getItem('admin_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8 text-gray-400">로딩 중...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="buildings" element={<BuildingsPage />} />
          <Route path="dongs" element={<DongsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="blocks" element={<BlocksPage />} />
          <Route path="app-version" element={<AppVersionPage />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
