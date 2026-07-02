import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

function StatCard({ label, value, to, color = 'text-primary' }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value ?? '—'}</div>
    </button>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data.data))
      .catch((e) => setError(e.response?.data?.error || '통계 로드 실패'))
  }, [])

  if (error) return <div className="text-red-500 text-sm">{error}</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="전체 회원" value={stats?.totalUsers} to="/users" />
        <StatCard label="전체 일감" value={stats?.totalJobs} to="/jobs" />
        <StatCard label="전체 게시글" value={stats?.totalPosts} to="/posts" />
        <StatCard
          label="승인 대기 업체"
          value={stats?.pendingVendors}
          to="/vendors"
          color={stats?.pendingVendors > 0 ? 'text-warning' : 'text-primary'}
        />
        <StatCard
          label="승인 대기 동(도면)"
          value={stats?.pendingDongs}
          to="/dongs"
          color={stats?.pendingDongs > 0 ? 'text-warning' : 'text-primary'}
        />
        <StatCard
          label="미처리 신고"
          value={stats?.pendingReports}
          to="/reports"
          color={stats?.pendingReports > 0 ? 'text-danger' : 'text-primary'}
        />
        <StatCard
          label="답변 대기 문의"
          value={stats?.pendingInquiries}
          to="/inquiries"
          color={stats?.pendingInquiries > 0 ? 'text-warning' : 'text-primary'}
        />
      </div>
    </div>
  )
}
