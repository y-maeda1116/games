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

    // Define differences: { x, y, radius, found, description }
    // Coordinates are relative to the image (percentage-based for better scaling)
    // Using circular areas for easier clicking
    const differences = [
        { x: 0.5, y: 0.3, radius: 0.1, found: false, description: "Center difference" },
        { x: 0.2, y: 0.6, radius: 0.08, found: false, description: "Left side difference" },
        { x: 0.8, y: 0.7, radius: 0.08, found: false, description: "Right side difference" }
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
        const centerX = difference.x * canvasContext.canvas.width;
        const centerY = difference.y * canvasContext.canvas.height;
        const radius = difference.radius * Math.min(canvasContext.canvas.width, canvasContext.canvas.height);

        canvasContext.strokeStyle = '#ff0000';
        canvasContext.lineWidth = 4;
        canvasContext.beginPath();
        canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        canvasContext.stroke();
        
        // Add a second circle for better visibility
        canvasContext.strokeStyle = '#ffffff';
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.arc(centerX, centerY, radius + 3, 0, 2 * Math.PI);
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
                const centerX = diff.x * canvas.width;
                const centerY = diff.y * canvas.height;
                const radius = diff.radius * Math.min(canvas.width, canvas.height);

                // Calculate distance from click to center of difference area
                const distance = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));

                if (distance <= radius) {
                    diff.found = true;
                    differencesFound++;
                    highlightDifference(diff, ctxA); // Highlight on image A
                    highlightDifference(diff, ctxB); // Highlight on image B
                    updateDifferencesCount();
                    checkCompletion();
                    
                    // Show success feedback
                    showSuccessFeedback(clickX, clickY, canvas, diff.description);
                    return; // Exit loop once difference is found
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
    function showSuccessFeedback(x, y, canvas, description) {
        const ctx = canvas.getContext('2d');
        
        // Show checkmark
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('✓', x - 15, y + 10);
        
        // Show description if provided
        if (description) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.font = 'bold 14px Arial';
            ctx.strokeText(description, x - 50, y - 20);
            ctx.fillText(description, x - 50, y - 20);
        }
        
        setTimeout(() => {
            // Redraw the canvas to clear feedback
            setupCanvases();
        }, 1500);
    }

    // Hint function
    function showHint() {
        const unFoundDifferences = differences.filter(diff => !diff.found);
        if (unFoundDifferences.length > 0) {
            const randomDiff = unFoundDifferences[Math.floor(Math.random() * unFoundDifferences.length)];
            
            // Convert percentage coordinates to canvas coordinates
            const centerX = randomDiff.x * canvasA.width;
            const centerY = randomDiff.y * canvasA.height;
            const radius = randomDiff.radius * Math.min(canvasA.width, canvasA.height);
            
            // Flash hint on both canvases with pulsing effect
            let pulseCount = 0;
            const pulseInterval = setInterval(() => {
                [ctxA, ctxB].forEach(ctx => {
                    // Clear previous hint
                    ctx.clearRect(centerX - radius - 20, centerY - radius - 20, (radius + 20) * 2, (radius + 20) * 2);
                    
                    // Draw pulsing hint circle
                    const pulseRadius = radius + (pulseCount % 2 === 0 ? 10 : 20);
                    ctx.strokeStyle = pulseCount % 2 === 0 ? '#ffff00' : '#ffa500';
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
                    ctx.stroke();
                });
                
                pulseCount++;
                if (pulseCount >= 6) { // Pulse 3 times
                    clearInterval(pulseInterval);
                    setTimeout(() => {
                        setupCanvases(); // Redraw everything to clear hint
                    }, 500);
                }
            }, 300);
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
