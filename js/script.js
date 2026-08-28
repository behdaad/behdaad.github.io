let last_known_scroll_position = 0;
let ticking = false;

let showingBorder = false;
let isAvatarSmall = false;
const BORDER_POS = 34;

const nav = document.getElementById('nav');
const avatar = document.getElementById('avatar');
const navigationAvatar = document.getElementById('avatar-nav');

function showBorder() {
  nav.style.borderBottom = 'solid 2px #edf2f9';

  if (nav.classList.contains('background-green')) {
    nav.style.transition = 'background-color 0.2s ease';
    nav.style.backgroundColor = 'white';
  }

  showingBorder = true;
}

function hideBorder() {
  nav.style.borderBottom = '';
  if (nav.classList.contains('background-green')) {
    nav.style.backgroundColor = '';
  }
  showingBorder = false;
}

function smallAvatar() {
  if (!avatar || !navigationAvatar) {
    return;
  }
  navigationAvatar.style.visibility = 'visible';
  navigationAvatar.style.animation = '0.4s fadeIn';
  avatar.style.visibility = 'hidden';
  avatar.style.animation = '';
  isAvatarSmall = true;
}

function bigAvatar() {
  if (!avatar || !navigationAvatar) {
    return;
  }
  navigationAvatar.style.visibility = 'hidden';
  navigationAvatar.style.animation = '';
  avatar.style.visibility = 'visible';
  avatar.style.animation = '0.4s fadeIn';
  isAvatarSmall = false;
}

function handleScroll(scroll_pos) {
  if (scroll_pos > BORDER_POS && !showingBorder) {
    showBorder();
  }
  if (scroll_pos > BORDER_POS + 80 && !isAvatarSmall) {
    smallAvatar();
  }

  if (scroll_pos < BORDER_POS && showingBorder) {
    hideBorder();
    bigAvatar();
  }
}

document.addEventListener('scroll', function (e) {
  last_known_scroll_position = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(function () {
      handleScroll(last_known_scroll_position);
      ticking = false;
    });

    ticking = true;
  }
});

document.getElementById("year").innerHTML = new Date().getFullYear();

const themeToggle = document.getElementById("theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function setBlogTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeToggle.querySelector(".theme-toggle-label").textContent = isDark ? "Light mode" : "Dark mode";
  themeColor.content = isDark ? "#171a1e" : "#fbfcfe";
}

if (themeToggle) {
  const savedTheme = localStorage.getItem("blog-theme");
  const theme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  setBlogTheme(theme);

  themeToggle.addEventListener("click", function () {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    localStorage.setItem("blog-theme", nextTheme);
    setBlogTheme(nextTheme);
  });
}
