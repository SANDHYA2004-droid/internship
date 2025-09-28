// let mediaRecorder;
// let recordedChunks = [];
// let activeTabId;
// let timerInterval;
// let secondsElapsed = 0;

// // ----------------- Timer -----------------
// function startTimer() {
//   const timerEl = document.getElementById("timer");
//   secondsElapsed = 0;

//   timerInterval = setInterval(() => {
//     secondsElapsed++;
//     const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
//     const seconds = String(secondsElapsed % 60).padStart(2, "0");
//     timerEl.textContent = `${minutes}:${seconds}`;
//   }, 1000);
// }

// function stopTimer() {
//   clearInterval(timerInterval);
//   document.getElementById("timer").textContent = "00:00";
// }

// // ----------------- Listen for Teams tab -----------------
// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.action === "teamsTabDetected") {
//     activeTabId = msg.tabId;
//     document.getElementById("startBtn").disabled = false;
//   }
// });

// // ----------------- Check current tab on popup open -----------------
// document.addEventListener("DOMContentLoaded", async () => {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   if (/https:\/\/.*teams.*\.com/.test(tab.url)) {
//     activeTabId = tab.id;
//     document.getElementById("startBtn").disabled = false;
//   }
// });

// const startBtn = document.getElementById("startBtn");
// const stopBtn = document.getElementById("stopBtn");

// // ----------------- Start Recording -----------------
// startBtn.addEventListener("click", () => {
//   chrome.tabCapture.capture({ audio: true, video: true }, async (tabStream) => {
//     if (!tabStream) {
//       alert("Failed to start recording. Make sure you're on a Teams tab.");
//       return;
//     }

//     let finalStream;

//     try {
//       // Capture microphone
//       const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       // Mix tab + mic audio
//       const ctx = new AudioContext();
//       const destination = ctx.createMediaStreamDestination();

//       const tabSource = ctx.createMediaStreamSource(tabStream);
//       const micSource = ctx.createMediaStreamSource(micStream);

//       tabSource.connect(destination);
//       micSource.connect(destination);

//       // Merge video (from tab) + mixed audio
//       finalStream = new MediaStream([
//         ...tabStream.getVideoTracks(),
//         ...destination.stream.getAudioTracks()
//       ]);

//       console.log("✅ Recording tab + mic audio");
//     } catch (err) {
//       console.warn("⚠️ Mic capture failed, fallback to tab audio only:", err);
//       // Fallback: tab video + tab audio
//       finalStream = new MediaStream([
//         ...tabStream.getVideoTracks(),
//         ...tabStream.getAudioTracks()
//       ]);
//     }

//     mediaRecorder = new MediaRecorder(finalStream, {
//       mimeType: "video/webm; codecs=vp8,opus"
//     });

//     recordedChunks = [];

//     mediaRecorder.ondataavailable = (e) => {
//       if (e.data.size > 0) recordedChunks.push(e.data);
//     };

//     mediaRecorder.onstop = () => {
//       stopTimer();
//       const blob = new Blob(recordedChunks, { type: "video/webm" });
//       const url = URL.createObjectURL(blob);
//       chrome.downloads.download({ url, filename: "teams_recording.webm" });
//     };

//     mediaRecorder.start();
//     startBtn.disabled = true;
//     stopBtn.disabled = false;
//     startTimer();
//   });
// });

// // ----------------- Stop Recording -----------------
// stopBtn.addEventListener("click", () => {
//   if (mediaRecorder && mediaRecorder.state !== "inactive") {
//     mediaRecorder.stop();
//     startBtn.disabled = false;
//     stopBtn.disabled = true;
//   }
// });







// let mediaRecorder;
// let recordedChunks = [];
// let activeTabId;
// let timerInterval;
// let secondsElapsed = 0;
// let isRecording = false;

// // Check current tab on popup open
// document.addEventListener("DOMContentLoaded", async () => {
//   console.log("🔍 Popup opened - checking tab...");
  
//   try {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     console.log("📄 Current tab:", tab.url);
    
