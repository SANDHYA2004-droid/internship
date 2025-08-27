function autoClickTeamsButtons() {
  // List of buttons we want to click
  const selectors = [
    '[aria-label="Meet"]',
    '[data-tid="create-meeting-link"]',
    '[data-tid="meet-app-create-meeting-link-button"]'
  ];

  selectors.forEach(selector => {
    const btn = document.querySelector(selector);
    if (btn) {
      console.log(`✅ Found and clicked: ${selector}`);
      btn.click();
    } else {
      console.log(`⏳ Not found yet: ${selector}, will retry...`);
      setTimeout(autoClickTeamsButtons, 1000); // retry after 1s
    }
  });
}

// Run it
autoClickTeamsButtons();