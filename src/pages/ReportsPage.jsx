import { useEffect, useState } from 'react'
import api from '../api/client'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'

const REASON_LABELS = {
  spam: '스팸/광고',
  obscene: '음란/부적절',
  fraud: '사기/허위',
  illegal: '불법 행위',
  other: '기타',
}

const STATUS_VARIANTS = {
  PENDING:   'warning',
  RESOLVED:  'success',
  DISMISSED: 'gray',
}

const STATUS_LABELS = {
  PENDING:   '처리 대기',
  RESOLVED:  '조치 완료',
  DISMISSED: '무시됨',
}

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('PENDING')
  const [error, setError] = useState('')

  async function load(p = page) {
    try {
      const params = { page: p, size: 20 }
      if (filter) params.status = filter
      const r = await api.get('/admin/reports', { params })
      setData(r.data.data)
      setError('')
    } catch (e) {
      setError(e.response?.data?.error || '불러오기 실패')
    }
  }

  useEffect(() => { setPage(0); load(0) }, [filter])
  useEffect(() => { load(page) }, [page])

  async function handleAction(type, report) {
    try {
      await api.put(`/admin/reports/${report.id}/${type}`)
      load(page)
    } catch (e) {
      alert(e.response?.data?.error || '처리 실패')
    }
  }

  const columns = [
    { key: 'reporterName', label: '신고자' },
    {
      key: 'targetType',
      label: '대상 유형',
      render: (v) => <Badge label={v === 'POST' ? '게시글' : '일감'} variant="info" />,
    },
    {
      key: 'reason',
      label: '사유',
      render: (v) => REASON_LABELS[v] || v,
    },
    {
      key: 'detail',
      label: '상세 설명',
      render: (v) => v
        ? <span className="max-w-xs block truncate text-gray-500">{v}</span>
        : <span className="text-gray-300">—</span>,
    },
    {
      key: 'status',
      label: '상태',
      render: (v) => <Badge label={STATUS_LABELS[v] || v} variant={STATUS_VARIANTS[v] || 'gray'} />,
    },
    {
      key: 'createdAt',
      label: '신고일',
      render: (v) => v?.slice(0, 10),
    },
    {
      key: '_actions',
      label: '처리',
      render: (_, row, onAction) => row.status === 'PENDING' ? (
        <div className="flex gap-2">
          <button
            onClick={() => onAction('resolve', row)}
            className="px-2.5 py-1 text-xs rounded border border-green-400 text-green-600 hover:bg-green-50 transition-colors"
          >
            조치 완료
          </button>
          <button
            onClick={() => onAction('dismiss', row)}
            className="px-2.5 py-1 text-xs rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            무시
          </button>
        </div>
      ) : null,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">신고 처리</h1>
        <div className="flex gap-2">
          {[
            { value: 'PENDING',   label: '대기중' },
            { value: 'RESOLVED',  label: '처리됨' },
            { value: 'DISMISSED', label: '무시됨' },
            { value: '',          label: '전체' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
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
    </div>
  )
}
