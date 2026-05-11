// extension/background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetch_estimate") {
    fetch("http://localhost:3000/estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message.data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      return response.json();
    })
    .then(result => {
      sendResponse({ ok: true, data: result });
    })
    .catch(err => {
      console.error("Error fetching localhost server:", err);
      sendResponse({ ok: false, error: err.message });
    });

    return true; // Keeps the communication channel open for asynchronous responses
  }
});