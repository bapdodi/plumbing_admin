# plumbing_admin

설비 구인구직 앱 **"설비구함"** 의 관리자 웹 — **React 18 · Vite · Tailwind CSS**

회원·일감·게시글 관리와 업체/도면 승인, 신고·문의 처리를 담당하는 운영용 대시보드입니다.

## 시스템 구성

전체 서비스는 3개 저장소로 구성되며, 이 저장소는 그중 관리자 웹입니다.

| 서비스 | 역할 | 저장소 |
| --- | --- | --- |
| backend | REST API (Spring Boot · PostgreSQL) | 비공개 |
| app | 사용자 앱 (Flutter) | 비공개 |
| **plumbing_admin** | 관리자 웹 | (이 저장소) |

## 주요 기능

- **대시보드** — `/admin/stats` 기반 7개 지표 카드(전체 회원·일감·게시글, 승인 대기 업체·동(도면), 미처리 신고, 답변 대기 문의). 대기 건이 있으면 경고색으로 강조되고, 카드를 누르면 해당 관리 페이지로 이동합니다.
- **승인 워크플로** — 업체와 동(평면도)을 대기중/승인됨 필터로 조회하고 승인·승인 취소 처리합니다.
- **신고 처리** — 상태(대기중/처리됨/무시됨) 필터로 신고를 조회하고 조치 완료·무시로 처리합니다.
- **문의 관리** — 문의에 답변을 등록합니다 (`/admin/inquiries/:id/answer`).
- **회원·일감·게시글·건물 관리** — 목록 조회(페이지네이션)와 삭제(확인 다이얼로그 포함).

## 핵심 설계

- **토큰 자동 갱신 (single-flight)** — `api/client.js` 인터셉터가 401/403 응답 시 refresh 토큰으로 액세스 토큰을 1회 자동 갱신 후 원 요청을 재시도합니다. 동시에 여러 요청이 실패해도 갱신 요청은 하나만 나가도록 진행 중인 프로미스를 공유하고, 갱신 실패 시 토큰을 지우고 로그인 페이지로 보냅니다.
- **로그인 단계 권한 검증** — 로그인 API는 일반 유저도 통과하므로, 로그인 직후 관리자 전용 API(`/admin/stats`)를 `_skipAuthHandling` 플래그로 호출해 관리자 권한이 없는 계정을 로그인 단계에서 차단합니다.
- **AuthImage** — 브라우저 `<img src>`는 Authorization 헤더를 싣지 못하므로, 인증이 필요한 이미지 프록시(`/api/files?key=...`)를 axios로 blob 수신 후 object URL로 표시합니다. 클릭 시 원본을 새 탭으로 여는 옵션을 지원합니다 (도면 확대 확인용).
- **라우트 가드** — 토큰이 없으면 전 페이지를 `/login`으로 리다이렉트하는 `RequireAuth` 래퍼로 보호합니다.
- **공용 컴포넌트** — `Table`(컬럼 정의 기반 렌더링 + 페이지네이션) · `Badge` · `ConfirmDialog`로 페이지 코드를 얇게 유지합니다.

## 기술 스택

React 18 · Vite 5 · Tailwind CSS 3 · axios · react-router-dom 6 · Vercel

## 실행

```bash
npm install
npm run dev   # localhost:3100, /api → localhost:8080 프록시
```

- 개발: Vite proxy가 `/api` 요청을 로컬 백엔드(`localhost:8080`)로 전달합니다.
- 프로덕션: Vercel 배포(`vercel.json` — SPA rewrite 포함). 환경변수 `VITE_API_URL`에 백엔드 API 주소(`/api` 포함)를 설정합니다.
