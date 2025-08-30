console.log("✅ Background script loaded!");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📩 Background received:", msg);

  if (msg.type === "meeting-start") {
    chrome.notifications.create(
      "meeting-start-" + Date.now(),
      {
        type: "basic",
        iconUrl: "icon.png",
        title: "Teams Meeting Started",
        message: `Started at ${msg.time}`
      }
    );
  }

  if (msg.type === "meeting-end") {
    chrome.notifications.create(
      "meeting-end-" + Date.now(),
      {
        type: "basic",
        iconUrl: "icon.png",
        title: "Teams Meeting Ended",
        message: `Duration: ${msg.duration} seconds`
      }
    );
  }
});
