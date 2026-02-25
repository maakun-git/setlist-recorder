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

    const buttonArea = document.getElementById("buttonArea");

    document.getElementById("sortJson").onclick = () => setSortMode("json");
    document.getElementById("sortKana").onclick = () => setSortMode("kana");

    songsTab.addEventListener("click", () => {
        updateTabUI("songs");
        songsTab.classList.add("active");
        otherTab.classList.remove("active");

        songsArea.style.display = "block";
        otherArea.style.display = "none";

        buttonArea.classList.remove("other-mode");
    });

    otherTab.addEventListener("click", () => {
        updateTabUI("other");
        otherTab.classList.add("active");
        songsTab.classList.remove("active");

        songsArea.style.display = "none";
        otherArea.style.display = "block";

        buttonArea.classList.add("other-mode");
    });

    // Otherボタン
    document.querySelectorAll(".other-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            controller.handleOther(type);
        });
    });

    // フリーワード追加
    document.getElementById("freeWordAddBtn")
        .addEventListener("click", () => {
            const input = document.getElementById("freeWordInput");
            const text = input.value.trim();
            if (!text) return;

            controller.handleFreeWord(text);
            input.value = "";
        });

    document.getElementById("freeWordInput")
        .addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                document.getElementById("freeWordAddBtn").click();
            }
        });

    const songFreeInput = document.getElementById("songFreeInput");
    const songFreeAddBtn = document.getElementById("songFreeAddBtn");

    songFreeAddBtn.addEventListener("click", () => {
        const value = songFreeInput.value.trim();
        if (!value) return;

        controller.handleSongClick(value);

        songFreeInput.value = "";
    });

    songFreeInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            songFreeAddBtn.click();
        }
    });

    // ソート状態読み込み
    AppState.sortMode = localStorage.getItem("sortMode") || "json";

    // UI反映
    updateSortButtons();

    // 曲タブを初期表示する場合
    updateTabUI("songs");

    controller.initApp();
}

function updateSortButtons() {
    const jsonBtn = document.getElementById("sortJson");
    const kanaBtn = document.getElementById("sortKana");
    console.log(AppState.sortMode);
    jsonBtn.classList.toggle("active", AppState.sortMode === "json");
    kanaBtn.classList.toggle("active", AppState.sortMode === "kana");
}

export function renderAll() {
    renderArtistSelect();
    renderSongs();
    renderSetlist();
    renderHashtags();
}

export function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
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

function updateTabUI(activeTab) {
    const controls = document.getElementById("songControls");

    if (activeTab === "songs") {
        controls.classList.remove("hidden");
    } else {
        controls.classList.add("hidden");
    }
}

function sortSongs(list, mode) {
    if (mode === "kana") {
        return [...list].sort((a, b) =>
            a.yomi.localeCompare(b.yomi, "ja")
        );
    }
    return list; // json順
}

function setSortMode(mode) {
    AppState.sortMode = mode;
    localStorage.setItem("sortMode", mode);

    document.getElementById("sortJson").classList.toggle("active", mode === "json");
    document.getElementById("sortKana").classList.toggle("active", mode === "kana");

    renderSongs();
}

function renderSongs() {
    const div = document.getElementById("songs");
    div.innerHTML = "";

    const sorted = sortSongs(AppState.songs, AppState.sortMode);

    sorted.forEach(song => {
        const btn = document.createElement("button");
        btn.textContent = song.title;
        btn.className = "song-btn";
        btn.onclick = () => controllerRef.handleSongClick(song.title);
        div.appendChild(btn);
    });
}

function renderSetlist() {
    const listDiv = document.getElementById("list");

    let songNumber = 0;

    const html = AppState.setlist.map(item => {

        if (!item.type || item.type === "song") {
            songNumber++;
            return `<div class="song-line">${songNumber}. ${item.name}</div>`;
        }

        if (item.type === "encore") {
            return `<div class="encore-line">★ ${item.name}</div>`;
        }

        if (item.type === "medley-start") {
            return `<div class="medley-start">─── ${item.name} ───</div>`;
        }

        if (item.type === "medley-end") {
            return `<div class="medley-end">─── ${item.name} ───</div>`;
        }

        // MC / special / free など
        return `<div class="other-line">${item.name}</div>`;

    }).join("");

    listDiv.innerHTML = html;
}

function renderHashtags() {
    const input = document.getElementById("hashtags");
    if (!input) return;

    input.value = AppState.hashtags
        .map(tag => `${tag}`)
        .join(" ");
}
