async function autoSongDownloadAndCreate() {
  console.log("🚀 Starting MP3 download and song creation automation...");

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const waitForElement = async (selector, container = document, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = container.querySelector(selector);
      if (el) return el;
      await wait(100);
    }
    return null;
  };

  const realClick = (el) => {
    ["pointerdown", "mousedown", "mouseup", "click"].forEach(type => {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    });
  };

  function setReactValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  try {
    // =============================
    // STEP 1-5: Download MP3
    // =============================
    const grid = await waitForElement('.react-aria-GridList');
    if (!grid) throw new Error("❌ Grid not found!");
    const firstSong = grid.querySelector('[role="row"], .react-aria-GridListItem');
    if (!firstSong) throw new Error("❌ No songs found!");
    realClick(firstSong);
    console.log("🎵 Selected first song");
    await wait(500);

    const moreOptionsBtn = firstSong.querySelector('button[aria-label="More Options"]');
    if (!moreOptionsBtn) throw new Error("❌ More Options not found!");
    realClick(moreOptionsBtn);
    console.log("🔽 Clicked More Options");
    await wait(500);

    const downloadBtn = await waitForElement('[data-testid="download-sub-trigger"]') 
                      || Array.from(document.querySelectorAll('span, button'))
                         .find(el => el.textContent.trim().toLowerCase() === "download");
    if (!downloadBtn) throw new Error("❌ Download option not found!");
    realClick(downloadBtn);
    console.log("⬇ Clicked Download");
    await wait(500);

    const mp3Btn = Array.from(document.querySelectorAll('button, [role="menuitem"], span'))
      .find(el => el.textContent.trim().toLowerCase().includes("mp3 audio"));
    if (!mp3Btn) throw new Error("❌ MP3 Audio option not found!");
    realClick(mp3Btn);
    console.log("🎧 Clicked MP3 Audio");
    await wait(500);

    const downloadAnywayBtn = Array.from(document.querySelectorAll('button'))
      .find(el => el.textContent.trim().toLowerCase().includes("download anyway"));
    if (!downloadAnywayBtn) throw new Error("❌ 'Download Anyway' button not found!");
    realClick(downloadAnywayBtn);
    console.log("✅ MP3 Audio downloaded successfully!");
    await wait(500);

    // =============================
    // STEP 6: Create new song
    // =============================
    const lyricsBox = document.querySelector('textarea[data-testid="lyrics-input-textarea"]');
    const styleBox = document.querySelector('textarea[data-testid="tag-input-textarea"]');
    const titleBox = document.querySelector('input[placeholder="Enter song title"]');
    const createBtn = document.querySelector('button[data-testid="create-button"]');

    if (!lyricsBox || !styleBox || !titleBox || !createBtn) {
      console.error("❌ One or more fields/buttons not found for song creation!");
      return;
    }

    const lyrics = 
      "Under the streetlight, your eyes meet mine,\n" +
      "Every little moment feels frozen in time,\n" +
      "Your laugh’s like a melody, soft and true,\n" +
      "And my guitar’s just strumming the thought of you.\n\n" +
      "We’re dancing barefoot on the city stones,\n" +
      "Writing our story in a song of our own,\n" +
      "If the night keeps us here, I’ll play ‘til it’s through,\n" +
      "Every chord is a heartbeat that’s pulling me to you.";

    const style = "Pop, Acoustic, Shawn Mendes style, Guitar";
    const title = "Streetlight Serenade";

    setReactValue(lyricsBox, lyrics);
    setReactValue(styleBox, style);
    setReactValue(titleBox, title);

    // =============================
    // STEP 7: Observe workspace for new song and wait for Publish
    // =============================
    const workspaceContainer = document.querySelector("#__next main") || document.body;

    const newSongPromise = new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              if (node.innerText?.toLowerCase().includes("loading") || node.querySelector("svg")) {
                console.log("🆕 New song element detected in workspace!");
                observer.disconnect();
                resolve(node);
                return;
              }
            }
          }
        }
      });
      observer.observe(workspaceContainer, { childList: true, subtree: true });
    });

    // Click Create
    createBtn.click();
    console.log("▶ Create button clicked. Waiting for new song...");

    const newSongElement = await newSongPromise;

    // Wait for Publish button inside the new song
    const waitForPublishBtn = async (container) => {
      const start = Date.now();
      const timeout = 60000;
      while (Date.now() - start < timeout) {
        const publishBtn = container.querySelector("span.relative.flex.flex-row.items-center.justify-center.gap-1, button");
        if (publishBtn) return publishBtn;
        await wait(500);
      }
      throw new Error("Timeout waiting for Publish button in new song!");
    };

    const publishBtn = await waitForPublishBtn(newSongElement);

    // ✅ Clean logging without dumping HTML
    console.log("✅ Publish button found with text:", publishBtn.textContent.trim());
    console.log("📄 Song Details:", { title: titleBox.value, lyrics: lyricsBox.value, style: styleBox.value });

    // Optional: Auto-click publish
    // realClick(publishBtn);
    // console.log("🚀 Publish button clicked automatically!");

  } catch (err) {
    console.error("❌ Error in automation:", err);
  }
}

// Run everything
autoSongDownloadAndCreate();
