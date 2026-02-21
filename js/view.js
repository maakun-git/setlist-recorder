import { AppState } from "./state.js";

let controllerRef = null;


export function initView(controller) {
    controllerRef = controller;

    document.getElementById("undoBtn")
        .addEventListener("click", () => controller.handleUndo());

    document.getElementById("copyBtn")
        .addEventListener("click", () => controller.handleCopy());

    document.getElementById("clearBtn")
        .addEventListener("click", () => controller.handleClear());

    const menu = document.getElementById("menu");
    document.getElementById("menuBtn")
            .addEventListener("click", () => {
                const isOpen = menu.style.display === "block";
                menu.style.display = isOpen ? "none" : "block";
            });

    document.getElementById("menuCloseBtn")
            .addEventListener("click", () => controller.handleMenuClose());

    const songsTab = document.getElementById("songsTab");
    const otherTab = document.getElementById("otherTab");
    const songsArea = document.getElementById("songsArea");
    const otherArea = document.getElementById("otherArea");

    songsTab.addEventListener("click", () => {
      songsTab.classList.add("active");
      otherTab.classList.remove("active");
      songsArea.style.display = "block";
      otherArea.style.display = "none";
    });

    otherTab.addEventListener("click", () => {
      otherTab.classList.add("active");
      songsTab.classList.remove("active");
      songsArea.style.display = "none";
      otherArea.style.display = "block";
    });

  controller.initApp();
}

export function renderAll() {
  renderArtistSelect();
  renderSongs();
  renderSetlist();
  renderHashtags();
}

function renderArtistSelect() {
  const select = document.getElementById("artistSelect");
  select.innerHTML = "";

  AppState.artists.forEach(a => {
    const option = document.createElement("option");
    option.value = a.file;
    option.textContent = a.name;
    select.appendChild(option);
  });

  select.value = AppState.currentArtist;
  select.onchange = () => controllerRef.changeArtist(select.value);
}

function renderSongs() {
  const div = document.getElementById("songs");
  div.innerHTML = "";

  AppState.songs.forEach(song => {
    const btn = document.createElement("button");
    btn.textContent = song;
    btn.onclick = () => controllerRef.handleSongClick(song);
    div.appendChild(btn);
  });
}

function renderSetlist() {
    const listDiv = document.getElementById("list");
    listDiv.innerHTML = AppState.setlist
        .map((s, i) => `${i + 1}. ${s.name}`)
        .join("<br>");
}

function renderHashtags() {
  const input = document.getElementById("hashtags");
  if (!input) return;

    input.value = AppState.hashtags
        .map(tag => `${tag}`)
        .join(" ");
}
