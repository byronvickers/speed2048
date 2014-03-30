// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function (timestamp) {
  gm = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager,timestamp);
});
