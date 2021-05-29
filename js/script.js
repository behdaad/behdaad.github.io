let last_known_scroll_position = 0;
let ticking = false;

let showingBorder = false;
let isTannazSmall = false;
const BORDER_POS = 34;

const nav = document.getElementById('nav');
const tannaz = document.getElementById('tannaz');
const tannazNav = document.getElementById('tannaz-nav');

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

function smallTannaz() {
  if (!tannaz || !tannazNav) {
    return;
  }
  tannazNav.style.visibility = 'visible';
  tannazNav.style.animation = '0.4s fadeIn';
  tannaz.style.visibility = 'hidden';
  tannaz.style.animation = '';
  isTannazSmall = true;
}

function bigTannaz() {
  if (!tannaz || !tannazNav) {
    return;
  }
  tannazNav.style.visibility = 'hidden';
  tannazNav.style.animation = '';
  tannaz.style.visibility = 'visible';
  tannaz.style.animation = '0.4s fadeIn';
  isTannazSmall = false;
}

function handleScroll(scroll_pos) {
  if (scroll_pos > BORDER_POS && !showingBorder) {
    showBorder();
  }
  if (scroll_pos > BORDER_POS + 80 && !isTannazSmall) {
    smallTannaz();
  }

  if (scroll_pos < BORDER_POS && showingBorder) {
    hideBorder();
    bigTannaz();
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
