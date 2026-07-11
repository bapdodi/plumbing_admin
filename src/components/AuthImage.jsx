import { useEffect, useState } from 'react'
import api from '../api/client'

// 모듈 레벨 캐시: src → objectURL. 리스트 재렌더/재오픈 시 같은 이미지를 다시 받지 않는다.
// Map 은 삽입 순서를 유지하므로 간단한 LRU 로 쓰고, 밀려난 항목의 objectURL 은 revoke 한다.
const CACHE_MAX = 100
const urlCache = new Map()     // src → objectURL
const inflight = new Map()     // src → Promise<objectURL> (동일 src 동시 요청 합치기)

function fetchObjectUrl(src) {
  if (urlCache.has(src)) {
    const url = urlCache.get(src)
    urlCache.delete(src)
    urlCache.set(src, url) // LRU 갱신
    return Promise.resolve(url)
  }
  if (inflight.has(src)) return inflight.get(src)

  // 프록시 URL 은 /api/files?key=<encoded> 형태. key 를 디코드해 axios params 로 넘기면
  // baseURL(.../api)과 중복(/api/api) 없이 안전하게 인코딩되어 호출된다.
  const qIndex = src.indexOf('?')
  const key = new URLSearchParams(qIndex >= 0 ? src.slice(qIndex + 1) : '').get('key')
  const request = key
    ? api.get('/files', { params: { key }, responseType: 'blob' })
    : api.get(src.startsWith('/api/') ? src.slice(4) : src, { responseType: 'blob' })

  const promise = request
    .then((res) => {
      const url = URL.createObjectURL(res.data)
      urlCache.set(src, url)
      if (urlCache.size > CACHE_MAX) {
        const oldest = urlCache.keys().next().value
        URL.revokeObjectURL(urlCache.get(oldest))
        urlCache.delete(oldest)
      }
      return url
    })
    .finally(() => { inflight.delete(src) })
  inflight.set(src, promise)
  return promise
}

/**
 * 인증 프록시(/api/files?key=...) 이미지를 토큰을 실어 받아 blob 으로 표시한다.
 * 브라우저의 <img src>/<a href> 는 Authorization 헤더를 못 싣기 때문에 필요하다.
 *
 * - openOnClick: 클릭 시 받아온 blob 을 새 탭으로 연다(원본 크게 보기).
 * - anchorClassName / children: openOnClick 일 때 감싸는 <a> 의 클래스와 오버레이.
 */
export default function AuthImage({
  src,
  alt = '',
  className = '',
  openOnClick = false,
  anchorClassName = '',
  children,
}) {
  const [objUrl, setObjUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) return
    let cancelled = false
    setObjUrl(null)
    setFailed(false)

    fetchObjectUrl(src)
      .then((url) => {
        if (!cancelled) setObjUrl(url)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    // objectURL 은 캐시가 소유하므로 언마운트 시 revoke 하지 않는다(상태 반영만 취소).
    return () => {
      cancelled = true
    }
  }, [src])

  if (failed) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-300 text-xs`}>
        !
      </div>
    )
  }
  if (!objUrl) {
    return <div className={`${className} bg-gray-100 animate-pulse`} />
  }

  const img = <img src={objUrl} alt={alt} className={className} />
  if (!openOnClick) return img
  return (
    <a href={objUrl} target="_blank" rel="noreferrer" className={anchorClassName}>
      {img}
      {children}
    </a>
  )
}