//     if (tab && tab.url && /https:\/\/.*teams.*\.com/.test(tab.url)) {
//       activeTabId = tab.id;
//       document.getElementById("startBtn").disabled = false;
//       document.getElementById("status").textContent = "✅ Ready to record";
//       console.log("✅ Teams tab detected:", activeTabId);
//     } else {
//       document.getElementById("startBtn").disabled = true;
//       document.getElementById("status").textContent = "❌ Please open Microsoft Teams first";
//       console.log("❌ Not on Teams tab");
//     }
//   } catch (error) {
//     console.error("❌ Error checking tab:", error);
//   }
// });

// // Timer functions
// function startTimer() {
//   const timerEl = document.getElementById("timer");
//   secondsElapsed = 0;
//   timerEl.textContent = "00:00";

//   timerInterval = setInterval(() => {
//     secondsElapsed++;
//     const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
//     const seconds = String(secondsElapsed % 60).padStart(2, "0");
//     timerEl.textContent = `${minutes}:${seconds}`;
//   }, 1000);
// }

// function stopTimer() {
//   clearInterval(timerInterval);
//   document.getElementById("timer").textContent = "00:00";
// }

// // Start Recording - DIRECT from popup
// document.getElementById("startBtn").addEventListener("click", async () => {
//   console.log("🎬 Start recording clicked");
  
//   if (!activeTabId) {
//     alert("❌ Please open Microsoft Teams first");
//     return;
//   }

//   const startBtn = document.getElementById("startBtn");
//   const stopBtn = document.getElementById("stopBtn");
//   const statusEl = document.getElementById("status");

//   try {
//     startBtn.disabled = true;
//     startBtn.textContent = "Starting...";
//     statusEl.textContent = "🟡 Starting recording...";

//     // Capture tab - THIS MUST BE CALLED FROM POPUP CONTEXT
//     const tabStream = await new Promise((resolve, reject) => {
//       chrome.tabCapture.capture({
//         audio: true,
//         video: true,
//         audioConstraints: {
//           mandatory: {
//             chromeMediaSource: 'tab',
//             echoCancellation: true,
//             noiseSuppression: true,
//             googAutoGainControl: true
//           }
//         },
//         videoConstraints: {
//           mandatory: {
//             chromeMediaSource: 'tab',
//             minWidth: 1280,
//             minHeight: 720,
//             maxWidth: 1920,
//             maxHeight: 1080,
//             minFrameRate: 30,
//             maxFrameRate: 60
//           }
//         }
//       }, (stream) => {
//         if (chrome.runtime.lastError) {
//           reject(new Error(chrome.runtime.lastError.message));
//           return;
//         }
//         if (!stream) {
//           reject(new Error("Could not capture tab stream"));
//           return;
//         }
//         resolve(stream);
//       });
//     });

//     console.log("✅ Tab stream captured");

//     let finalStream = tabStream;

//     // Try to add microphone
//     try {
//       console.log("🎤 Attempting to capture microphone...");
//       const micStream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         },
//         video: false
//       });

//       console.log("✅ Microphone captured");

//       // Mix tab audio + microphone audio
//       const audioContext = new AudioContext();
//       const destination = audioContext.createMediaStreamDestination();

//       const tabAudioSource = audioContext.createMediaStreamSource(
//         new MediaStream(tabStream.getAudioTracks())
//       );
//       const micAudioSource = audioContext.createMediaStreamSource(micStream);

//       tabAudioSource.connect(destination);
//       micAudioSource.connect(destination);

//       // Create final stream with mixed audio
//       finalStream = new MediaStream([
//         ...tabStream.getVideoTracks(),
//         ...destination.stream.getAudioTracks()
//       ]);

//       console.log("✅ Audio mixed successfully");

//     } catch (micError) {
//       console.warn("⚠️ Microphone not available, using tab audio only:", micError);
//       // Continue with tab audio only
//     }

//     // Setup MediaRecorder
//     const mimeTypes = [
//       'video/webm;codecs=vp9,opus',
//       'video/webm;codecs=vp8,opus',
//       'video/webm'
//     ];

//     const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
//     console.log("🎥 Using MIME type:", supportedType);

//     mediaRecorder = new MediaRecorder(finalStream, {
//       mimeType: supportedType,
//       videoBitsPerSecond: 3000000
//     });

//     recordedChunks = [];
//     isRecording = true;

//     mediaRecorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         recordedChunks.push(event.data);
//         console.log("📦 Data chunk:", event.data.size, "bytes");
//       }
//     };

