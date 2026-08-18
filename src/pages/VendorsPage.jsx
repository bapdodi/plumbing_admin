import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'

export default function VendorsPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('false') // 'false' = pending, 'true' = approved, '' = all
  const [confirm, setConfirm] = useState(null) // 삭제 확인 대상 업체
  const { data, error, reload } = useAdminList('/admin/vendors/page', {
    page, size: 20, ...(filter !== '' && { approved: filter }),
  })
  const vendors = data?.content

  const approve = (id) => runAction(() => api.put(`/admin/vendors/${id}/approve`), reload)
  const reject = (id) => runAction(() => api.put(`/admin/vendors/${id}/reject`), reload)

  async function confirmDelete() {
    if (!confirm) return
    if (await runAction(() => api.delete(`/admin/vendors/${confirm.id}`), reload, '삭제 실패')) {
      setConfirm(null)
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
              className="px-2.5 py-1 text-xs rounded border border-amber-300 text-amber-600 hover:bg-amber-50 transition-colors"
            >
              승인 취소
            </button>
          )}
          <button
            onClick={() => setConfirm(row)}
            className="px-2.5 py-1 text-xs rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
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
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      {confirm && (
        <ConfirmDialog
          message={`"${confirm.name}" 업체를 삭제할까요? 삭제하면 복구할 수 없습니다.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
