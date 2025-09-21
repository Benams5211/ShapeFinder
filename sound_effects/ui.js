// Allows button actions to be read for spawning in new shapes.
// Parker Franklin

window.addEventListener("DOMContentLoaded", () => {
  const spawnBtn = document.getElementById("spawnBtn");
  const playBgmBtn = document.getElementById("playBgmBtn");
  const stopBgmBtn = document.getElementById("stopBgmBtn");
  const status  = document.getElementById("status");

  // "Spawn Random Shape" Button
  spawnBtn?.addEventListener("click", () => {
    const count = window.spawnRandomShape?.();
    if (status) status.textContent = `Spawned! Total: ${count}`;
  });

  // "Play Music" Button
  playBgmBtn?.addEventListener("click", () => {
    window.playBgm?.();
    if (status) status.textContent = "Music: playing";
  });

  // "Stop Music" Button
  stopBgmBtn?.addEventListener("click", () => {
    window.stopBgm?.();
    if (status) status.textContent = "Music: stopped";
  });
});