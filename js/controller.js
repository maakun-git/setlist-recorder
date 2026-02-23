import { AppState, updateState } from "./state.js";
import { fetchJSON, sendAnalytics } from "./service.js";
import { renderAll, showToast } from "./view.js";

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
        this.addToSetlist(name, "song");

        sendAnalytics("song_click", {
            artist: AppState.currentArtist,
            song: name,
        });
    }

    handleOther(type) {
        const map = {
            "mc": "MC",
            "special": "企画コーナー",
            "medley-start": "メドレー開始",
            "medley-end": "メドレー終了",
            "encore": "アンコール"
        };

        const label = map[type];
        if (!label) return;

        this.addToSetlist(label, type);

        sendAnalytics("other_click", { type });
    }

    addToSetlist(name, type = "song") {
        updateState(state => {
            state.setlist.push({
                name,
                type,
                time: new Date().toISOString(),
            });
        });

        renderAll();

        this.setBottomPadding(false);

        const area = document.getElementById("setlistArea");
        area.scrollTop = area.scrollHeight;
    }

    handleFreeWord(text) {
        this.addToSetlist(text, "free");

        sendAnalytics("freeword_add", { text });
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

    copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            // HTTPS or localhost
            return navigator.clipboard.writeText(text);
        } else {
            // フォールバック（http / 192.168.x.x 用）
            return new Promise((resolve, reject) => {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                textarea.style.top = "0";
                textarea.style.left = "0";
                textarea.style.opacity = "0";

                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();

                try {
                    const successful = document.execCommand("copy");
                    document.body.removeChild(textarea);

                    if (successful) {
                        resolve();
                    } else {
                        reject(new Error("Copy failed"));
                    }
                } catch (err) {
                    document.body.removeChild(textarea);
                    reject(err);
                }
            });
        }
    }

    handleCopy() {
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        const venue = document.getElementById("venue")?.value || "";
        const hashtags = document.getElementById("hashtags")?.value || "";

        const header = `【${mm}/${dd} @ ${venue}】`;

        const list = document.querySelector("#setlistArea #list");

        const setlistText = Array.from(
            list.querySelectorAll(
                ".song-line, .other-line, .medley-start, .medley-end, .encore-line"
            )
        )
            .map(el => el.innerText.trim())
            .filter(t => t !== "")
            .join("\n");

        const fullText = [
            header,
            hashtags,
            "",
            setlistText
        ].join("\n");

        this.copyText(fullText)
            .then(() => {
                showToast("コピーしました！");
            })
            .catch(err => {
                console.error(err);
                showToast("コピーに失敗しました");
            });
    }

    handleMenuClose() {
        document.getElementById("menu").style.display = "none";
    }
}
