const app = document.getElementById("app");
const titlebar = document.getElementById("titlebar");
let isDragging = false, offsetX, offsetY;

// slepen van het venster
titlebar.addEventListener("mousedown", e => {
  isDragging = true;
  offsetX = e.clientX - app.offsetLeft;
  offsetY = e.clientY - app.offsetTop;
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", e => {
  if (isDragging) {
    app.style.position = "absolute";
    app.style.left = (e.clientX - offsetX) + "px";
    app.style.top = (e.clientY - offsetY) + "px";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.userSelect = "auto";
});

// icoon selecteren
const icons = document.querySelectorAll(".icon-box");
icons.forEach(icon => {
  icon.addEventListener("click", e => {
    e.stopPropagation();
    icons.forEach(i => i.classList.remove("selected"));
    icon.classList.add("selected");
  });
});

document.addEventListener("click", () => {
  icons.forEach(i => i.classList.remove("selected"));
});

// venster openen en sluiten
const grooveboxIcon = document.getElementById("groovebox-icon");
const appWindow = document.getElementById("app");
grooveboxIcon.addEventListener("dblclick", () => {
  appWindow.classList.add("active");
  centerApp();
});

const closeBtn = appWindow.querySelector(".close-btn");
closeBtn.addEventListener("click", () => {
  appWindow.classList.remove("active");
});

// verplaatsen bij mobiel formaat
function centerApp() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    app.style.position = "absolute";
    app.style.left = `-3px`;
    app.style.top = `54px`;
  }
}

window.addEventListener("resize", centerApp);