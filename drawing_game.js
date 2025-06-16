document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const toolbar = document.getElementById('toolbar');
    const colorPicker = document.getElementById('colorPicker');
    const eraserButton = document.getElementById('eraser');
    const clearButton = document.getElementById('clear');

    // Set canvas dimensions (can be adjusted or made dynamic)
    canvas.width = 800;
    canvas.height = 600;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#000000'; // Default to black
    let currentLineWidth = 5; // Default line width
    let isErasing = false;

    // --- Drawing Event Listeners ---
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        draw(e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mouseup', () => {
        if (isDrawing) {
            // Optional: draw a final dot if the mouse didn't move much,
            // or handle other end-of-stroke logic
            isDrawing = false;
        }
    });

    canvas.addEventListener('mouseout', () => {
        if (isDrawing) {
            // Stop drawing if mouse leaves canvas
            isDrawing = false;
        }
    });

    // --- Drawing Function ---
    function draw(x, y) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);

        if (isErasing) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = currentLineWidth * 2; // Make eraser a bit wider
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentLineWidth;
        }
        ctx.lineCap = 'round'; // Makes lines smoother
        ctx.lineJoin = 'round'; // Makes joins smoother
        ctx.stroke();

        [lastX, lastY] = [x, y];
    }

    // --- Toolbar Functionality (Stubs and Basic Implementation) ---
    function selectColor(color) {
        currentColor = color;
        isErasing = false;
        ctx.globalCompositeOperation = 'source-over'; // Set to normal drawing mode
        // Optional: visually indicate selected color in the UI
        eraserButton.classList.remove('active'); // Deactivate eraser if active
    }

    function selectEraser() {
        isErasing = true;
        // No need to set globalCompositeOperation here, draw() will handle it.
        // Optional: visually indicate eraser is active
        eraserButton.classList.add('active');
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isErasing = false; // Reset eraser state
        ctx.globalCompositeOperation = 'source-over'; // Reset drawing mode
        eraserButton.classList.remove('active');
    }

    // --- Event Listeners for Toolbar ---
    colorPicker.addEventListener('change', (e) => {
        selectColor(e.target.value);
    });

    eraserButton.addEventListener('click', () => {
        selectEraser();
    });

    clearButton.addEventListener('click', () => {
        clearCanvas();
    });

    // --- Initial setup ---
    // Set default color for the picker
    colorPicker.value = currentColor;
    // Clear canvas on load (optional, good for fresh start)
    clearCanvas();
});
