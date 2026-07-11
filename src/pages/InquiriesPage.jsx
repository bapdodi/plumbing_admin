import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'

const STATUS_VARIANTS = {
  PENDING:  'warning',
  ANSWERED: 'success',
}

const STATUS_LABELS = {
  PENDING:  '답변 대기',
  ANSWERED: '답변 완료',
}

function ReplyDialog({ inquiry, onSubmit, onCancel }) {
  const [reply, setReply] = useState(inquiry.reply || '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!reply.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(reply.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">문의 답변</h2>
        <div className="text-xs text-gray-400 mb-4">{inquiry.contact}</div>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4 whitespace-pre-wrap max-h-40 overflow-y-auto">
          {inquiry.content}
        </div>
        <textarea
          autoFocus
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={5}
          placeholder="답변 내용을 입력하세요"
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reply.trim() || submitting}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
          >
            {submitting ? '전송 중...' : '답변 등록 및 메일 발송'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InquiriesPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('PENDING')
  const [replying, setReplying] = useState(null)
  const { data, error, reload } = useAdminList('/admin/inquiries', {
    page, size: 20, ...(filter && { status: filter }),
  })

  async function submitReply(reply) {
    if (await runAction(() => api.put(`/admin/inquiries/${replying.id}/answer`, { reply }), reload, '답변 등록 실패')) {
      setReplying(null)
    }
  }

  const columns = [
    { key: 'contact', label: '연락처(이메일)' },
    {
      key: 'content',
      label: '문의 내용',
      render: (v) => <span className="max-w-sm block truncate text-gray-700">{v}</span>,
    },
    {
      key: 'status',
      label: '상태',
      render: (v) => <Badge label={STATUS_LABELS[v] || v} variant={STATUS_VARIANTS[v] || 'gray'} />,
    },
    {
      key: 'createdAt',
      label: '접수일',
      render: (v) => v?.slice(0, 10),
    },
    {
      key: '_actions',
      label: '처리',
      render: (_, row) => (
        <button
          onClick={() => setReplying(row)}
          className="px-2.5 py-1 text-xs rounded border border-primary text-primary hover:bg-blue-50 transition-colors"
        >
          {row.status === 'PENDING' ? '답변하기' : '답변 보기'}
        </button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">문의 관리</h1>
        <div className="flex gap-2">
          {[
            { value: 'PENDING',  label: '대기중' },
            { value: 'ANSWERED', label: '답변완료' },
            { value: '',         label: '전체' },
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
      {!data ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table columns={columns} rows={data.content} />
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          <div className="text-xs text-gray-400 mt-2 text-right">
            총 {data.totalElements.toLocaleString()}건
          </div>
        </>
      )}

      {replying && (
        <ReplyDialog
          inquiry={replying}
          onSubmit={submitReply}
          onCancel={() => setReplying(null)}
        />
      )}
    </div>
  )
}
