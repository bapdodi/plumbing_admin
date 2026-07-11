import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'

export default function UsersPage() {
  const [page, setPage] = useState(0)
  const [confirm, setConfirm] = useState(null) // { type, user }
  const { data, error, reload } = useAdminList('/admin/users', { page, size: 20 })

  async function handleAction(type, user) {
    if (type === 'delete') setConfirm({ type, user })
  }

  async function confirmAction() {
    if (!confirm) return
    if (await runAction(() => api.delete(`/admin/users/${confirm.user.id}`), reload, '삭제 실패')) {
      setConfirm(null)
    }
  }

  const columns = [
    { key: 'name',     label: '이름/상호명' },
    { key: 'email',    label: '이메일' },
    { key: 'phone',    label: '전화번호' },
    { key: 'region',   label: '지역' },
    {
      key: 'createdAt',
      label: '가입일',
      render: (v) => v?.slice(0, 10),
    },
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
      <h1 className="text-xl font-bold text-gray-900 mb-6">회원 관리</h1>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {!data ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table columns={columns} rows={data.content} onAction={handleAction} />
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          <div className="text-xs text-gray-400 mt-2 text-right">
            총 {data.totalElements.toLocaleString()}명
          </div>
        </>
      )}

      {confirm && (
        <ConfirmDialog
          message={`"${confirm.user.name}" 회원을 삭제할까요? 삭제하면 복구할 수 없습니다.`}
          onConfirm={confirmAction}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
