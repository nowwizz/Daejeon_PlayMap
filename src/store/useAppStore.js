import { reactive, computed } from 'vue'
import { PLACES } from '../data/places.js'

const state = reactive({
  searchQuery: '',
  categoryFilter: '전체',
  selectedPlaceId: null,
  selectedPlaceDetail: null,
  selectedNeighborPlace: null,
  sheetExpanded: false,
  chatOpen: false,
  sortMode: 'latest',
  sortMenuOpen: false,
  posts: [
    { id: 1, title: '한빛탑 야경 명당 아시는 분?', place: '한빛탑', content: '엑스포공원 쪽에서 사진찍기 좋은 자리 추천 부탁드려요!', password: '1234', date: '07.10', likes: 8, liked: false },
    { id: 2, title: '유성온천 근처 맛집 추천', place: '유성온천', content: '온천하고 나서 갈만한 식당 있을까요', password: '0000', date: '07.08', likes: 3, liked: false }
  ],
  nextPostId: 3,
  newPostOpen: false, newTitle: '', newPlace: '', newContent: '', newPassword: '',
  detailPostId: null, postActionType: null, actionPassword: '', actionError: false,
  editTitle: '', editPlace: '', editContent: '',
  chatMessages: [
    { from: 'bot', text: '안녕하세요! 대전 놀거리 챗봇이에요. 어떤 곳을 찾고 계신가요? (예: 자연, 맛집, 온천, 가족)' }
  ],
  chatInput: ''
})

const selectedPlace = computed(() => PLACES.find(p => p.id === state.selectedPlaceId) || null)

const nearbyPlaces = computed(() => {
  const cur = selectedPlace.value
  if (!cur) return []
  return PLACES.filter(p => p.id !== cur.id)
    .map(p => ({ ...p, d: Math.hypot(p.x - cur.x, p.y - cur.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
})

const filteredPlaces = computed(() => PLACES.filter(p =>
  (state.categoryFilter === '전체' || p.category === state.categoryFilter) &&
  (state.searchQuery === '' || p.name.includes(state.searchQuery) || p.area.includes(state.searchQuery) || p.desc.includes(state.searchQuery))
))

const visiblePosts = computed(() => {
  let list = state.posts.filter(p =>
    state.searchQuery === '' || p.title.includes(state.searchQuery) || p.place.includes(state.searchQuery) || p.content.includes(state.searchQuery)
  )
  if (state.sortMode === 'popular') list = [...list].sort((a, b) => b.likes - a.likes)
  return list
})

const detailPost = computed(() => state.posts.find(p => p.id === state.detailPostId) || null)

function openPlace(id) { state.selectedPlaceId = id }
function closePlace() { state.selectedPlaceId = null }
function openPlaceDetail(place) { state.selectedPlaceDetail = place; state.sheetExpanded = true }
function closePlaceDetail() { state.selectedPlaceDetail = null}
function openPlaceFromNeighbor(contentid) { state.selectedNeighborPlace = contentid }
function toggleSheet() { state.sheetExpanded = !state.sheetExpanded }
function collapseSheet() { state.sheetExpanded = false }
function toggleChat() { state.chatOpen = !state.chatOpen }
function toggleSortMenu() { state.sortMenuOpen = !state.sortMenuOpen }
function selectSort(mode) { state.sortMode = mode; state.sortMenuOpen = false }

function toggleLike(id) {
  const post = state.posts.find(p => p.id === id)
  if (!post) return
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

function toggleNewPost() {
  state.newPostOpen = !state.newPostOpen
  state.newTitle = ''; state.newPlace = ''; state.newContent = ''; state.newPassword = ''
}

function submitPost() {
  if (!state.newTitle.trim() || !state.newContent.trim() || !state.newPassword.trim()) return
  state.posts.unshift({
    id: state.nextPostId, title: state.newTitle, place: state.newPlace || '장소 미지정',
    content: state.newContent, password: state.newPassword, date: '오늘', likes: 0, liked: false
  })
  state.nextPostId++
  toggleNewPost()
}

function openDetail(id) { state.detailPostId = id; state.postActionType = null; state.actionPassword = ''; state.actionError = false }
function closeDetail() { state.detailPostId = null; state.postActionType = null }

function startEdit() {
  const p = detailPost.value
  if (!p) return
  state.postActionType = 'edit'; state.editTitle = p.title; state.editPlace = p.place; state.editContent = p.content
  state.actionPassword = ''; state.actionError = false
}
function startDelete() { state.postActionType = 'delete'; state.actionPassword = ''; state.actionError = false }
function cancelAction() { state.postActionType = null; state.actionPassword = ''; state.actionError = false }

function confirmEdit() {
  const p = detailPost.value
  if (p && p.password === state.actionPassword) {
    p.title = state.editTitle; p.place = state.editPlace; p.content = state.editContent
    cancelAction()
  } else state.actionError = true
}

function confirmDelete() {
  const p = detailPost.value
  if (p && p.password === state.actionPassword) {
    state.posts = state.posts.filter(x => x.id !== p.id)
    closeDetail()
  } else state.actionError = true
}

function botReply(text) {
  const t = text.toLowerCase()
  if (t.includes('자연') || t.includes('숲') || t.includes('산')) return '장태산자연휴양림이나 대청호 오백리길을 추천드려요.'
  if (t.includes('맛집') || t.includes('빵') || t.includes('먹')) return '성심당 본점은 필수 코스예요! 소제동 카페거리도 함께 들러보세요.'
  if (t.includes('온천') || t.includes('힐링') || t.includes('휴식')) return '유성온천이나 계족산 황토길에서 여유롭게 힐링해보세요.'
  if (t.includes('가족') || t.includes('아이') || t.includes('놀이')) return '아이와 함께라면 대전오월드가 좋아요.'
  if (t.includes('역사') || t.includes('전시') || t.includes('문화')) return '대전근현대사전시관이나 뿌리공원을 추천해요.'
  return '한빛탑, 성심당 본점, 대전오월드가 요즘 가장 인기예요. 지도에서 위치도 확인해보세요!'
}

function sendChat() {
  const text = state.chatInput.trim()
  if (!text) return
  state.chatMessages.push({ from: 'user', text })
  state.chatInput = ''
  const reply = botReply(text)
  setTimeout(() => state.chatMessages.push({ from: 'bot', text: reply }), 450)
}

// 모듈 스코프 싱글턴 — 어디서 호출해도 같은 상태를 공유합니다 (Pinia 없이 구현한 경량 스토어)
export function useAppStore() {
  return {
    state, selectedPlace, nearbyPlaces, filteredPlaces, visiblePosts, detailPost,
    openPlace, closePlace, openPlaceDetail, closePlaceDetail, openPlaceFromNeighbor, toggleSheet, collapseSheet, toggleChat,
    toggleSortMenu, selectSort, toggleLike, toggleNewPost, submitPost,
    openDetail, closeDetail, startEdit, startDelete, cancelAction, confirmEdit, confirmDelete,
    sendChat
  }
}