//     mediaRecorder.onstop = () => {
//       console.log("🛑 Recording stopped");
//       stopTimer();
//       downloadRecording();
//       cleanup();
//     };

//     mediaRecorder.onerror = (event) => {
//       console.error("❌ MediaRecorder error:", event);
//       statusEl.textContent = "❌ Recording error";
//       cleanup();
//     };

//     // Start recording
//     mediaRecorder.start(1000); // Capture data every second
//     console.log("✅ Recording started!");

//     // Update UI
//     startBtn.textContent = "Recording...";
//     stopBtn.disabled = false;
//     statusEl.textContent = "🟢 Recording...";
//     startTimer();

//     // Save recording state to storage (for when popup reopens)
//     chrome.storage.local.set({ 
//       isRecording: true,
//       recordingStartTime: Date.now()
//     });

//   } catch (error) {
//     console.error("❌ Recording start failed:", error);
    
//     let errorMessage = error.message;
//     if (errorMessage.includes("Permission denied")) {
//       errorMessage = "Permission denied. Please:\n\n1. Refresh the Teams page\n2. Make sure you're in a meeting\n3. Try again";
//     } else if (errorMessage.includes("Cannot create a MediaRecorder")) {
//       errorMessage = "Browser doesn't support recording. Try Chrome or Edge.";
//     }
    
//     statusEl.textContent = "❌ Failed to start";
//     alert("Failed to start recording:\n\n" + errorMessage);
    
//     // Reset UI
//     cleanupUI();
//   }
// });

// // Stop Recording
// document.getElementById("stopBtn").addEventListener("click", () => {
//   console.log("🛑 Stop recording clicked");
  
//   if (mediaRecorder && mediaRecorder.state === 'recording') {
//     mediaRecorder.stop();
//     document.getElementById("status").textContent = "💾 Saving recording...";
//   }
// });

// // Download recording
// function downloadRecording() {
//   if (recordedChunks.length === 0) {
//     console.warn("⚠️ No recorded data");
//     return;
//   }

//   try {
//     const blob = new Blob(recordedChunks, { type: 'video/webm' });
//     const url = URL.createObjectURL(blob);
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1];
//     const filename = `teams-recording-${timestamp}.webm`;

//     const a = document.createElement('a');
//     a.href = url;
//     a.download = filename;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
    
//     // Clean up URL
//     setTimeout(() => URL.revokeObjectURL(url), 1000);
    
//     console.log("💾 Download triggered:", filename);
//     document.getElementById("status").textContent = "✅ Recording saved!";
    
//   } catch (error) {
//     console.error("❌ Download failed:", error);
//     document.getElementById("status").textContent = "❌ Download failed";
//   }
// }

// // Cleanup
// function cleanup() {
//   isRecording = false;
  
//   if (mediaRecorder) {
//     mediaRecorder = null;
//   }
  
//   recordedChunks = [];
  
//   // Stop all media tracks
//   if (mediaRecorder && mediaRecorder.stream) {
//     mediaRecorder.stream.getTracks().forEach(track => track.stop());
//   }
  
//   chrome.storage.local.remove(['isRecording', 'recordingStartTime']);
  
//   cleanupUI();
// }

// function cleanupUI() {
//   document.getElementById("startBtn").disabled = !activeTabId;
//   document.getElementById("startBtn").textContent = "Start Recording";
//   document.getElementById("stopBtn").disabled = true;
//   document.getElementById("stopBtn").textContent = "Stop & Download";
  
//   if (!activeTabId) {
//     document.getElementById("status").textContent = "❌ Please open Microsoft Teams";
//   } else {
//     document.getElementById("status").textContent = "✅ Ready to record";
//   }
// }

// // Check if recording was in progress when popup opens
// async function checkExistingRecording() {
//   const result = await chrome.storage.local.get(['isRecording']);
//   if (result.isRecording) {
//     document.getElementById("status").textContent = "⚠️ Recording in background...";
//   }
// }

// // Initialize
// checkExistingRecording();









//correct
// let activeTabId;
// let isRecording = false;

// // Check current tab on popup open
// document.addEventListener("DOMContentLoaded", async () => {
//   console.log("🔍 Popup opened - checking tab...");
  
//   try {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
//     if (tab && tab.url && /https:\/\/.*teams.*\.com/.test(tab.url)) {
//       activeTabId = tab.id;
//       console.log("✅ Teams tab detected:", activeTabId);
//     }

