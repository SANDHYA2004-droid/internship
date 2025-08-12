// Helper to set value in React-controlled inputs
function setReactValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

// Observe new song being created
function observeNewSong(callback) {
    const observerTarget = document.querySelector('.react-aria-GridList');
    if (!observerTarget) {
        console.error("❌ Song list container not found!");
        return;
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('react-aria-GridListItem')) {
                    console.log("📀 New song row detected");

                    // Poll until title appears
                    const poll = setInterval(() => {
                        const titleSpan = node.querySelector('span.line-clamp-1[title]');
                        const lyricsDiv = node.querySelector('[data-testid="lyrics"]');
                        const title = titleSpan?.getAttribute('title') || '';
                        const lyrics = lyricsDiv?.innerText || '';

                        if (title && title !== "Untitled") {
                            callback({ title, lyrics });
                            clearInterval(poll);
                            observer.disconnect();
                        }
                    }, 200);
                }
            });
        }
    });

    observer.observe(observerTarget, { childList: true, subtree: true });
}

// Main function to fill English song
function custom_fill() {
    const lyricsBox = document.querySelector('textarea[data-testid="lyrics-input-textarea"]');
    const styleBox = document.querySelector('textarea[data-testid="tag-input-textarea"]');
    const titleBox = document.querySelector('input[placeholder="Enter song title"]');
    const createBtn = document.querySelector('button[data-testid="create-button"]');

    if (!lyricsBox || !styleBox || !titleBox || !createBtn) {
        console.error("❌ One or more fields/buttons not found!");
        return;
    }

    // English song details
    const title = "Sky of Dreams";
    const lyrics = "Under the sky of dreams, I’ll fly with you\nThrough the stars and endless blue\nEvery heartbeat finds its tune\nWhen I’m dancing here with you";
    const style = "English Pop Ballad";

    // Fill inputs
    setReactValue(lyricsBox, lyrics);
    setReactValue(styleBox, style);
    setReactValue(titleBox, title);

    // Start observer before creating
    observeNewSong((song) => {
        console.log("🎵 New song created:", song);
    });

    // Click when enabled
    const check = setInterval(() => {
        if (!createBtn.disabled) {
            clearInterval(check);
            console.log("✅ Clicking create button");
            createBtn.click();
        }
    }, 100);
}

// Run it
custom_fill();
