import axios from 'axios'

// 개발: Vite proxy(/api → localhost:8080)
// 프로덕션: VITE_API_URL 환경변수 (예: https://api.example.com/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshInFlight = null

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight
  const refreshToken = localStorage.getItem('admin_refresh_token')
  if (!refreshToken) return null

  refreshInFlight = axios
    .post(
      `${api.defaults.baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    .then((res) => {
      const data = res.data?.data || {}
      if (data.token) localStorage.setItem('admin_token', data.token)
      if (data.refreshToken) localStorage.setItem('admin_refresh_token', data.refreshToken)
      return data.token || null
    })
    .catch(() => {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_refresh_token')
      return null
    })
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status
    const original = err.config
    // 권한 검증 등 호출부에서 직접 처리하려는 요청은 자동 갱신/로그아웃을 건너뛴다.
    if (original?._skipAuthHandling) return Promise.reject(err)
    const isAuthCall = original?.url?.includes('/auth/login') ||
                       original?.url?.includes('/auth/refresh') ||
                       original?.url?.includes('/auth/logout')

    if ((status === 401 || status === 403) && !original._retried && !isAuthCall) {
      original._retried = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${newToken}`
        return api.request(original)
      }
    }

    if (status === 401 || status === 403) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_refresh_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
