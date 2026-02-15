let songList = [];
let setlist = JSON.parse(localStorage.getItem("setlist") || "[]");

async function loadSongs() {
  try {
    const response = await fetch("data/songs/theEncore.json?t=" + Date.now());

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}`);
    }

    songList = await response.json();
    createButtons();

  } catch (e) {
    console.error("読み込みエラー:", e);
    alert("曲リスト読み込み失敗:\n" + e.message);
  }
}

function formatDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function render() {
  const listDiv = document.getElementById("list");
  listDiv.innerHTML = "";

  setlist.forEach((item, i) => {
    listDiv.innerHTML += `${i + 1}. ${item.name}<br>`;
  });
}

function setBottomPadding(enable) {
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

function addSong(name) {
  setlist.push({ name, time: new Date().toISOString() });
  localStorage.setItem("setlist", JSON.stringify(setlist));
  render();

  setBottomPadding(false); // 余白なし

  // 曲追加時は最下部へスクロール
  const setlistArea = document.getElementById("setlistArea");
  setlistArea.scrollTop = setlistArea.scrollHeight;
}

function undo() {
  if (setlist.length === 0) return;

  setlist.pop();
  localStorage.setItem("setlist", JSON.stringify(setlist));
  setBottomPadding(true); // 余白あり

  render();
}

function formatDate() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}/${day}`;
}

function copySetlist() {
  if (setlist.length === 0) return;

  const venue = document.getElementById("venue").value.trim();
  const hashtags = document.getElementById("hashtags").value.trim();

  let text = "";

  // 1行目：日付＋会場（会場があれば @ 付き）
  if (venue !== "") {
    text += `【${formatDate()} @ ${venue}】\n`;
  } else {
    text += `【${formatDate()}】\n`;
  }

  // 2行目：ハッシュタグ（あれば）
  if (hashtags !== "") {
    text += `${hashtags}\n`;
  }

  text += `\n`;

  // 3行目以降：セトリ
  setlist.forEach((item, i) => {
    text += `${i + 1}. ${item.name}\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    alert("コピーしました！");
  });
}

function createButtons() {
  const div = document.getElementById("songs");
  div.innerHTML = "";

  songList.forEach(song => {
    const btn = document.createElement("button");
    btn.innerText = song;
    btn.onclick = () => addSong(song);
    div.appendChild(btn);
  });
}

function createSongButtons(songList) {
  const div = document.getElementById("songs");
  div.innerHTML = "";

  songList.forEach(song => {
    const btn = document.createElement("button");
    btn.textContent = song;
    btn.onclick = () => addSong(song);
    div.appendChild(btn);
  });
}

document.getElementById("menuBtn").onclick = () => {
  const menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

function clearSetlist() {
  if (confirm("セトリを全削除しますか？")) {
    setlist = [];
    localStorage.removeItem("setlist");
    render();
  }
}

function closeMenu() {
  const menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

loadSongs();
render();
