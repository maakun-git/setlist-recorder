import { AppState, updateState } from "./state.js";
import { fetchJSON, sendAnalytics } from "./service.js";
import { renderAll } from "./view.js";

export class Controller {
  constructor(state) {
    this.state = state;
  }

  async initApp() {
    const artists = await fetchJSON("data/artists.json");

    updateState(state => {
      state.artists = artists;
      state.currentArtist = localStorage.getItem("artistFile") || artists[0].file;
    });

    await this.loadSongs(AppState.currentArtist);
    renderAll();
  }

  async loadSongs(file) {
    const songs = await fetchJSON(file);

    updateState(state => {
      state.songs = songs;
      state.currentArtist = file;
      const artist = state.artists.find(a => a.file === file);

      state.hashtags = artist?.defaultHashtags
        ? [...artist.defaultHashtags]
        : [];
        
        console.log("hashtags set to:", state.hashtags); 
      });

    localStorage.setItem("artistFile", file);
    renderAll();
  }

  changeArtist(file) {
    this.loadSongs(file);
    sendAnalytics("artist_change", { artist: file });
  }

  setBottomPadding(enable) {
  const listDiv = document.getElementById("list");

  if (!enable) {
    listDiv.style.paddingBottom = "0px";
    return;
  }

  const computedStyle = window.getComputedStyle(listDiv);
  let lineHeight = parseFloat(computedStyle.lineHeight);

  if (isNaN(lineHeight)) {
    const fontSize = parseFloat(computedStyle.fontSize);
    lineHeight = fontSize * 1.4;
  }

  listDiv.style.paddingBottom = lineHeight + "px";
}


  handleSongClick(name) {
    updateState(state => {
      state.setlist.push({
        name,
        time: new Date().toISOString(),
      });
    });

    sendAnalytics("song_click", {
      artist: AppState.currentArtist,
      song: name,
    });

    renderAll();
 
  this.setBottomPadding(false);

  const area = document.getElementById("setlistArea");
  area.scrollTop = area.scrollHeight;
}

  handleUndo() {
    if (AppState.setlist.length === 0) return;

    updateState(state => {
        state.setlist.pop();
    });

    this.setBottomPadding(true);
    renderAll();
  }

  handleClear() {
    if (!confirm("セトリを全削除しますか？")) return;

    updateState(state => {
      state.setlist = [];
    });
    renderAll();
  }

 handleCopy() {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const venue = document.getElementById("venue")?.value || "";
  const hashtags = document.getElementById("hashtags")?.value || "";

  const header = `【${mm}/${dd} @ ${venue}】`;

  const setlistText = AppState.setlist
    .map((s, i) => `${i + 1}. ${s.name}`)
    .join("\n");

  const fullText = [
    header,
    hashtags,
    "",
    setlistText
  ].join("\n");

  navigator.clipboard.writeText(fullText)
    .then(() => alert("コピーしました"))
    .catch(err => console.error(err));
}

  handleMenuClose() {
    document.getElementById("menu").style.display = "none";
  }

}
