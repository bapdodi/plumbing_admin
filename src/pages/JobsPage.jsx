import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'

const CATEGORY_LABELS = {
  leak: '누수', boiler: '보일러', pipe: '배관', hvac: '냉난방', electric: '전기', other: '기타',
}
const STATUS_VARIANTS = { open: 'success', done: 'gray' }

export default function JobsPage() {
  const [page, setPage] = useState(0)
  const [confirm, setConfirm] = useState(null)
  const { data, error, reload } = useAdminList('/admin/jobs', { page, size: 20 })

  async function handleAction(type, job) {
    if (type === 'delete') setConfirm({ type, job })
  }

  async function confirmAction() {
    if (await runAction(() => api.delete(`/admin/jobs/${confirm.job.id}`), reload, '삭제 실패')) {
      setConfirm(null)
    }
  }

  const columns = [
    { key: 'title',      label: '제목', render: (v) => <span className="max-w-xs block truncate">{v}</span> },
    { key: 'authorName', label: '작성자' },
    { key: 'category',   label: '분류', render: (v) => CATEGORY_LABELS[v] || v },
    {
      key: 'status',
      label: '상태',
      render: (v) => <Badge label={v === 'open' ? '모집 중' : '마감'} variant={STATUS_VARIANTS[v] || 'gray'} />,
    },
    { key: 'district',   label: '지역' },
    { key: 'createdAt',  label: '등록일', render: (v) => v?.slice(0, 10) },
    {
      key: '_actions',
      label: '액션',
      render: (_, row, onAction) => (
        <button
          onClick={() => onAction('delete', row)}
          className="px-2.5 py-1 text-xs rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
        >
          삭제
        </button>
      ),
    },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">일감 관리</h1>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {!data ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table columns={columns} rows={data.content} onAction={handleAction} />
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          <div className="text-xs text-gray-400 mt-2 text-right">
            총 {data.totalElements.toLocaleString()}건
          </div>
        </>
      )}

      {confirm && (
        <ConfirmDialog
          message={`"${confirm.job.title}" 일감을 삭제할까요?`}
          onConfirm={confirmAction}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
