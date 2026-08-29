let last_known_scroll_position = 0;
let ticking = false;

let showingBorder = false;
let isAvatarSmall = false;
const BORDER_POS = 34;

const nav = document.getElementById('nav');
const avatar = document.getElementById('avatar');
const navigationAvatar = document.getElementById('avatar-nav');

function showBorder() {
  if (document.body.classList.contains('blog-page')) {
    nav.classList.add('is-scrolled');
  } else {
    nav.style.borderBottom = 'solid 2px #edf2f9';
  }

  if (nav.classList.contains('background-green')) {
    nav.style.transition = 'background-color 0.2s ease';
    nav.style.backgroundColor = 'white';
  }

  showingBorder = true;
}

function hideBorder() {
  if (document.body.classList.contains('blog-page')) {
    nav.classList.remove('is-scrolled');
  } else {
    nav.style.borderBottom = '';
  }
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

handleScroll(window.scrollY);

const year = document.getElementById("year");

if (year) {
  year.innerHTML = new Date().getFullYear();
}

const themePicker = document.querySelector(".theme-picker");

if (themePicker) {
  const trigger = themePicker.querySelector(".theme-picker-trigger");
  const menu = themePicker.querySelector(".theme-picker-menu");
  const choices = Array.from(themePicker.querySelectorAll("[data-theme-choice]"));
  const themeIcons = {
    light: '<svg class="theme-icon theme-icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" fill-opacity="0.34"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    auto: '<svg class="theme-icon theme-icon-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" fill-opacity="0.22"/><path d="M8 20h8M12 16v4"/></svg>',
    dark: '<svg class="theme-icon theme-icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5 6.5 6.5 0 0 0 20.5 14.2Z" fill="currentColor" fill-opacity="0.58"/></svg>'
  };
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(preference) {
    const theme = preference === "auto" ? (systemTheme.matches ? "dark" : "light") : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = preference;
    document.querySelector("meta[name='theme-color']").setAttribute("content", theme === "dark" ? "#171a1e" : "#fbfcfe");
    themePicker.querySelector(".theme-picker-icon").innerHTML = themeIcons[preference];
    trigger.setAttribute("aria-label", "Color theme: " + preference + ". Choose color theme");
    themePicker.querySelector(".sr-only").textContent = "Color theme: " + preference + ". Choose color theme";
    choices.forEach(function (choice) {
      choice.setAttribute("aria-checked", String(choice.dataset.themeChoice === preference));
    });
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  const initialPreference = document.documentElement.dataset.themePreference;
  const savedTheme = ["light", "auto", "dark"].includes(initialPreference) ? initialPreference : (systemTheme.matches ? "dark" : "light");
  applyTheme(savedTheme);

  trigger.addEventListener("click", function () {
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    trigger.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      menu.querySelector("[aria-checked='true']").focus();
    }
  });

  choices.forEach(function (choice) {
    choice.addEventListener("click", function () {
      const preference = choice.dataset.themeChoice;
      try {
        localStorage.setItem("blog-theme", preference);
      } catch (error) {
        // The theme still applies for this visit when storage is unavailable.
      }
      applyTheme(preference);
      closeMenu();
      trigger.focus();
    });
  });

  document.addEventListener("click", function (event) {
    if (!themePicker.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      trigger.focus();
    }
  });

  menu.addEventListener("keydown", function (event) {
    const currentIndex = choices.indexOf(document.activeElement);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % choices.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + choices.length) % choices.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = choices.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    choices[nextIndex].focus();
  });

  systemTheme.addEventListener("change", function () {
    if (document.documentElement.dataset.themePreference === "auto") {
      applyTheme("auto");
    }
  });
}
