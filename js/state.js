// 状態管理モジュール
// 状態変更は必ず updateState 経由

export const AppState = {
  artists: [],
  currentArtist: null,
  songs: [],
  setlist: JSON.parse(localStorage.getItem("setlist") || "[]"),
  hashtags: [],
};

export function updateState(updater) {
  updater(AppState);
  localStorage.setItem("setlist", JSON.stringify(AppState.setlist));
}
