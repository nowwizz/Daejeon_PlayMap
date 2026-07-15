import { reactive, computed, nextTick } from "vue";
import { PLACES } from "../data/places.js";
import { POST_CATEGORIES, postCatStyle } from "../theme.js";

const API_BASE_URL = "https://localhub-2rq6.onrender.com/api";
const CHAT_STORAGE_KEY = "daejeon-playmap-chat";
const LIKED_POSTS_STORAGE_KEY = "daejeon-playmap-liked-posts";

function loadLikedPostIds() {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(LIKED_POSTS_STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.error("좋아요 상태 로딩 실패", error);
    return new Set();
  }
}

function persistLikedPostIds() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LIKED_POSTS_STORAGE_KEY,
      JSON.stringify([...likedPostIds]),
    );
  } catch (error) {
    console.error("좋아요 상태 저장 실패", error);
  }
}

const likedPostIds = loadLikedPostIds();

function loadStoredChatMessages() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error("채팅 기록 로딩 실패", error);
    return null;
  }
}

function persistChatMessages() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state.chatMessages));
  } catch (error) {
    console.error("채팅 기록 저장 실패", error);
  }
}

const initialChatMessages = loadStoredChatMessages() || [
  {
    from: "bot",
    text: "안녕하세요! 대전 놀거리 챗봇 꿈돌이에요.\n 알고 싶으신 놀거리에 대해 물어봐 주세요!",
  },
];

const state = reactive({
  searchQuery: "",
  categoryFilter: "전체",
  mapCenter: null,
  mapPlaces: [],
  selectedPlaceId: null,
  selectedPlaceDetail: null,
  selectedNeighborPlace: null,
  sheetExpanded: false,
  chatOpen: false,
  sortMode: "latest",
  sortMenuOpen: false,
  posts: [],
  nextPostId: 3,
  newPostOpen: false,
  newTitle: "",
  newPlace: "",
  newContent: "",
  newPassword: "",
  newCategory: "",
  detailPostId: null,
  postActionType: null,
  actionPassword: "",
  actionError: false,
  editTitle: "",
  editPlace: "",
  editContent: "",
  editCategory: "",
  chatMessages: initialChatMessages,
  chatInput: "",
  chatStreaming: false,
});

const selectedPlace = computed(
  () => PLACES.find((p) => p.id === state.selectedPlaceId) || null,
);

