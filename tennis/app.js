(() => {
  'use strict';
  const stopVideos = container => container.querySelectorAll('iframe').forEach(frame => {
    const shell = frame.closest('.video-shell');
    if (shell) { frame.remove(); shell.querySelector('button').hidden = false; }
  });
  document.querySelectorAll('.video-play').forEach(button => button.addEventListener('click', () => {
    stopVideos(document);
    const shell = button.closest('.video-shell');
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${shell.dataset.video}?autoplay=1&rel=0`;
    frame.title = shell.dataset.title + ' highlights';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    button.hidden = true;
    shell.append(frame);
    frame.focus();
  }));
})();
