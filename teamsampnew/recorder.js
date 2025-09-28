// // This runs in a separate window that stays open for recording
// let mediaRecorder;
// let recordedChunks = [];
// let isRecording = false;
// let timerInterval;

// console.log("🎬 Recorder window started");

// // Listen for start recording command
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("📨 Recorder received:", message.action);
  
//   if (message.action === "startRecording") {
//     startRecording(message.tabId, message.windowId);
//     sendResponse({ success: true });
//   }
  
//   if (message.action === "stopRecording") {
//     stopRecording();
//     sendResponse({ success: true });
//   }
  
//   return true;
// });

// async function startRecording(tabId, windowId) {
//   console.log("🎬 Starting recording for tab:", tabId);
  
//   if (isRecording) return;

//   try {
//     // Get tab stream - this works because we're in a window context
//     const tabStream = await new Promise((resolve, reject) => {
//       chrome.tabCapture.capture({
//         audio: true,
//         video: true,
//         audioConstraints: {
//           mandatory: {
//             chromeMediaSource: 'tab',
//             echoCancellation: true
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

//     // Setup MediaRecorder
//     const mimeTypes = [
//       'video/webm;codecs=vp9,opus',
//       'video/webm;codecs=vp8,opus',
//       'video/webm'
//     ];

//     const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

//     mediaRecorder = new MediaRecorder(tabStream, {
//       mimeType: supportedType,
//       videoBitsPerSecond: 3000000
//     });

//     recordedChunks = [];
//     isRecording = true;

//     mediaRecorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         recordedChunks.push(event.data);
//         console.log("📦 Data chunk:", event.data.size, "bytes");
        
//         // Save to storage periodically
//         saveToStorage();
//       }
//     };

//     mediaRecorder.onstop = () => {
//       console.log("🛑 Recording stopped");
//       downloadRecording();
//       cleanup();
//     };

//     // Start recording
//     mediaRecorder.start(1000);
//     console.log("✅ Recording started in background window!");
    
//     // Start timer
//     startTimer();
    
//     // Notify popup
//     chrome.runtime.sendMessage({ action: "recordingStarted" });

//   } catch (error) {
//     console.error("❌ Recording start failed:", error);
//     document.getElementById("status").textContent = "❌ Recording failed: " + error.message;
//   }
// }

// function stopRecording() {
//   if (mediaRecorder && isRecording) {
//     mediaRecorder.stop();
//   }
// }

// function startTimer() {
//   let seconds = 0;
  
//   if (timerInterval) clearInterval(timerInterval);
  
//   timerInterval = setInterval(() => {
//     seconds++;
//     const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
//     const secs = String(seconds % 60).padStart(2, "0");
//     const timeString = `${minutes}:${secs}`;
    
//     // Send timer update to popup
//     chrome.runtime.sendMessage({ action: "timerUpdate", time: timeString });
//   }, 1000);
// }

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

//     chrome.downloads.download({
//       url: url,
//       filename: filename,
//       saveAs: true
//     });

//     console.log("💾 Download initiated:", filename);
    
//   } catch (error) {
//     console.error("❌ Download failed:", error);
//   }
// }

// function saveToStorage() {
//   // Save recording state
//   chrome.storage.local.set({
//     isRecording: true,
//     recordedChunksSize: recordedChunks.length
//   });
// }

// function cleanup() {
//   isRecording = false;
  
//   if (timerInterval) {
//     clearInterval(timerInterval);
//     timerInterval = null;
//   }
  
//   recordedChunks = [];
  
//   // Clear storage
//   chrome.storage.local.remove(['isRecording']);
  
//   // Close this window
//   window.close();
// }

// // Keep this window alive
// setInterval(() => {
//   // Just keep running
// }, 1000);








/// This runs in a separate tab that stays open for recording
let mediaRecorder;
let recordedChunks = [];
let isRecording = false;
let timerInterval;
let recordingStartTime;

console.log("🎬 Recorder tab loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Recorder received:", message.action);
  
  if (message.action === "startRecording") {
    startRecording(message.tabId);
    sendResponse({ success: true });
  }
  
  if (message.action === "stopRecording") {
    stopRecording();
    sendResponse({ success: true });
  }
  
  return true;
});

