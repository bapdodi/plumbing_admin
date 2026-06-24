import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, refreshToken, name } = res.data.data

      // 로그인 자체는 일반 유저도 성공한다(권한 검사는 /admin/** 에서만).
      // 관리자 전용 API로 권한을 확인하고, 없으면 로그인 단계에서 막는다.
      // (_skipAuthHandling: 인터셉터의 자동 토큰삭제·리다이렉트를 우회)
      try {
        await api.get('/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
          _skipAuthHandling: true,
        })
      } catch (permErr) {
        const s = permErr.response?.status
        if (s === 401 || s === 403) {
          setError('관리자 권한이 없는 계정입니다.')
          return
        }
        throw permErr
      }

      localStorage.setItem('admin_token', token)
      if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken)
      localStorage.setItem('admin_user', JSON.stringify({ name }))

      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || '로그인에 실패했습니다.'
      setError(msg)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('admin_user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🔧</div>
          <h1 className="text-xl font-bold text-gray-900">배관일감 관리자</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 계정으로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
