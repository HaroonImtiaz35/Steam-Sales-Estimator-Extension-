// extension/popup.js

document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("run");
  const outputDiv = document.getElementById("output");

  runBtn.addEventListener("click", async () => {
    outputDiv.textContent = "Connecting to page...";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url) {
        outputDiv.textContent = "Cannot access the current page.";
        return;
      }

      if (!tab.url.includes("store.steampowered.com/app/")) {
        outputDiv.textContent = "Open a Steam game page first.";
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: "estimate" }, (response) => {
        if (chrome.runtime.lastError) {
          outputDiv.textContent = "Could not connect. Please refresh the page.";
          return;
        }

        if (response && response.ok) {
          outputDiv.textContent = "Calculated directly on Steam!";
        } else {
          outputDiv.textContent = "Calculation failed.";
        }
      });
    } catch (err) {
      outputDiv.textContent = "An error occurred.";
      console.error(err);
    }
  });
});