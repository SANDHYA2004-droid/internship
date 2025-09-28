







// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete" && /https:\/\/.*teams.*\.com/.test(tab.url)) {
//     chrome.runtime.sendMessage({ action: "teamsTabDetected", tabId });

//     chrome.notifications.create({
//       type: "basic",
//       iconUrl: "icon.png",
//       title: "Teams Recorder",
//       message: "Teams tab detected! Open the extension to start recording."
//     });
//   }
// });




// Background script - Only for Teams tab detection
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete" && /https:\/\/.*teams.*\.com/.test(tab.url)) {
//     console.log("✅ Teams tab detected:", tabId);

//     chrome.notifications.create({
//       type: "basic",
//       iconUrl: "icon.png",
//       title: "Teams Recorder",
//       message: "Teams tab detected! Open the extension to start recording."
//     });
//   }
// });

// // Keep service worker alive when popup is open
// chrome.runtime.onConnect.addListener((port) => {
//   console.log("🔗 Popup connected");
//   port.onDisconnect.addListener(() => {
//     console.log("🔗 Popup disconnected");
//   });
// });









// // Background script - Message routing
// let recordingWindowId = null;

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete" && /https:\/\/.*teams.*\.com/.test(tab.url)) {
//     console.log("✅ Teams tab detected:", tabId);

//     chrome.notifications.create({
//       type: "basic",
//       iconUrl: "icon.png",
//       title: "Teams Recorder",
//       message: "Teams tab detected! Open the extension to start recording."
//     });
//   }
// });

// // Message router
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("📨 Background received:", message.action);

//   switch (message.action) {
//     case "startRecording":
//       recordingWindowId = message.windowId;
//       // Forward to recorder window
//       chrome.runtime.sendMessage(message);
//       sendResponse({ success: true });
//       break;

//     case "stopRecording":
//       // Forward to recorder window
//       chrome.runtime.sendMessage(message);
//       sendResponse({ success: true });
//       break;

//     case "getRecordingStatus":
//       chrome.storage.local.get(['isRecording']).then(result => {
//         sendResponse({ isRecording: result.isRecording || false });
//       });
//       return true;

//     default:
//       sendResponse({ success: false });
//   }
// });

// // Keep service worker alive
// setInterval(() => {
//   chrome.runtime.getPlatformInfo(() => {});
// }, 20000);







/// Background script - Message routing and tab detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /https:\/\/.*teams.*\.com/.test(tab.url)) {
    console.log("✅ Teams tab detected:", tabId);

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Teams Recorder",
      message: "Teams tab detected! Open the extension to start recording."
    });
  }
});

// Keep service worker alive
setInterval(() => {
  chrome.runtime.getPlatformInfo(() => {});
}, 20000);