//     // Check current recording status
//     await checkRecordingStatus();
    
//   } catch (error) {
//     console.error("❌ Error checking tab:", error);
//   }
// });

// // Check recording status from background
// async function checkRecordingStatus() {
//   try {
//     const response = await chrome.runtime.sendMessage({ action: "getRecordingStatus" });
    
//     if (response && response.isRecording) {
//       isRecording = true;
//       updateUIForRecording(response.recordingTime);
//       console.log("✅ Recording active in background");
//     } else {
//       isRecording = false;
//       updateUIForReady();
//       console.log("✅ Ready to record");
//     }
//   } catch (error) {
//     console.error("❌ Error checking recording status:", error);
//     updateUIForReady();
//   }
// }

// function updateUIForRecording(recordingTime) {
//   document.getElementById("startBtn").disabled = true;
//   document.getElementById("stopBtn").disabled = false;
//   document.getElementById("timer").textContent = recordingTime || "00:00";
//   document.getElementById("status").textContent = "🟢 Recording in background...";
//   document.getElementById("startBtn").textContent = "Recording...";
// }

// function updateUIForReady() {
//   document.getElementById("startBtn").disabled = !activeTabId;
//   document.getElementById("stopBtn").disabled = true;
//   document.getElementById("timer").textContent = "00:00";
//   document.getElementById("status").textContent = activeTabId ? "✅ Ready to record" : "❌ Please open Microsoft Teams";
//   document.getElementById("startBtn").textContent = "Start Recording";
// }

// // Start Recording - Send to background
// document.getElementById("startBtn").addEventListener("click", async () => {
//   console.log("🎬 Start recording clicked");
  
//   if (!activeTabId) {
//     alert("❌ Please open Microsoft Teams first");
//     return;
//   }

//   try {
//     document.getElementById("startBtn").disabled = true;
//     document.getElementById("startBtn").textContent = "Starting...";
//     document.getElementById("status").textContent = "🟡 Starting recording...";

//     // Open a new window for recording (this will keep recording alive)
//     chrome.windows.create({
//       url: chrome.runtime.getURL("recorder.html"),
//       type: "popup",
//       width: 400,
//       height: 300,
//       focused: false
//     }, (window) => {
//       console.log("✅ Recorder window opened:", window.id);
      
//       // Send tab ID to recorder window after a short delay
//       setTimeout(() => {
//         chrome.runtime.sendMessage({ 
//           action: "startRecording", 
//           tabId: activeTabId,
//           windowId: window.id
//         });
//       }, 1000);
//     });

//   } catch (error) {
//     console.error("❌ Start recording failed:", error);
//     document.getElementById("status").textContent = "❌ Failed to start";
//     alert("Failed to start recording: " + error.message);
//     updateUIForReady();
//   }
// });

// // Stop Recording
// document.getElementById("stopBtn").addEventListener("click", async () => {
//   console.log("🛑 Stop recording clicked");
  
//   try {
//     document.getElementById("stopBtn").disabled = true;
//     document.getElementById("stopBtn").textContent = "Stopping...";
//     document.getElementById("status").textContent = "🟡 Stopping recording...";

//     const response = await chrome.runtime.sendMessage({ action: "stopRecording" });
    
//     if (response && response.success) {
//       isRecording = false;
//       document.getElementById("status").textContent = "✅ Recording saved!";
//       console.log("✅ Recording stopped successfully");
      
//       setTimeout(() => {
//         updateUIForReady();
//       }, 2000);
//     }
    
//   } catch (error) {
//     console.error("❌ Stop recording failed:", error);
//     document.getElementById("status").textContent = "❌ Stop failed";
//     alert("Failed to stop recording: " + error.message);
//     updateUIForReady();
//   }
// });

