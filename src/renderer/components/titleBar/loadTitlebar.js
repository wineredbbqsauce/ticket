const APP_TITLE = "Ticket System";

async function loadTitlebar() {
  // Sett dokument title
  document.title = APP_TITLE;

  // HTML
  const response = await fetch("./components/titleBar/titlebar.html");
  const titlebarHTML = await response.text();
  document.body.insertAdjacentHTML("afterbegin", titlebarHTML);

  // Css
  if (!document.getElementById("titlebar-css")) {
    const link = document.createElement("link");
    link.id = "titlebar-css";
    link.rel = "stylesheet";
    link.href = "./components/titleBar/titlebar.css";
    document.head.appendChild(link);
  }

  // Title
  const titleEl = document.getElementById("window-title");
  if (titleEl) titleEl.textContent = document.title;

  // Buttons
  document.getElementById("minimize-btn").onclick = () => {
    window.electronAPI?.minimize();
  };
  document.getElementById("maximize-btn").onclick = () => {
    window.electronAPI?.maximize();
  };
  document.getElementById("close-btn").onclick = () => {
    window.electronAPI?.close();
  };
}

document.addEventListener("DOMContentLoaded", loadTitlebar);
