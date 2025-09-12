// Allows button actions to be read for spawning in new shapes.
// Parker Franklin

window.addEventListener("DOMContentLoaded", () => { // Event Listener that waits for HTML to be ready before trying to grab elements.
  const spawnBtn = document.getElementById("spawnBtn");
  const status = document.getElementById("status");

  if (spawnBtn) { // If "spawnBtn" is located:
    spawnBtn.addEventListener("click", () => { // If "spwnBtn" is clicked:
      if (typeof window.spawnRandomShape === "function") { // Assures "window.spawnRandomShape" is a function before calling it:
        const count = window.spawnRandomShape();
        if (status) status.textContent = `Total Spawned: ${count}`; // Tracks how many times count has been incremented with each spawn.
      }
    });
  }
});