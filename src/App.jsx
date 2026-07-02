import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import JobsPage from './pages/JobsPage'
import PostsPage from './pages/PostsPage'
import VendorsPage from './pages/VendorsPage'
import BuildingsPage from './pages/BuildingsPage'
import DongsPage from './pages/DongsPage'
import ReportsPage from './pages/ReportsPage'
import InquiriesPage from './pages/InquiriesPage'

function RequireAuth({ children }) {
  const token = localStorage.getItem('admin_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
