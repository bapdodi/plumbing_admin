import { useEffect, useState } from 'react'
import api from '../api/client'

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
    let created = null
    setObjUrl(null)
    setFailed(false)

    // 프록시 URL 은 /api/files?key=<encoded> 형태. key 를 디코드해 axios params 로 넘기면
    // baseURL(.../api)과 중복(/api/api) 없이 안전하게 인코딩되어 호출된다.
    const qIndex = src.indexOf('?')
    const key = new URLSearchParams(qIndex >= 0 ? src.slice(qIndex + 1) : '').get('key')
    const request = key
      ? api.get('/files', { params: { key }, responseType: 'blob' })
      : api.get(src.startsWith('/api/') ? src.slice(4) : src, { responseType: 'blob' })

    request
      .then((res) => {
        if (cancelled) return
        created = URL.createObjectURL(res.data)
        setObjUrl(created)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
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
