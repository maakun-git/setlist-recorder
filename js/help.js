export async function initHelp() {
  // HTMLを読み込む
  const response = await fetch("partials/help.html");
  const html = await response.text();

  document.body.insertAdjacentHTML("beforeend", html);

  const helpBtn = document.getElementById("helpBtn");
  const helpModal = document.getElementById("helpModal");
  const closeBtn = document.getElementById("helpCloseBtn");

  helpBtn.addEventListener("click", () => {
    helpModal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    helpModal.style.display = "none";
  });
}