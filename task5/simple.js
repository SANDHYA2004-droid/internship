function autoTypeAndCreate(text) {
    const textarea = document.querySelector('textarea[data-testid="prompt-input-textarea"]');
    const button = document.querySelector('button[data-testid="create-button"]');

    if (!textarea || !button) {
        console.error("Textarea or button not found!");
        return;
    }

    textarea.value = text;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    setTimeout(() => {
        button.click();
        console.log(" song creation triggered!");
    }, 500);
}

function observeNewSong(callback) {
    const observerTarget = document.querySelector('.react-aria-GridList');
    if (!observerTarget) {
        console.error("Song list container not found!");
        return;
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.classList.contains('react-aria-GridListItem')) {
                    const poll = setInterval(() => {
                        const titleSpan = node.querySelector('span.line-clamp-1[title]');
                        const lyricsDiv = node.querySelector('div[data-testid="lyrics"]');
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

    observer.observe(observerTarget, { childList: true });
}

observeNewSong((song) => {
    console.log("new song detected:", song); 
});

autoTypeAndCreate("Write an English famous song in the style of Ed Sheeran with romantic lyrics and acoustic guitar.");