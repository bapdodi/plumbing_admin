import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'
import ConfirmDialog from '../components/ConfirmDialog'

const CATEGORY_LABELS = {
  // 앱이 저장하는 단수형 (PostCategory.name)
  tip: '팁', question: '질문', notice: '공지', free: '자유',
  // 하위호환: 혹시 복수형으로 저장된 데이터 대비
  tips: '팁', questions: '질문', notices: '공지',
}

export default function PostsPage() {
  const [page, setPage] = useState(0)
  const [confirm, setConfirm] = useState(null)
  const { data, error, reload } = useAdminList('/admin/posts', { page, size: 20 })

  async function handleAction(type, post) {
    if (type === 'delete') setConfirm({ type, post })
  }

  async function confirmAction() {
    if (await runAction(() => api.delete(`/admin/posts/${confirm.post.id}`), reload, '삭제 실패')) {
      setConfirm(null)
    }
  }

  const columns = [
    { key: 'title',         label: '제목', render: (v) => <span className="max-w-xs block truncate">{v}</span> },
    { key: 'authorName',    label: '작성자' },
    {
      key: 'category',
      label: '카테고리',
      render: (v) => <Badge label={CATEGORY_LABELS[v] || v} variant="info" />,
    },
    { key: 'likesCount',    label: '좋아요' },
    { key: 'commentsCount', label: '댓글' },
    { key: 'createdAt',     label: '작성일', render: (v) => v?.slice(0, 10) },
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
      <h1 className="text-xl font-bold text-gray-900 mb-6">게시글 관리</h1>

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
          message={`"${confirm.post.title}" 게시글을 삭제할까요?`}
          onConfirm={confirmAction}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
