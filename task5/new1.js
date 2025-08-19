(async function autoSongMakerAndDownloader() {
  console.log("🚀 Automation started...");

  // === Utilities ===
  const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const waitForNode = async (selector, root = document, timeout = 10000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const el = root.querySelector(selector);
      if (el) return el;
      await pause(250);
    }
    return null;
  };

  const fireClick = (el) => {
    ["pointerdown", "mousedown", "mouseup", "click"].forEach(evt =>
      el.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true }))
    );
  };

  function updateReactInput(el, val) {
    const proto = el.tagName === "TEXTAREA"
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // === Step 1: Fill in Song Details ===
  const songTitle = "Moonlight";
  const titleInput = await waitForNode('input[placeholder="Enter song title"]');
  if (titleInput) {
    updateReactInput(titleInput, songTitle);
    console.log("📝 Title added");
  }

  const lyricsInput = await waitForNode('textarea[data-testid="lyrics-input-textarea"]');
  if (lyricsInput) {
    updateReactInput(
      lyricsInput,
      `Under the silver moon, the waves softly sing,
The night carries whispers the daylight can't bring.
Stars paint the sky with a shimmering hue,
And every beat of my heart dances for you.`
    );
    console.log("🎤 Lyrics inserted");
  }

  const styleInput = await waitForNode('textarea[data-testid="tag-input-textarea"]');
  if (styleInput) {
    updateReactInput(styleInput, "metal, basso, megabass");
    console.log("🎶 Style tags set");
  }

  const createBtn = await waitForNode('button[data-testid="create-button"]');
  if (createBtn && !createBtn.disabled) {
    createBtn.click();
    console.log("🎯 Create button pressed");
  } else {
    console.error("⚠️ Couldn’t find an active Create button");
    return;
  }

  // === Step 2: Watch for new song row ===
  console.log("👀 Monitoring for song row...");
  const songList = await waitForNode('.custom-scrollbar-transparent.flex-1.overflow-y-auto');
  if (!songList) {
    console.error("⚠️ Song list container not found");
    return;
  }

  const listObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.matches('[role="row"]')) {
          const rowName = node.getAttribute("aria-label");
          if (rowName === songTitle) {
            console.log(`🎶 New track "${songTitle}" appeared`);

            // now track Publish button
            const publishWatcher = new MutationObserver(async (mut2s) => {
              for (const mut2 of mut2s) {
                for (const child of mut2.addedNodes) {
                  if (child.nodeType === 1) {
                    const publishBtns = child.querySelectorAll("button span");
                    for (const span of publishBtns) {
                      if (span.textContent.trim() === "Publish") {
                        console.log(`✅ Track "${songTitle}" is ready (Publish visible)`);

                        // get details
                        const finalTitle = document.querySelector('input[placeholder="Enter song title"]')?.value || "(untitled)";
                        const finalLyrics = document.querySelector('textarea[data-testid="lyrics-input-textarea"]')?.value || "(no lyrics)";
                        console.log("📌 Song Info:");
                        console.log("→ Title:", finalTitle);
                        console.log("→ Lyrics:", finalLyrics);

                        // === Step 3: Try download ===
                        const moreBtn = node.querySelector('button[aria-label="More Options"]');
                        if (moreBtn) {
                          fireClick(moreBtn);
                          await pause(400);

                          const dlOption =
                            await waitForNode('[data-testid="download-sub-trigger"]', node, 5000) ||
                            [...document.querySelectorAll('span, button')]
                              .find(el => el.textContent.trim().toLowerCase() === "download");

                          if (dlOption) {
                            fireClick(dlOption);
                            console.log("⬇️ preparing Download options");
                            await pause(400);

                            const mp3Choice = [...document.querySelectorAll("button, [role='menuitem'], span")]
                              .find(el => el.textContent.toLowerCase().includes("mp3 audio"));
                            if (mp3Choice) {
                              fireClick(mp3Choice);
                              console.log("🎼 MP3 selected");
                              await pause(400);

                              const confirmBtn = [...document.querySelectorAll("button")]
                                .find(el => el.textContent.toLowerCase().includes("download anyway"));
                              if (confirmBtn) {
                                fireClick(confirmBtn);
                                console.log("✅ Download sucessful");
                              }
                            }
                          }
                        }

                        publishWatcher.disconnect();
                        return;
                      }
                    }
                  }
                }
              }
            });
            publishWatcher.observe(node, { childList: true, subtree: true });
            listObserver.disconnect();
          }
        }
      }
    }
  });

  listObserver.observe(songList, { childList: true, subtree: true });
})();