async function startRecording(tabId) {
  console.log("🎬 Starting recording for tab:", tabId);
  
  if (isRecording) return;

  try {
    document.getElementById("status").textContent = "🟡 Starting recording...";

    // Get tab stream - this works because we're in a tab context
    const tabStream = await new Promise((resolve, reject) => {
      chrome.tabCapture.capture({
        audio: true,
        video: true,
        audioConstraints: {
          mandatory: {
            chromeMediaSource: 'tab',
            echoCancellation: true
          }
        }
      }, (stream) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!stream) {
          reject(new Error("Could not capture tab stream"));
          return;
        }
        resolve(stream);
      });
    });

    console.log("✅ Tab stream captured");

    let finalStream = tabStream;

    // Try to add microphone audio
    try {
      console.log("🎤 Attempting to capture microphone...");
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      console.log("✅ Microphone captured");

      // Mix audio using AudioContext
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      const tabAudioSource = audioContext.createMediaStreamSource(
        new MediaStream(tabStream.getAudioTracks())
      );
      const micAudioSource = audioContext.createMediaStreamSource(micStream);

      tabAudioSource.connect(destination);
      micAudioSource.connect(destination);

      // Create final stream with mixed audio
      finalStream = new MediaStream([
        ...tabStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      console.log("✅ Audio mixed successfully");

    } catch (micError) {
      console.warn("⚠️ Microphone not available, using tab audio only:", micError);
      // Continue with tab audio only
      finalStream = tabStream;
    }

    // Setup MediaRecorder
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];

    const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
    console.log("🎥 Using MIME type:", supportedType);

    mediaRecorder = new MediaRecorder(finalStream, {
      mimeType: supportedType,
      videoBitsPerSecond: 3000000
    });

    recordedChunks = [];
    isRecording = true;
    recordingStartTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log("📦 Data chunk:", event.data.size, "bytes");
      }
    };

    mediaRecorder.onstop = () => {
      console.log("🛑 Recording stopped");
      stopTimer();
      downloadRecording();
      cleanup();
    };

    mediaRecorder.onerror = (event) => {
      console.error("❌ MediaRecorder error:", event);
      document.getElementById("status").textContent = "❌ Recording error";
      cleanup();
    };

    // Start recording
    mediaRecorder.start(1000);
    console.log("✅ Recording started in background tab!");

    // Update UI
    document.getElementById("status").textContent = "🟢 Recording in background...";
    startTimer();

    // Save recording state to storage
    await chrome.storage.local.set({ 
      isRecording: true,
      recordingStartTime: recordingStartTime
    });

    // Notify popup
    chrome.runtime.sendMessage({ action: "recordingStarted" });

  } catch (error) {
    console.error("❌ Recording start failed:", error);
    document.getElementById("status").textContent = "❌ Recording failed: " + error.message;
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    console.log("🛑 Stopping recording...");
    mediaRecorder.stop();
  }
}

function startTimer() {
  let seconds = 0;
  const timerEl = document.getElementById("timer");
  
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    const timeString = `${minutes}:${secs}`;
    
    timerEl.textContent = timeString;
    
    // Save time to storage
    chrome.storage.local.set({ recordingTime: timeString });
    
    // Send timer update to popup
    chrome.runtime.sendMessage({ action: "timerUpdate", time: timeString });
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function downloadRecording() {
  if (recordedChunks.length === 0) {
    console.warn("⚠️ No recorded data");
    document.getElementById("status").textContent = "❌ No recording data";
    return;
  }

  try {
    console.log("💾 Preparing download, chunks:", recordedChunks.length);
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('Z')[0];
    const filename = `teams-recording-${timestamp}.webm`;

    console.log("💾 Downloading:", filename);

    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Download error:", chrome.runtime.lastError);
        fallbackDownload(blob, filename);
      } else {
        console.log("✅ Download started with ID:", downloadId);
        document.getElementById("status").textContent = "✅ Recording saved!";
      }
    });

  } catch (error) {
    console.error("❌ Download failed:", error);
    document.getElementById("status").textContent = "❌ Download failed";
  }
}

function fallbackDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  document.getElementById("status").textContent = "✅ Recording saved!";
}

function cleanup() {
  isRecording = false;
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (mediaRecorder && mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
  
  recordedChunks = [];
  
  // Clear storage
  chrome.storage.local.remove(['isRecording', 'recordingTime', 'recordingStartTime']);
  
  // Notify popup
  chrome.runtime.sendMessage({ action: "recordingStopped" });
  
  document.getElementById("status").textContent = "✅ Recording completed";
  
  // Close this tab after delay
  setTimeout(() => {
    window.close();
  }, 3000);
}

// Keep this tab alive
setInterval(() => {
  // Just keep running
}, 10000);