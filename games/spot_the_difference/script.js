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
    const debugButton = document.getElementById('debugButton');

    // Define differences: { x, y, width, height, found }
    // Coordinates are relative to the image (percentage-based for better scaling)
    // These are example areas - adjust based on actual image differences
    const differences = [
        { x: 0.4, y: 0.2, width: 0.2, height: 0.2, found: false }, // Center area (40%, 20% from top-left, 20% width/height)
        { x: 0.1, y: 0.5, width: 0.15, height: 0.15, found: false }, // Left area
        { x: 0.7, y: 0.6, width: 0.12, height: 0.12, found: false }  // Right area
    ];

    let differencesFound = 0;
    const totalDifferences = differences.length;
    let debugMode = false; // Set to true to see click coordinates

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
        // Convert percentage-based coordinates to actual canvas coordinates
        const x = difference.x * canvasContext.canvas.width;
        const y = difference.y * canvasContext.canvas.height;
        const width = difference.width * canvasContext.canvas.width;
        const height = difference.height * canvasContext.canvas.height;

        canvasContext.strokeStyle = 'red';
        canvasContext.lineWidth = 3;
        // Draw a circle around the difference area
        canvasContext.beginPath();
        canvasContext.arc(x + width/2, y + height/2, Math.max(width, height)/2 + 10, 0, 2 * Math.PI);
        canvasContext.stroke();
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
        
        // Debug mode: show click coordinates
        if (debugMode) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'blue';
            ctx.fillRect(clickX - 2, clickY - 2, 4, 4);
            console.log(`Percentage coordinates: ${(clickX/canvas.width).toFixed(2)}, ${(clickY/canvas.height).toFixed(2)}`);
        }

        differences.forEach(diff => {
            if (!diff.found) {
                // Convert percentage-based coordinates to actual canvas coordinates
                const diffAreaX = diff.x * canvas.width;
                const diffAreaY = diff.y * canvas.height;
                const diffAreaWidth = diff.width * canvas.width;
                const diffAreaHeight = diff.height * canvas.height;

                if (clickX >= diffAreaX && clickX <= diffAreaX + diffAreaWidth &&
                    clickY >= diffAreaY && clickY <= diffAreaY + diffAreaHeight) {

                    diff.found = true;
                    differencesFound++;
                    highlightDifference(diff, ctxA); // Highlight on image A
                    highlightDifference(diff, ctxB); // Highlight on image B
                    updateDifferencesCount();
                    checkCompletion();
                    
                    // Show success feedback
                    showSuccessFeedback(clickX, clickY, canvas);
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

    // Success feedback function
    function showSuccessFeedback(x, y, canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'green';
        ctx.font = '24px Arial';
        ctx.fillText('✓', x - 12, y + 8);
        
        setTimeout(() => {
            ctx.clearRect(x - 20, y - 20, 40, 40);
        }, 1000);
    }

    // Hint function
    function showHint() {
        const unFoundDifferences = differences.filter(diff => !diff.found);
        if (unFoundDifferences.length > 0) {
            const randomDiff = unFoundDifferences[Math.floor(Math.random() * unFoundDifferences.length)];
            
            // Convert percentage coordinates to canvas coordinates
            const x = randomDiff.x * canvasA.width;
            const y = randomDiff.y * canvasA.height;
            const width = randomDiff.width * canvasA.width;
            const height = randomDiff.height * canvasA.height;
            
            // Flash hint on both canvases
            [ctxA, ctxB].forEach(ctx => {
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(x + width/2, y + height/2, Math.max(width, height)/2 + 15, 0, 2 * Math.PI);
                ctx.stroke();
            });
            
            // Remove hint after 3 seconds
            setTimeout(() => {
                setupCanvases(); // Redraw everything to clear hint
            }, 3000);
        } else {
            alert('No more differences to find! 🎉');
        }
    }

    // Debug mode toggle
    function toggleDebugMode() {
        debugMode = !debugMode;
        debugButton.textContent = debugMode ? '🔧 Debug: ON' : '🔧 Debug Mode';
        debugButton.style.backgroundColor = debugMode ? '#ffc107' : '#fff';
        
        if (debugMode) {
            alert('Debug mode ON: Click anywhere to see coordinates in console');
        }
    }

    // Event listeners
    resetButton.addEventListener('click', resetGame);
    hintButton.addEventListener('click', showHint);
    debugButton.addEventListener('click', toggleDebugMode);

    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    // Optional: Recalculate canvas sizes on window resize if layout is responsive
    window.addEventListener('resize', setupCanvases);
});
