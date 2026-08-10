(function () {
  var FRAME_SELECTOR = '[data-embedded-frame]';
  var BUTTON_SELECTOR = '[data-embedded-frame-fullscreen]';
  var ACTIVE_CLASS = 'is-fullscreen';

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestFullscreen(element) {
    var request = element.requestFullscreen || element.webkitRequestFullscreen;
    if (request) request.call(element);
  }

  function exitFullscreen() {
    var exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
  }

  function connect(frame) {
    var button = frame.querySelector(BUTTON_SELECTOR);
    var surface = frame.querySelector('iframe');
    if (!button || !surface) return;

    button.addEventListener('click', function () {
      if (fullscreenElement()) {
        exitFullscreen();
        return;
      }
      requestFullscreen(surface);
    });

    function sync() {
      frame.classList.toggle(ACTIVE_CLASS, fullscreenElement() === surface);
    }

    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
  }

  function connectAll() {
    var frames = document.querySelectorAll(FRAME_SELECTOR);
    for (var index = 0; index < frames.length; index++) connect(frames[index]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectAll);
  } else {
    connectAll();
  }
})();
