let artists = [];
let currentArtistFile = "";
let songs = [];

async function loadArtists() {
  const response = await fetch("data/artists.json?t=" + Date.now());
  artists = await response.json();

  const select = document.getElementById("artistSelect");
  select.innerHTML = "";

  artists.forEach(artist => {
    const option = document.createElement("option");
    option.value = artist.file;
    option.textContent = artist.name;
    select.appendChild(option);
  });

  currentArtistFile =
    localStorage.getItem("artistFile") || artists[0].file;

  select.value = currentArtistFile;

  applyArtistHashtags(currentArtistFile);

  select.onchange = async () => {
    currentArtistFile = select.value;
    localStorage.setItem("artistFile", currentArtistFile);
     applyArtistHashtags(currentArtistFile); 
    await loadSongs(currentArtistFile);
  };

  await loadSongs(currentArtistFile);
}

async function loadSongs(file) {
  const response = await fetch(file + "?t=" + Date.now());
  songs = await response.json();
  createSongButtons(songs); // script.js 側に渡す
}

function applyArtistHashtags(file) {
  const artist = artists.find(a => a.file === file);
  if (!artist) return;

  const hashtagInput = document.getElementById("hashtags");

  if (artist.defaultHashtags) {
    hashtagInput.value = artist.defaultHashtags.join(" ");
  } else {
    hashtagInput.value = "";
  }
}

window.onload = () => {
  loadArtists();
};