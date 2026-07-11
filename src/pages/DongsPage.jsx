import { useEffect, useState } from 'react'
import api from '../api/client'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'
import AuthImage from '../components/AuthImage'

export default function DongsPage() {
  const [dongs, setDongs] = useState(null)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('false')
  const [error, setError] = useState('')

  async function load(p = page) {
    try {
      const params = { page: p, size: 20 }
      if (filter !== '') params.approved = filter
      const r = await api.get('/admin/dongs', { params })
      setDongs(r.data.data)
      setError('')
    } catch (e) {
      setError(e.response?.data?.error || '불러오기 실패')
    }
  }

  useEffect(() => { load(page) }, [filter, page])

  async function approve(id) {
    try {
      await api.put(`/admin/dongs/${id}/approve`)
      load(page)
    } catch (e) {
      alert(e.response?.data?.error || '처리 실패')
    }
  }

  async function reject(id) {
    try {
      await api.put(`/admin/dongs/${id}/reject`)
      load(page)
    } catch (e) {
      alert(e.response?.data?.error || '처리 실패')
    }
  }

  const columns = [
    { key: 'buildingName', label: '건물명' },
    { key: 'name',         label: '동(이름)' },
    {
      key: 'imageUrls',
      label: '도면/사진',
      render: (urls) => !urls?.length ? (
        <span className="text-gray-400 text-xs">없음</span>
      ) : (
        <div className="flex gap-1">
          {urls.map((url, i) => (
            <AuthImage
              key={i}
              src={url}
              alt=""
              openOnClick
              className="w-10 h-10 object-cover rounded border border-gray-200 hover:opacity-80"
            />
          ))}
        </div>
      ),
    },
    {
      key: 'approved',
      label: '상태',
      render: (v) => <Badge label={v ? '승인됨' : '대기중'} variant={v ? 'success' : 'warning'} />,
    },
    { key: 'createdAt', label: '등록일', render: (v) => v?.slice(0, 10) },
    {
      key: '_actions',
      label: '액션',
      render: (_, row) => (
        <div className="flex gap-2">
          {!row.approved && (
            <button
              onClick={() => approve(row.id)}
              className="px-2.5 py-1 text-xs rounded border border-green-400 text-green-600 hover:bg-green-50 transition-colors"
            >
              승인
            </button>
          )}
          {row.approved && (
            <button
              onClick={() => reject(row.id)}
              className="px-2.5 py-1 text-xs rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
            >
              승인 취소
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">동(평면도) 승인</h1>
        <div className="flex gap-2">
          {[
            { value: 'false', label: '대기중' },
            { value: 'true',  label: '승인됨' },
            { value: '',      label: '전체' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setFilter(value); setPage(0) }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                filter === value
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {!dongs ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table columns={columns} rows={dongs} />
          {/* 응답이 배열이라 전체 건수를 알 수 없어, 받은 행이 size 미만이면 다음 페이지를 비활성화한다. */}
          <Pagination page={page} totalPages={page + (dongs.length === 20 ? 2 : 1)} onChange={setPage} />
        </>
      )}
    </div>
  )
}
