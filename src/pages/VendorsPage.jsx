import { useEffect, useState } from 'react'
import api from '../api/client'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'

export default function VendorsPage() {
  const [vendors, setVendors] = useState(null)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('false') // 'false' = pending, 'true' = approved, '' = all
  const [error, setError] = useState('')

  async function load(p = page) {
    try {
      const params = { page: p, size: 20 }
      if (filter !== '') params.approved = filter
      const r = await api.get('/admin/vendors', { params })
      setVendors(r.data.data)
      setError('')
    } catch (e) {
      setError(e.response?.data?.error || '불러오기 실패')
    }
  }

  useEffect(() => { load(page) }, [filter, page])

  async function approve(id) {
    try {
      await api.put(`/admin/vendors/${id}/approve`)
      load(page)
    } catch (e) {
      alert(e.response?.data?.error || '처리 실패')
    }
  }

  async function reject(id) {
    try {
      await api.put(`/admin/vendors/${id}/reject`)
      load(page)
    } catch (e) {
      alert(e.response?.data?.error || '처리 실패')
    }
  }

  const columns = [
    { key: 'name',    label: '업체명' },
    { key: 'address', label: '주소', render: (v) => <span className="max-w-xs block truncate">{v}</span> },
    { key: 'phone',   label: '전화번호' },
    {
      key: 'tags',
      label: '태그',
      render: (v) => v?.join(', ') || '—',
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
        <h1 className="text-xl font-bold text-gray-900">업체 승인</h1>
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
      {!vendors ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table columns={columns} rows={vendors} />
          {/* 응답이 배열이라 전체 건수를 알 수 없어, 받은 행이 size 미만이면 다음 페이지를 비활성화한다. */}
          <Pagination page={page} totalPages={page + (vendors.length === 20 ? 2 : 1)} onChange={setPage} />
        </>
      )}
    </div>
  )
}
