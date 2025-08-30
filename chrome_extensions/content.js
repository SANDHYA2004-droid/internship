console.log("✅ Teams Monitor content.js loaded!");

(function () {
  let meetingStarted = false;
  let startTime = null;

  function log(msg) {
    console.log(`[Teams Monitor] ${msg}`);
  }

  const observer = new MutationObserver(() => {
    const toolbar = document.querySelector('div[role="toolbar"][aria-label*="Meeting"]');

    if (toolbar && !meetingStarted) {
      meetingStarted = true;
      startTime = new Date();
      log(`Meeting started at: ${startTime.toLocaleString()}`);

      chrome.runtime.sendMessage(
        { type: "meeting-start", time: startTime.toLocaleTimeString() },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Message error:", chrome.runtime.lastError);
          } else {
            console.log("✅ Message sent: meeting-start");
          }
        }
      );
    } 
    else if (!toolbar && meetingStarted) {
      meetingStarted = false;
      const endTime = new Date();
      const durationSec = Math.round((endTime - startTime) / 1000);

      log(`Meeting ended at: ${endTime.toLocaleString()}`);
      log(`Duration: ${durationSec} seconds`);

      chrome.runtime.sendMessage(
        { type: "meeting-end", duration: durationSec },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Message error:", chrome.runtime.lastError);
          } else {
            console.log("✅ Message sent: meeting-end");
          }
        }
      );
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  log("Meeting monitor is running...");
})();