// // Listen for updates from background
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.action === "timerUpdate") {
//     document.getElementById("timer").textContent = message.time;
//   }
  
//   if (message.action === "recordingStarted") {
//     isRecording = true;
//     updateUIForRecording("00:00");
//   }
  
//   if (message.action === "recordingStopped") {
//     isRecording = false;
//     updateUIForReady();
//   }
// });










//correct audio 
// let activeTabId;
// let isRecording = false;

// // Check current tab on popup open
// document.addEventListener("DOMContentLoaded", async () => {
//   console.log("🔍 Popup opened - checking tab...");
  
//   try {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
//     if (tab && tab.url && /https:\/\/.*teams.*\.com/.test(tab.url)) {
//       activeTabId = tab.id;
//       console.log("✅ Teams tab detected:", activeTabId);
//     }

//     // Check current recording status
//     await checkRecordingStatus();
    
//   } catch (error) {
//     console.error("❌ Error checking tab:", error);
//   }
// });

// // Check recording status from background
// async function checkRecordingStatus() {
//   try {
//     const response = await chrome.runtime.sendMessage({ action: "getRecordingStatus" });
    
//     if (response && response.isRecording) {
//       isRecording = true;
//       updateUIForRecording(response.recordingTime);
//       console.log("✅ Recording active in background");
//     } else {
//       isRecording = false;
//       updateUIForReady();
//       console.log("✅ Ready to record");
//     }
//   } catch (error) {
//     console.error("❌ Error checking recording status:", error);
//     updateUIForReady();
//   }
// }

// function updateUIForRecording(recordingTime) {
//   document.getElementById("startBtn").disabled = true;
//   document.getElementById("stopBtn").disabled = false;
//   document.getElementById("timer").textContent = recordingTime || "00:00";
//   document.getElementById("status").textContent = "🟢 Recording in background (Audio: Tab + Mic)";
//   document.getElementById("startBtn").textContent = "Recording...";
// }

// function updateUIForReady() {
//   document.getElementById("startBtn").disabled = !activeTabId;
//   document.getElementById("stopBtn").disabled = true;
//   document.getElementById("timer").textContent = "00:00";
//   document.getElementById("status").textContent = activeTabId ? "✅ Ready to record (Audio: Tab + Mic)" : "❌ Please open Microsoft Teams";
//   document.getElementById("startBtn").textContent = "Start Recording";
// }

// // Start Recording - Send to background
// document.getElementById("startBtn").addEventListener("click", async () => {
//   console.log("🎬 Start recording clicked");
  
//   if (!activeTabId) {
//     alert("❌ Please open Microsoft Teams first");
//     return;
//   }

//   try {
//     document.getElementById("startBtn").disabled = true;
//     document.getElementById("startBtn").textContent = "Starting...";
//     document.getElementById("status").textContent = "🟡 Starting recording with audio...";

//     // Request microphone permission first
//     try {
//       const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       // Immediately stop the test stream
//       micStream.getTracks().forEach(track => track.stop());
//       console.log("✅ Microphone permission granted");
//     } catch (micError) {
//       console.warn("⚠️ Microphone permission not granted:", micError);
//       // Continue without microphone
//     }

//     // Open a new window for recording
//     chrome.windows.create({
//       url: chrome.runtime.getURL("recorder.html"),
//       type: "popup",
//       width: 400,
//       height: 200,
//       focused: false
//     }, (window) => {
//       console.log("✅ Recorder window opened:", window.id);
      
//       // Send tab ID to recorder window after a short delay
//       setTimeout(() => {
//         chrome.runtime.sendMessage({ 
//           action: "startRecording", 
//           tabId: activeTabId,
//           windowId: window.id
//         });
//       }, 500);
//     });

//   } catch (error) {
//     console.error("❌ Start recording failed:", error);
//     document.getElementById("status").textContent = "❌ Failed to start";
//     alert("Failed to start recording: " + error.message);
//     updateUIForReady();
//   }
// });

// // Stop Recording
// document.getElementById("stopBtn").addEventListener("click", async () => {
//   console.log("🛑 Stop recording clicked");
  
//   try {
//     document.getElementById("stopBtn").disabled = true;
//     document.getElementById("stopBtn").textContent = "Stopping...";
//     document.getElementById("status").textContent = "🟡 Stopping recording...";

//     const response = await chrome.runtime.sendMessage({ action: "stopRecording" });
    
//     if (response && response.success) {
//       isRecording = false;
//       document.getElementById("status").textContent = "✅ Recording saved! Check downloads.";
//       console.log("✅ Recording stopped successfully");
      
//       setTimeout(() => {
//         updateUIForReady();
//       }, 3000);
//     }
    
//   } catch (error) {
//     console.error("❌ Stop recording failed:", error);
//     document.getElementById("status").textContent = "❌ Stop failed";
//     alert("Failed to stop recording: " + error.message);
//     updateUIForReady();
//   }
// });

// // Listen for updates from background
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.action === "timerUpdate") {
//     document.getElementById("timer").textContent = message.time;
//   }
  
//   if (message.action === "recordingStarted") {
//     isRecording = true;
//     updateUIForRecording("00:00");
//   }
  
//   if (message.action === "recordingStopped") {
//     isRecording = false;
//     updateUIForReady();
//   }
// });










let activeTabId;
let isRecording = false;

// Check current tab on popup open
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔍 Popup opened - checking tab...");
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && /https:\/\/.*teams.*\.com/.test(tab.url)) {
      activeTabId = tab.id;
      console.log("✅ Teams tab detected:", activeTabId);
    }

    // Check current recording status
    await checkRecordingStatus();
    
  } catch (error) {
    console.error("❌ Error checking tab:", error);
  }
});

