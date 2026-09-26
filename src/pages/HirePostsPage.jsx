import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'

const STATUS = {
  open: { label: '모집중', variant: 'success' },
  filled: { label: '마감', variant: 'info' },
  closed: { label: '종료', variant: 'gray' },
  removed: { label: '숨김', variant: 'danger' },
}

export default function HirePostsPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const { data, error, reload } = useAdminList('/admin/hire-posts/page', {
    page, size: 20, ...(status && { status }),
  })
  const columns = [
    { key: 'title', label: '공고' },
    { key: 'authorName', label: '작성자' },
    { key: 'location', label: '현장' },
    { key: 'dailyWage', label: '일당', render: (v) => `${v?.toLocaleString()}원` },
    { key: 'startDate', label: '근무일' },
    { key: 'status', label: '상태', render: (v) => <Badge label={STATUS[v]?.label ?? v} variant={STATUS[v]?.variant} /> },
    { key: 'description', label: '설명', render: (v) => <span title={v} className="block line-clamp-2 max-w-xs whitespace-normal">{v}</span> },
    { key: '_actions', label: '관리', render: (_, row) => row.status === 'removed'
      ? <button className="text-blue-600" onClick={() => runAction(() => api.put(`/admin/hire-posts/${row.id}/restore`), reload)}>숨김 해제</button>
      : <button className="text-red-600" onClick={() => {
          if (window.confirm('이 공고를 숨길까요?')) runAction(() => api.put(`/admin/hire-posts/${row.id}/remove`), reload)
        }}>숨기기</button> },
  ]
  return <div>
    <h1 className="text-xl font-bold mb-6">구인 공고 관리</h1>
    <div className="flex gap-2 mb-4">{[
      ['', '전체'], ['open', '모집중'], ['filled', '마감'], ['closed', '종료'], ['removed', '숨김'],
    ].map(([value, label]) => <button key={value} onClick={() => { setStatus(value); setPage(0) }}
      className={`px-3 py-1.5 rounded border ${status === value ? 'bg-primary text-white' : 'bg-white'}`}>{label}</button>)}</div>
    {error && <div className="text-red-500 mb-4">{error}</div>}
    <Table columns={columns} rows={data?.content ?? []} />
    {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}
  </div>
}
