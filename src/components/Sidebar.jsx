import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',         label: '대시보드',    icon: '📊' },
  { to: '/users',    label: '회원 관리',   icon: '👥' },
  { to: '/jobs',     label: '일감 관리',   icon: '🔧' },
  { to: '/posts',    label: '게시글 관리', icon: '📝' },
  { to: '/vendors',  label: '업체 승인',   icon: '🏪' },
  { to: '/buildings',label: '건물 승인',   icon: '🏢' },
  { to: '/reports',  label: '신고 처리',   icon: '🚨' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-primary text-white flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-blue-700">
        <div className="text-lg font-bold leading-tight">배관일감</div>
        <div className="text-xs text-blue-200 mt-0.5">관리자</div>
      </div>
      <nav className="flex-1 py-4">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-700 font-semibold'
                  : 'text-blue-100 hover:bg-blue-700/60'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
