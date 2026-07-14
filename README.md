# 대전 놀거리 — Vue 3 SPA (JSX)

원본 디자인(`대전 놀거리.dc.html`)을 그대로 옮긴 Vue 3 + JSX 구현입니다. Vue CLI 없이 **Vite**로 빌드합니다.

## 실행 방법
```
cd vue-app
npm install
npm run dev
```

## 구조
```
src/
  main.jsx            앱 진입점
  router.js           vue-router 라우트 (/map, /community)
  theme.js             색상 토큰 + 카테고리 스타일 (초록 #00B398 / 노란색 #FFCC11 / 흰색)
  style.css            전역 리셋 + 키프레임 애니메이션
  data/places.js       놀거리 10곳 데이터 (좌표, 주소, 카테고리 포함)
  store/useAppStore.js 전역 상태 (모듈 스코프 reactive 싱글턴 — Pinia 없이 구현한 경량 스토어)
  App.jsx              공통 셸: 헤더 + 라우터 뷰 + 하단 내비 + 플로팅 버튼 + 전역 모달
  pages/
    MapPage.jsx         지도 탭 (검색, 카테고리 칩, 지도, 바텀시트)
    CommunityPage.jsx   정보 커뮤니티 탭 (검색+정렬, 게시글 목록)
  components/
    SearchBar.jsx        탭 공용 검색바 + (커뮤니티) 정렬 드롭다운
    BottomNav.jsx         하단 지도/정보 커뮤니티 내비게이션
    FloatingButtons.jsx   우측 하단 글쓰기(초록)/AI 챗봇(이미지) 버튼
    PlaceSheet.jsx        지도 위 "주변 놀거리" 바텀시트 (탭하면 펼침, 지도 배경 클릭 시 접힘, 리스트 자체 스크롤)
    PlaceDetailModal.jsx  장소 상세 모달 (주소 + 근처 추천 장소 3곳)
    PostDetailModal.jsx   게시글 상세/수정/삭제(비밀번호 확인) 모달
    NewPostModal.jsx      글쓰기 모달
    ChatModal.jsx         AI 챗봇 모달
```

## 상태 관리
Pinia 없이 `useAppStore.js`가 모듈 스코프의 `reactive()` 객체를 export하는 방식입니다. 어느 컴포넌트에서 `useAppStore()`를 호출해도 같은 상태를 참조합니다. 팀 컨벤션상 Pinia를 쓰고 싶다면 이 파일 하나만 `defineStore`로 바꿔주면 나머지 컴포넌트 코드는 그대로 동작합니다.

## 데이터는 목업입니다
게시글/좋아요/댓글수/비밀번호 확인은 모두 클라이언트 메모리 상태입니다. 실제 서비스에서는 `useAppStore.js`의 CRUD 함수들(`submitPost`, `confirmEdit`, `confirmDelete`, `toggleLike`)을 API 호출로 교체하면 됩니다.

## AI 아바타 이미지
`src/assets/ai-avatar.png`에 사용자가 첨부한 이미지를 넣어두었습니다. `FloatingButtons.jsx`의 `<img src="/src/assets/ai-avatar.png">`가 이를 참조합니다.

## 지도
현재는 스트라이프 패턴의 플레이스홀더입니다. 실제 서비스에서는 카카오맵/네이버지도 SDK 등을 붙이고, `PLACES`의 `x`/`y`(%) 좌표를 실제 위경도로 교체하면 됩니다.