const nearbyPlaces = computed(() => {
  const cur = selectedPlace.value;
  if (!cur) return [];
  return PLACES.filter((p) => p.id !== cur.id)
    .map((p) => ({ ...p, d: Math.hypot(p.x - cur.x, p.y - cur.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
});

const filteredPlaces = computed(() =>
  PLACES.filter(
    (p) =>
      (state.categoryFilter === "전체" ||
        p.category === state.categoryFilter) &&
      (state.searchQuery === "" ||
        p.name.includes(state.searchQuery) ||
        p.area.includes(state.searchQuery) ||
        p.desc.includes(state.searchQuery)),
  ),
);

const distanceSortedPlaces = computed(() => {
  const basePlaces =
    Array.isArray(state.mapPlaces) && state.mapPlaces.length > 0
      ? state.mapPlaces
      : filteredPlaces.value

  const center = state.mapCenter

  if (!center) {
    return basePlaces
  }

  const toRad = (degree) => degree * (Math.PI / 180)

  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const earthRadiusKm = 6371
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return earthRadiusKm * c
  }

  return [...basePlaces].sort((a, b) => {
    const aLat = Number(a.mapy)
    const aLng = Number(a.mapx)
    const bLat = Number(b.mapy)
    const bLng = Number(b.mapx)

    const aDist = Number.isFinite(aLat) && Number.isFinite(aLng)
      ? getDistanceKm(center.lat, center.lng, aLat, aLng)
      : Number.POSITIVE_INFINITY

    const bDist = Number.isFinite(bLat) && Number.isFinite(bLng)
      ? getDistanceKm(center.lat, center.lng, bLat, bLng)
      : Number.POSITIVE_INFINITY

    return aDist - bDist
  })
})

const visiblePosts = computed(() => {
  let list = state.posts.filter(
    (p) =>
      state.searchQuery === "" ||
      p.title.includes(state.searchQuery) ||
      p.place.includes(state.searchQuery) ||
      p.content.includes(state.searchQuery),
  );
  if (state.sortMode === "popular") {
    list = [...list].sort((a, b) => b.likes - a.likes);
  } else if (state.sortMode === "views") {
    list = [...list].sort((a, b) => b.views - a.views);
  }
  return list;
});

const detailPost = computed(
  () => state.posts.find((p) => p.id === state.detailPostId) || null,
);

function mapPostFromApi(item) {
  return {
    id: item.id,
    title: item.title,
    place: item.place,
    category: item.category,
    content: item.content,
    password: "",
    date: (item.created_at || "").slice(0, 16).replace("T", " "),
    likes: item.like_count ?? 0,
    isLiked: likedPostIds.has(item.id),
    views: item.view_count ?? 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

async function fetchPosts() {
  try {
    const params = new URLSearchParams();
    if (state.categoryFilter !== "전체")
      params.append("category", state.categoryFilter);
    if (state.searchQuery) params.append("q", state.searchQuery);
    if (state.sortMode === "popular") params.append("sort_by", "likes");
    if (state.sortMode === "views") params.append("sort_by", "views");
    params.append("limit", "50");

    const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);
    if (!response.ok) throw new Error("게시글을 불러오지 못했습니다.");

    const data = await response.json();
    state.posts = Array.isArray(data) ? data.map(mapPostFromApi) : [];
  } catch (error) {
    console.error(error);
    state.posts = [];
  }
}

function openPlace(id) {
  state.selectedPlaceId = id;
}
function closePlace() {
  state.selectedPlaceId = null;
}
function openPlaceDetail(place) {
  state.selectedPlaceDetail = place;
  state.sheetExpanded = true;
}
function closePlaceDetail() {
  state.selectedPlaceDetail = null;
}
function openPlaceFromNeighbor(contentid) {
  state.selectedNeighborPlace = contentid;
}
function toggleSheet() {
  state.sheetExpanded = !state.sheetExpanded;
}
function collapseSheet() {
  state.sheetExpanded = false;
}
function toggleChat() {
  state.chatOpen = !state.chatOpen;
}
function toggleSortMenu() {
  state.sortMenuOpen = !state.sortMenuOpen;
}
function selectSort(mode) {
  state.sortMode = mode;
  state.sortMenuOpen = false;
  fetchPosts();
}

function setMapCenter(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return;
  }

  state.mapCenter = {
    lat: Number(lat),
    lng: Number(lng),
  };
}

function setMapPlaces(places) {
  state.mapPlaces = Array.isArray(places) ? places : [];
function triggerLikeAnimation(post) {
  post.animating = false;
  const token = (post._animToken = (post._animToken || 0) + 1);
  nextTick(() => {
    if (post._animToken !== token) return;
    post.animating = true;
    setTimeout(() => {
      if (post._animToken === token) post.animating = false;
    }, 500);
  });
}

function toggleLike(id) {
  const post = state.posts.find((p) => p.id === id);
  if (!post) return;

  const nowLiked = !likedPostIds.has(id);
  if (nowLiked) {
    likedPostIds.add(id);
  } else {
    likedPostIds.delete(id);
  }
  persistLikedPostIds();

  post.isLiked = nowLiked;
  post.likes += nowLiked ? 1 : -1;
  triggerLikeAnimation(post);

  fetch(`${API_BASE_URL}/posts/${id}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data && typeof data.like_count === "number") {
        post.likes = data.like_count;
      }
    })
    .catch((error) => console.error(error));
}

function setCategoryFilter(category) {
  state.categoryFilter = category;
  fetchPosts();
}

function loadPosts() {
  fetchPosts();
}

function toggleNewPost() {
  state.newPostOpen = !state.newPostOpen;
  state.newTitle = "";
  state.newPlace = "";
  state.newContent = "";
  state.newPassword = "";
  state.newCategory = "";
}

async function submitPost() {
  if (
    !state.newTitle.trim() ||
    !state.newContent.trim() ||
    !state.newPassword.trim()
  )
    return;

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: state.newTitle.trim(),
        place: state.newPlace.trim() || "",
        content: state.newContent.trim(),
        category: state.newCategory || "자유",
        password: state.newPassword.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "게시글 생성에 실패했습니다.");
    }

    await fetchPosts();
    toggleNewPost();
  } catch (error) {
    console.error(error);
  }
}

async function openDetail(id) {
  state.detailPostId = id;
  state.postActionType = null;
  state.actionPassword = "";
  state.actionError = false;

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    if (!response.ok)
      throw new Error("게시글 상세 정보를 불러오지 못했습니다.");

    const item = await response.json();
    const mapped = mapPostFromApi(item);
    const current = state.posts.find((p) => p.id === id);

    if (current) {
      Object.assign(current, mapped);
      state.posts = [...state.posts];
    } else {
      state.posts = [mapped, ...state.posts];
    }

    const detail = state.posts.find((p) => p.id === id);
    if (detail) {
      detail.views = mapped.views;
      detail.content = mapped.content;
      detail.likes = mapped.likes;
      detail.isLiked = mapped.isLiked;
      detail.date = mapped.date;
      detail.category = mapped.category;
      detail.place = mapped.place;
      detail.title = mapped.title;
    }
  } catch (error) {
    console.error(error);
  }
}

function closeDetail() {
  state.detailPostId = null;
  state.postActionType = null;
}

function startEdit() {
  const p = detailPost.value;
  if (!p) return;
  state.postActionType = "edit";
  state.editTitle = p.title;
  state.editPlace = p.place;
  state.editContent = p.content;
  state.editCategory = p.category || "자유";
  state.actionPassword = "";
  state.actionError = false;
}
function startDelete() {
  state.postActionType = "delete";
  state.actionPassword = "";
  state.actionError = false;
}
function cancelAction() {
  state.postActionType = null;
  state.actionPassword = "";
  state.actionError = false;
}

async function confirmEdit() {
  const p = detailPost.value;
  if (!p) return;

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: state.actionPassword.trim(),
        title: state.editTitle.trim(),
        place: state.editPlace.trim(),
        content: state.editContent.trim(),
        category: state.editCategory || "자유",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "게시글 수정에 실패했습니다.");
    }

    await fetchPosts();
    cancelAction();
    closeDetail();
  } catch (error) {
    state.actionError = true;
    console.error(error);
  }
}

async function confirmDelete() {
  const p = detailPost.value;
  if (!p) return;

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${p.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: state.actionPassword.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "게시글 삭제에 실패했습니다.");
    }

    await fetchPosts();
    closeDetail();
  } catch (error) {
    state.actionError = true;
    console.error(error);
  }
}

function buildChatHistory() {
  return state.chatMessages
    .filter((msg) => msg.text && msg.text.trim() !== "")
    .map((msg) => ({
      role: msg.from === "user" ? "user" : "assistant",
      content: msg.text,
    }));
}

async function sendChat() {
  const text = state.chatInput.trim();
  if (!text) return;

  state.chatMessages.push({ from: "user", text });
  persistChatMessages();

  const botMessageIndex = state.chatMessages.length;
  state.chatMessages.push({ from: "bot", text: "", sources: [] });
  persistChatMessages();

  state.chatInput = "";
  state.chatStreaming = true;

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: buildChatHistory(),
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error("챗봇 응답을 받지 못했습니다.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const processChunk = (chunk) => {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      lines.forEach((line) => {
        if (!line.startsWith("data: ")) return;

        const dataStr = line.slice(6).trim();
        if (!dataStr || dataStr === "[DONE]") return;

        try {
          const data = JSON.parse(dataStr);
          if (data.type === "content" && typeof data.text === "string") {
            state.chatMessages[botMessageIndex].text += data.text;
            persistChatMessages();
          } else if (data.type === "metadata" && Array.isArray(data.sources)) {
            state.chatMessages[botMessageIndex].sources = [
              ...new Set(
                data.sources.map((s) => s.source).filter(Boolean),
              ),
            ];
            persistChatMessages();
          }
        } catch (error) {
          console.error("챗봇 스트림 파싱 실패", error);
        }
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      processChunk(value);
    }

    processChunk(new Uint8Array());
    persistChatMessages();
  } catch (error) {
    state.chatMessages[botMessageIndex].text =
      `\n\n**[시스템 알림]** 챗봇 응답 생성 중 오류가 발생했습니다: ${error.message}`;
    persistChatMessages();
    console.error(error);
  } finally {
    state.chatStreaming = false;
  }
}

// 모듈 스코프 싱글턴 — 어디서 호출해도 같은 상태를 공유합니다 (Pinia 없이 구현한 경량 스토어)
export function useAppStore() {
  return {
    state,
    selectedPlace,
    nearbyPlaces,
    filteredPlaces,
    distanceSortedPlaces,
    visiblePosts,
    detailPost,
    openPlace,
    closePlace,
    openPlaceDetail,
    closePlaceDetail,
    openPlaceFromNeighbor,
    setMapCenter,
    setMapPlaces,
    toggleSheet,
    collapseSheet,
    toggleChat,
    toggleSortMenu,
    selectSort,
    toggleLike,
    toggleNewPost,
    submitPost,
    openDetail,
    closeDetail,
    startEdit,
    startDelete,
    cancelAction,
    confirmEdit,
    confirmDelete,
    sendChat,
    fetchPosts,
    loadPosts,
    setCategoryFilter,
  };
}
