function isInMeeting() {
  const url = window.location.href;

  // Teams Live (v2)
  if (url.includes("teams.live.com/v2/")) return true;

  // Classic Teams (web app)
  if (url.includes("teams.microsoft.com") && url.includes("meeting")) return true;

  return false;
}

let wasInMeeting = false;

setInterval(() => {
  const inMeeting = isInMeeting();

  if (inMeeting && !wasInMeeting) {
    console.log("✅ Meeting joined");
    chrome.runtime.sendMessage({ action: "onMeetingStart" });
    wasInMeeting = true;
  } else if (!inMeeting && wasInMeeting) {
    console.log("❌ Meeting left");
    chrome.runtime.sendMessage({ action: "onMeetingEnd" });
    wasInMeeting = false;
  }
}, 3000); // check every 3s