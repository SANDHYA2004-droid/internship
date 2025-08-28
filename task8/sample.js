(function () {
  let meetingStarted = false;
  let startTime = null;

  function log(msg) {
    console.log(`[Teams Monitor] ${msg}`);
  }

  const observer = new MutationObserver(() => {
    const toolbar = document.querySelector('div[role="toolbar"][aria-label="Meeting controls"][data-tid="ubar-horizontal-middle-end"]');

    if (toolbar && !meetingStarted) {
      meetingStarted = true;
      startTime = new Date();
      log(`Meeting started at: ${startTime.toLocaleString()}`);
    } 
    
    else if (!toolbar && meetingStarted) {
      meetingStarted = false;
      const endTime = new Date();
      log(`Meeting ended at: ${endTime.toLocaleString()}`);
      log(`Duration: ${(endTime - startTime) / 1000} seconds`);
    }
  });

  // Watch the whole body for changes
  observer.observe(document.body, { childList: true, subtree: true });

  log("Meeting monitor is running...");
})();
