import { useEffect, useState } from 'react'
import api from '../api/client'
import { Table } from '../components/Table'
import Badge from '../components/Badge'

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState(null)
  const [filter, setFilter] = useState('false')
  const [error, setError] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState(null)

  async function load() {
    try {
      const params = filter !== '' ? { approved: filter } : {}
      const r = await api.get('/admin/buildings', { params })
      setBuildings(r.data.data)
      setError('')
    } catch (e) {
      setError(e.response?.data?.error || '불러오기 실패')
    }
  }

  useEffect(() => { load() }, [filter])

  async function approve(id) {
    try {
      await api.put(`/admin/buildings/${id}/approve`)
      load()
    } catch (e) {
      alert(e.response?.data?.error || '처리 실패')
    }
  }

  async function reject(id) {
    try {
      await api.put(`/admin/buildings/${id}/reject`)
      load()
    } catch (e) {
      alert(e.response?.data?.error || '처리 실패')
    }
  }

  const columns = [
    { key: 'name',    label: '건물명' },
    { key: 'address', label: '주소', render: (v) => <span className="max-w-xs block truncate">{v}</span> },
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
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSelectedBuilding(row)}
            className="px-2.5 py-1 text-xs rounded border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            상세 보기
          </button>
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
              className="px-2.5 py-1 text-xs rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
            >
              승인 취소
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">건물 승인</h1>
        <div className="flex gap-2">
          {[
            { value: 'false', label: '대기중' },
            { value: 'true',  label: '승인됨' },
            { value: '',      label: '전체' },
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
      {!buildings ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <Table columns={columns} rows={buildings} />
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
                              <a key={idx} href={url} target="_blank" rel="noreferrer" className="block relative group">
                                <img src={url} alt={`${dong.name} 도면 ${idx + 1}`} className="w-32 h-32 object-cover rounded-md border border-gray-300" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
                                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium drop-shadow-md">크게 보기</span>
                                </div>
                              </a>
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
              {!selectedBuilding.approved && (
                <button
                  onClick={() => { approve(selectedBuilding.id); setSelectedBuilding(null); }}
                  className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
                >
                  건물 승인하기
                </button>
              )}
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