// Check recording status
async function checkRecordingStatus() {
  try {
    const result = await chrome.storage.local.get(['isRecording', 'recordingTime']);
    isRecording = result.isRecording || false;
    
    if (isRecording) {
      updateUIForRecording(result.recordingTime || "00:00");
      console.log("✅ Recording active in background");
    } else {
      updateUIForReady();
      console.log("✅ Ready to record");
    }
  } catch (error) {
    console.error("❌ Error checking recording status:", error);
    updateUIForReady();
  }
}

function updateUIForRecording(recordingTime) {
  document.getElementById("startBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("timer").textContent = recordingTime;
  document.getElementById("status").textContent = "🟢 Recording in background...";
  document.getElementById("startBtn").textContent = "Recording...";
  document.getElementById("warning").style.display = "none";
}

function updateUIForReady() {
  document.getElementById("startBtn").disabled = !activeTabId;
  document.getElementById("stopBtn").disabled = true;
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("status").textContent = activeTabId ? "✅ Ready to record" : "❌ Please open Microsoft Teams";
  document.getElementById("startBtn").textContent = "Start Recording";
  document.getElementById("warning").style.display = "block";
}

// Start Recording - Open new tab for recording
document.getElementById("startBtn").addEventListener("click", async () => {
  console.log("🎬 Start recording clicked");
  
  if (!activeTabId) {
    alert("❌ Please open Microsoft Teams first");
    return;
  }

  try {
    document.getElementById("startBtn").disabled = true;
    document.getElementById("startBtn").textContent = "Starting...";
    document.getElementById("status").textContent = "🟡 Starting recording...";

    // Create a new tab for recording (this will keep recording alive)
    chrome.tabs.create({
      url: chrome.runtime.getURL("recorder.html"),
      active: false // Open in background
    }, (tab) => {
      console.log("✅ Recorder tab opened:", tab.id);
      
      // Send tab ID to recorder after a delay
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { 
          action: "startRecording", 
          tabId: activeTabId 
        });
      }, 1000);
    });

  } catch (error) {
    console.error("❌ Start recording failed:", error);
    document.getElementById("status").textContent = "❌ Failed to start";
    alert("Failed to start recording: " + error.message);
    updateUIForReady();
  }
});

// Stop Recording
document.getElementById("stopBtn").addEventListener("click", async () => {
  console.log("🛑 Stop recording clicked");
  
  try {
    document.getElementById("stopBtn").disabled = true;
    document.getElementById("stopBtn").textContent = "Stopping...";
    document.getElementById("status").textContent = "🟡 Stopping recording...";

    // Find and stop the recorder tab
    const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL("recorder.html") });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecording" });
    } else {
      // If recorder tab not found, clear storage
      await chrome.storage.local.remove(['isRecording', 'recordingTime']);
      updateUIForReady();
    }
    
  } catch (error) {
    console.error("❌ Stop recording failed:", error);
    document.getElementById("status").textContent = "❌ Stop failed";
    alert("Failed to stop recording: " + error.message);
    updateUIForReady();
  }
});

// Listen for updates from recorder tab
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "timerUpdate") {
    document.getElementById("timer").textContent = message.time;
  }
  
  if (message.action === "recordingStarted") {
    isRecording = true;
    updateUIForRecording("00:00");
  }
  
  if (message.action === "recordingStopped") {
    isRecording = false;
    updateUIForReady();
  }
});