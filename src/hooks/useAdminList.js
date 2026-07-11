import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

/**
 * 관리자 목록 페이지 공통 데이터 훅.
 * path 를 GET 해 응답의 data(배열 또는 Spring Page 객체)를 그대로 돌려주고,
 * params 가 바뀌면 자동으로 재조회한다. 조회 실패는 error 로 노출한다.
 */
export function useAdminList(path, params) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  // params 는 매 렌더마다 새 객체라 값 기준(JSON)으로 비교한다.
  const paramsKey = JSON.stringify(params ?? {})

  const load = useCallback(async () => {
    try {
      const r = await api.get(path, { params: JSON.parse(paramsKey) })
      setData(r.data.data)
      setError('')
    } catch (e) {
      setError(e.response?.data?.error || '불러오기 실패')
    }
  }, [path, paramsKey])

  useEffect(() => { load() }, [load])

  return { data, error, reload: load }
}

/**
 * 변경 액션(승인/삭제/답변 등) 공통 래퍼 — 성공 시 reload, 실패 시 alert.
 * 성공 여부를 반환하므로 다이얼로그 닫기 등 후처리에 쓸 수 있다.
 */
export async function runAction(fn, reload, failMsg = '처리 실패') {
  try {
    await fn()
    await reload()
    return true
  } catch (e) {
    alert(e.response?.data?.error || failMsg)
    return false
  }
}
