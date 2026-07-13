import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAdminList, runAction } from '../hooks/useAdminList'
import ConfirmDialog from '../components/ConfirmDialog'

export default function AppVersionPage() {
  const { data, error, reload } = useAdminList('/admin/app-version')
  const [minBuild, setMinBuild] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  // 서버 값이 도착하면 폼 초기값으로 채운다.
  useEffect(() => {
    if (!data) return
    setMinBuild(String(data.minSupportedBuild))
    setStoreUrl(data.storeUrl)
  }, [data])

  const parsedBuild = Number(minBuild)
  const dirty = data && (parsedBuild !== data.minSupportedBuild || storeUrl !== data.storeUrl)
  const raising = data && parsedBuild > data.minSupportedBuild

  function handleSubmit(e) {
    e.preventDefault()
    if (!Number.isInteger(parsedBuild) || parsedBuild < 1) {
      return alert('최소 지원 빌드번호는 1 이상의 정수여야 합니다.')
    }
    setConfirm(true)
  }

  async function save() {
    const ok = await runAction(
      () => api.put('/admin/app-version', {
        minSupportedBuild: parsedBuild,
        storeUrl: storeUrl.trim(),
      }),
      reload,
      '저장 실패',
    )
    if (ok) {
      setConfirm(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">앱 버전 관리</h1>

      <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800 leading-relaxed">
        <div className="font-semibold mb-1">⚠️ 반드시 스토어 배포를 먼저 끝내세요</div>
        새 버전이 플레이스토어에 올라가기 <b>전에</b> 기준을 올리면, 사용자는 차단됐는데 받을 새 버전이
        없어서 앱을 아예 못 쓰게 됩니다. 순서는 <b>①스토어 롤아웃 완료 → ②여기서 기준 상향</b> 입니다.
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {!data ? (
        <div className="text-center py-12 text-gray-400">로딩 중...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
            현재 기준: 빌드번호 <b className="text-gray-900">{data.minSupportedBuild}</b> 미만 차단
            {data.minSupportedBuild <= 1 && (
              <span className="ml-2 text-xs text-gray-400">(1 이하 = 아무도 차단되지 않음)</span>
            )}
            {data.updatedAt && (
              <div className="text-xs text-gray-400 mt-1">
                최근 변경 {data.updatedAt.slice(0, 10)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              최소 지원 빌드번호
            </label>
            <input
              type="number"
              min="1"
              value={minBuild}
              onChange={(e) => setMinBuild(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-40 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              pubspec.yaml 의 <code>version: 1.3.1+14</code> 에서 <code>+</code> 뒤 숫자입니다.
              이 값 <b>미만</b>인 앱이 차단되므로, 빌드 14 이하를 막으려면 <b>15</b> 를 넣으세요.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              스토어 주소
            </label>
            <input
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              차단된 사용자가 [업데이트하기] 를 눌렀을 때 열리는 주소입니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!dirty}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              저장
            </button>
            {saved && <span className="text-sm text-green-600">저장되었습니다.</span>}
          </div>
        </form>
      )}

      {confirm && (
        <ConfirmDialog
          message={
            raising
              ? `빌드번호 ${parsedBuild} 미만의 앱을 모두 차단할까요? 해당 사용자는 다음 실행부터 업데이트 화면만 보게 됩니다. 스토어에 새 버전이 이미 올라가 있는지 확인하세요.`
              : `앱 버전 정책을 저장할까요?`
          }
          onConfirm={save}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  )
}
