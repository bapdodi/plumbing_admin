import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table } from '../components/Table'
import ConfirmDialog from '../components/ConfirmDialog'

/** 01012345678 → 010-1234-5678 */
function formatPhone(digits) {
  if (!digits) return '—'
  const m = digits.match(/^(\d{3})(\d{3,4})(\d{4})$/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : digits
}

export default function BlocksPage() {
  const [tab, setTab] = useState('banned')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState(null) // { type: 'unban'|'ban', row }

  const banned = useAdminList('/admin/banned-phones')
  const withdrawn = useAdminList('/admin/withdrawn')

  const bannedList = banned.data ?? []
  const withdrawnList = withdrawn.data ?? []

  async function ban(digits, banReason) {
    const ok = await runAction(
      () => api.post('/admin/banned-phones', { phone: digits, reason: banReason || null }),
      banned.reload,
      '차단 등록 실패',
    )
    if (ok) { setPhone(''); setReason('') }
    return ok
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) return alert('전화번호를 정확히 입력해 주세요.')
    setConfirm({ type: 'ban', row: { phoneDigits: digits, reason } })
  }

  async function confirmAction() {
    if (!confirm) return
    const ok = confirm.type === 'ban'
      ? await ban(confirm.row.phoneDigits, confirm.row.reason)
      : await runAction(
          () => api.delete(`/admin/banned-phones/${confirm.row.id}`),
          banned.reload,
          '차단 해제 실패',
        )
    if (ok) setConfirm(null)
  }

  const bannedColumns = [
    { key: 'phoneDigits', label: '전화번호', render: formatPhone },
    {
      key: 'reason',
      label: '사유',
      render: (v) => v || <span className="text-gray-300">—</span>,
    },
    { key: 'createdAt', label: '차단일', render: (v) => v?.slice(0, 10) },
    {
      key: '_actions',
      label: '액션',
      render: (_, row, onAction) => (
        <button
          onClick={() => onAction('unban', row)}
          className="px-2.5 py-1 text-xs rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          차단 해제
        </button>
      ),
    },
  ]

  const withdrawnColumns = [
    { key: 'name', label: '이름/상호명' },
    { key: 'phoneDigits', label: '전화번호', render: formatPhone },
    { key: 'region', label: '지역' },
    {
      key: 'reason',
      label: '탈퇴 사유',
      render: (v) => v
        ? <span className="max-w-xs block truncate text-gray-500">{v}</span>
        : <span className="text-gray-300">—</span>,
    },
    { key: 'withdrawnAt', label: '탈퇴일', render: (v) => v?.slice(0, 10) },
    {
      key: '_actions',
      label: '액션',
      render: (_, row, onAction) => {
        const already = bannedList.some((b) => b.phoneDigits === row.phoneDigits)
        return already ? (
          <span className="text-xs text-gray-400">차단됨</span>
        ) : (
          <button
            onClick={() => onAction('ban', row)}
            className="px-2.5 py-1 text-xs rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
          >
            재가입 차단
          </button>
        )
      },
    },
  ]

  const active = tab === 'banned' ? banned : withdrawn
  const rows = tab === 'banned' ? bannedList : withdrawnList

  const handleAction = (type, row) => setConfirm({ type, row })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">차단 관리</h1>
        <div className="flex gap-2">
          {[
            { value: 'banned',    label: '재가입 차단' },
            { value: 'withdrawn', label: '탈퇴 회원' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                tab === value
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'banned' && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-2 mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50"
        >
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="차단할 전화번호 (010-1234-5678)"
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-56 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="사유 (예: 사기 신고 #123)"
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-danger text-white hover:bg-red-600 transition-colors"
          >
            차단 등록
          </button>
        </form>
      )}

      {active.error && <div className="text-red-500 text-sm mb-4">{active.error}</div>}
      {!active.data ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table
            columns={tab === 'banned' ? bannedColumns : withdrawnColumns}
            rows={rows}
            onAction={handleAction}
          />
          <div className="text-xs text-gray-400 mt-2 text-right">
            총 {rows.length.toLocaleString()}건
          </div>
        </>
      )}

      {confirm && (
        <ConfirmDialog
          message={
            confirm.type === 'ban'
              ? `${formatPhone(confirm.row.phoneDigits)} 번호를 재가입 차단할까요? 이 번호로 활성화된 계정이 있으면 함께 정지됩니다.`
              : `${formatPhone(confirm.row.phoneDigits)} 번호의 차단을 해제할까요? 해제하면 다시 가입할 수 있습니다.`
          }
          onConfirm={confirmAction}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
