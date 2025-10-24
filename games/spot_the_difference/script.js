document.addEventListener('DOMContentLoaded', () => {
    const imageA = document.getElementById('imageA');
    const imageB = document.getElementById('imageB');
    const homeButton = document.getElementById('homeButton');
    const canvasA = document.getElementById('canvasA');
    const canvasB = document.getElementById('canvasB');
    const ctxA = canvasA.getContext('2d');
    const ctxB = canvasB.getContext('2d');
    const messageArea = document.getElementById('message-area');
    const differencesCountSpan = document.getElementById('differences-count');
    const resetButton = document.getElementById('resetButton');
    const hintButton = document.getElementById('hintButton');

    // Define differences: { x, y, width, height, found }
    // Coordinates are relative to the image.
    // For the example SVGs (400x300), adding multiple differences for better gameplay
    const differences = [
        { x: 200, y: 50, width: 100, height: 100, found: false },
        { x: 50, y: 150, width: 80, height: 80, found: false },
        { x: 300, y: 200, width: 60, height: 60, found: false }
    ];

    let differencesFound = 0;
    const totalDifferences = differences.length;

    function setupCanvases() {
        // Ensure images are loaded before getting their dimensions
        let loadedImages = 0;
        const images = [imageA, imageB];

        images.forEach(img => {
            if (img.complete) {
                loadedImages++;
                if (loadedImages === images.length) {
                    setCanvasDimensions();
                }
            } else {
                img.onload = () => {
                    loadedImages++;
                    if (loadedImages === images.length) {
                        setCanvasDimensions();
                    }
                };
            }
        });
    }

    function setCanvasDimensions() {
        // Set canvas dimensions to match the display size of the images
        canvasA.width = imageA.clientWidth;
        canvasA.height = imageA.clientHeight;
        canvasB.width = imageB.clientWidth;
        canvasB.height = imageB.clientHeight;
        console.log(`Canvas A: ${canvasA.width}x${canvasA.height}, Canvas B: ${canvasB.width}x${canvasB.height}`);
        updateDifferencesCount();
    }


    function updateDifferencesCount() {
        const remaining = totalDifferences - differencesFound;
        if (differencesFound === totalDifferences) {
            messageArea.innerHTML = '<p style="color: #28a745; font-size: 1.5em;">🎉 Congratulations! You found all the differences! 🎉</p>';
        } else {
            messageArea.innerHTML = `<p>Find <span id="differences-count" style="color: #007bff; font-weight: bold;">${remaining}</span> more difference${remaining > 1 ? 's' : ''}.</p>`;
        }
    }

    function highlightDifference(difference, canvasContext) {
        // Scale coordinates and dimensions if canvas is not same size as original image
        const scaleX = canvasContext.canvas.width / (imageA.naturalWidth || 400); // Use naturalWidth or fallback to SVG original
        const scaleY = canvasContext.canvas.height / (imageA.naturalHeight || 300);

        const x = difference.x * scaleX;
        const y = difference.y * scaleY;
        const width = difference.width * scaleX;
        const height = difference.height * scaleY;

        canvasContext.strokeStyle = 'red';
        canvasContext.lineWidth = 3;
        // Draw a rectangle for the square difference. For circles, use arc.
        canvasContext.strokeRect(x, y, width, height);
    }

    function checkCompletion() {
        if (differencesFound === totalDifferences) {
            updateDifferencesCount(); // This will show the completion message
        }
    }

    function handleImageClick(event) {
        if (differencesFound === totalDifferences) return; // Game already completed

        const canvas = event.target;
        const rect = canvas.getBoundingClientRect(); // Gets actual position on screen
        // offsetX and offsetY give click relative to the canvas element
        const clickX = event.offsetX;
        const clickY = event.offsetY;

        console.log(`Click on ${canvas.id} at: ${clickX}, ${clickY}`);

        differences.forEach(diff => {
            if (!diff.found) {
                // Scale difference coordinates to the current canvas display size
                const scaleX = canvas.width / (imageA.naturalWidth || 400);
                const scaleY = canvas.height / (imageA.naturalHeight || 300);

                const diffAreaX = diff.x * scaleX;
                const diffAreaY = diff.y * scaleY;
                const diffAreaWidth = diff.width * scaleX;
                const diffAreaHeight = diff.height * scaleY;

                if (clickX >= diffAreaX && clickX <= diffAreaX + diffAreaWidth &&
                    clickY >= diffAreaY && clickY <= diffAreaY + diffAreaHeight) {

                    diff.found = true;
                    differencesFound++;
                    highlightDifference(diff, ctxA); // Highlight on image A
                    highlightDifference(diff, ctxB); // Highlight on image B
                    updateDifferencesCount();
                    checkCompletion();
                }
            }
        });
    }

    // Initial setup
    setupCanvases(); // Set canvas sizes after images are loaded
    updateDifferencesCount();

    // Event listeners for clicks on both canvases
    canvasA.addEventListener('click', handleImageClick);
    canvasB.addEventListener('click', handleImageClick);

    // Reset game function
    function resetGame() {
        differences.forEach(diff => diff.found = false);
        differencesFound = 0;
        ctxA.clearRect(0, 0, canvasA.width, canvasA.height);
        ctxB.clearRect(0, 0, canvasB.width, canvasB.height);
        updateDifferencesCount();
    }

    // Hint function
    function showHint() {
        const unFoundDifferences = differences.filter(diff => !diff.found);
        if (unFoundDifferences.length > 0) {
            const randomDiff = unFoundDifferences[Math.floor(Math.random() * unFoundDifferences.length)];
            
            // Temporarily highlight the difference area
            const scaleX = canvasA.width / (imageA.naturalWidth || 400);
            const scaleY = canvasA.height / (imageA.naturalHeight || 300);
            
            const x = randomDiff.x * scaleX;
            const y = randomDiff.y * scaleY;
            const width = randomDiff.width * scaleX;
            const height = randomDiff.height * scaleY;
            
            // Flash hint on both canvases
            [ctxA, ctxB].forEach(ctx => {
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, width, height);
            });
            
            // Remove hint after 2 seconds
            setTimeout(() => {
                [ctxA, ctxB].forEach(ctx => {
                    ctx.clearRect(x - 2, y - 2, width + 4, height + 4);
                });
            }, 2000);
        }
    }

    // Event listeners
    resetButton.addEventListener('click', resetGame);
    hintButton.addEventListener('click', showHint);

    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    // Optional: Recalculate canvas sizes on window resize if layout is responsive
    window.addEventListener('resize', setupCanvases);
});
