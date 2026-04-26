import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import api from '../api/client'

export default function Layout() {
  const navigate = useNavigate()

  async function handleLogout() {
    const refreshToken = localStorage.getItem('admin_refresh_token')
    if (refreshToken) {
      try { await api.post('/auth/logout', { refreshToken }) } catch (_) {}
    }
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_refresh_token')
    localStorage.removeItem('admin_user')
    navigate('/login')
  }

  const user = JSON.parse(localStorage.getItem('admin_user') || '{}')

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
          <span className="text-sm text-gray-500">배관일감 관리자 패널</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{user.name || '관리자'}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-danger transition-colors"
            >
              로그아웃
            </button>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
