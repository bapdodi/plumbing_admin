import { useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import { Table, Pagination } from '../components/Table'
import Badge from '../components/Badge'
import AuthImage from '../components/AuthImage'

export default function BuildingsPage() {
  const [page, setPage] = useState(0)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const { data, error, reload } = useAdminList('/admin/buildings/page', { page, size: 20 })
  const buildings = data?.content

  async function remove(id) {
    if (!window.confirm('정말로 이 건물을 삭제하시겠습니까? 관련 동 정보도 모두 삭제됩니다.')) return
    runAction(() => api.delete(`/admin/buildings/${id}`), reload, '삭제 실패')
  }

  const columns = [
    { key: 'name',    label: '건물명' },
    { key: 'address', label: '주소', render: (v) => <span className="max-w-xs block truncate">{v}</span> },
    { key: 'createdAt', label: '등록일', render: (v) => v?.slice(0, 10) },
    {
      key: '_actions',
      label: '액션',
      render: (_, row) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSelectedBuilding(row)}
            className="px-2.5 py-1 text-xs rounded border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            상세 보기
          </button>
          <button
            onClick={() => remove(row.id)}
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
        <h1 className="text-xl font-bold text-gray-900">건물 관리</h1>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      {!buildings ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <>
          <Table columns={columns} rows={buildings} />
          <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      {selectedBuilding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedBuilding.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedBuilding.address}</p>
              </div>
              <button onClick={() => setSelectedBuilding(null)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏗️</span> 등록된 동(도면) 목록
                <span className="text-sm font-normal text-gray-500">총 {selectedBuilding.dongs?.length || 0}개</span>
              </h3>
              
              {!selectedBuilding.dongs || selectedBuilding.dongs.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-500">아직 등록된 동(도면) 정보가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedBuilding.dongs.map((dong) => (
                    <div key={dong.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{dong.name}</span>
                        <Badge label={dong.approved ? '승인됨' : '대기중'} variant={dong.approved ? 'success' : 'warning'} />
                      </div>
                      <div className="p-4">
                        {!dong.imageUrls || dong.imageUrls.length === 0 ? (
                          <p className="text-sm text-gray-400">등록된 사진이 없습니다.</p>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {dong.imageUrls.map((url, idx) => (
                              <AuthImage
                                key={idx}
                                src={url}
                                alt={`${dong.name} 도면 ${idx + 1}`}
                                openOnClick
                                anchorClassName="block relative group"
                                className="w-32 h-32 object-cover rounded-md border border-gray-300"
                              >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
                                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium drop-shadow-md">크게 보기</span>
                                </div>
                              </AuthImage>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setSelectedBuilding(null)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
