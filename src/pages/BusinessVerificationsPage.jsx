import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'
import AuthImage from '../components/AuthImage'

const STATUS = {
  PENDING:  { label: '대기중', variant: 'warning' },
  VERIFIED: { label: '인증됨', variant: 'success' },
  REJECTED: { label: '반려',   variant: 'danger' },
}

// 사업자등록증 사진 제출(MANUAL) 건을 심사한다. 국세청 자동 인증(NTS) 건은 조회만 한다.
// 사진은 공개 파일 프록시 밖이라 관리자 전용 엔드포인트로 받는다.
export default function BusinessVerificationsPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('PENDING')
  const { data, error, reload } = useAdminList('/admin/business-verifications/page', {
    page, size: 20, ...(filter !== '' && { status: filter }),
  })
  const rows = data?.content

  const approve = (id) =>
    runAction(() => api.put(`/admin/business-verifications/${id}/approve`), reload)
  const reject = (id) => {
    const reason = window.prompt('반려 사유 (사용자에게 알림으로 전달됩니다)', '사업자등록증 정보와 입력 내용이 달라요')
    if (reason === null) return
    runAction(() => api.put(`/admin/business-verifications/${id}/reject`, { reason }), reload)
  }

  const columns = [
    {
      key: 'companyName',
      label: '상호 / 신청자',
      render: (v, row) => (
        <div>
          <div className="font-semibold">{v}</div>
          <div className="text-xs text-gray-500">{row.userName} · {row.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'businessNumber',
      label: '사업자번호',
      render: (v) => v && `${v.slice(0, 3)}-${v.slice(3, 5)}-${v.slice(5)}`,
    },
    { key: 'representativeName', label: '대표자' },
    { key: 'openDate', label: '개업일' },
    {
      key: 'hasImage',
      label: '등록증',
      render: (has, row) => !has ? (
        <span className="text-gray-400 text-xs">없음</span>
      ) : (
        <AuthImage
          src={`/api/admin/business-verifications/${row.id}/image`}
          alt=""
          openOnClick
          className="w-10 h-10 object-cover rounded border border-gray-200 hover:opacity-80"
        />
      ),
    },
    { key: 'method', label: '방식', render: (v) => (v === 'NTS' ? '국세청 자동' : '사진 제출') },
    {
      key: 'status',
      label: '상태',
      render: (v, row) => (
        <div>
          <Badge label={STATUS[v]?.label ?? v} variant={STATUS[v]?.variant} />
          {row.rejectReason && <div className="text-xs text-gray-500 mt-1">{row.rejectReason}</div>}
        </div>
      ),
    },
    { key: 'createdAt', label: '신청일', render: (v) => v?.slice(0, 10) },
    {
      key: '_actions',
      label: '액션',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status !== 'VERIFIED' && (
            <button
              onClick={() => approve(row.id)}
              className="px-2.5 py-1 text-xs rounded border border-green-400 text-green-600 hover:bg-green-50 transition-colors"
            >
              승인
            </button>
          )}
          {row.status !== 'REJECTED' && (
            <button
              onClick={() => reject(row.id)}
              className="px-2.5 py-1 text-xs rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
            >
              {row.status === 'VERIFIED' ? '인증 취소' : '반려'}
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">사업자 인증</h1>
        <div className="flex gap-2">
          {[
            { value: 'PENDING',  label: '대기중' },
            { value: 'VERIFIED', label: '인증됨' },
            { value: 'REJECTED', label: '반려' },
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
      {!rows ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table columns={columns} rows={rows} />
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
