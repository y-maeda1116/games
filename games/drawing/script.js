document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const toolbar = document.getElementById('toolbar');
    const colorPicker = document.getElementById('colorPicker');
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const brushButton = document.getElementById('brush');
    const eraserButton = document.getElementById('eraser');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const homeButton = document.getElementById('homeButton');
    
    // New elements
    const presetColors = document.querySelectorAll('.color-btn');
    const stampsPanel = document.getElementById('stampsPanel');
    const stampButtons = document.querySelectorAll('.stamp-btn');

    // Set canvas dimensions (can be adjusted or made dynamic)
    canvas.width = 800;
    canvas.height = 600;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#000000'; // Default to black
    let currentLineWidth = 5; // Default line width
    let isErasing = false;
    let selectedStamp = '';
    let currentTool = 'brush';

    // Undo/Redo functionality
    let undoStack = [];
    let redoStack = [];
    const maxUndoSteps = 20;

    // --- Drawing Event Listeners (Mouse + Touch) ---
    
    // マウスイベント
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseout', handleEnd);
    
    // タッチイベント（iOS対応）
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleEnd);
    
    function getEventPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    function handleStart(e) {
        e.preventDefault(); // iOS scrolling prevention
        
        // Save canvas state before starting to draw
        saveCanvasState();
        
        const pos = getEventPos(e);
        
        if (selectedStamp) {
            placeStamp(pos.x, pos.y);
        } else {
            isDrawing = true;
            [lastX, lastY] = [pos.x, pos.y];
        }
    }
    
    function handleMove(e) {
        if (!isDrawing) return;
        e.preventDefault(); // iOS scrolling prevention
        
        const pos = getEventPos(e);
        draw(pos.x, pos.y);
    }
    
    function handleEnd(e) {
        if (isDrawing) {
            isDrawing = false;
            // Clear redo stack when new action is performed
            redoStack = [];
            updateUndoRedoButtons();
        }
    }

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

    // --- Canvas State Management ---
    function saveCanvasState() {
        if (undoStack.length >= maxUndoSteps) {
            undoStack.shift(); // Remove oldest state
        }
        undoStack.push(canvas.toDataURL());
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length > 0) {
            redoStack.push(canvas.toDataURL());
            const previousState = undoStack.pop();
            restoreCanvasState(previousState);
            updateUndoRedoButtons();
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            undoStack.push(canvas.toDataURL());
            const nextState = redoStack.pop();
            restoreCanvasState(nextState);
            updateUndoRedoButtons();
        }
    }

    function restoreCanvasState(dataURL) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
    }

    function updateUndoRedoButtons() {
        undoButton.disabled = undoStack.length === 0;
        redoButton.disabled = redoStack.length === 0;
    }

    // --- Drawing Functions ---
    function placeStamp(x, y) {
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedStamp, x, y);
        
        // Clear redo stack and update buttons
        redoStack = [];
        updateUndoRedoButtons();
    }

    // --- Toolbar Functionality ---
    function selectColor(color) {
        currentColor = color;
        setTool('brush');
        updateColorSelection(color);
    }

    function updateColorSelection(color) {
        // Update preset color selection
        presetColors.forEach(btn => btn.classList.remove('selected'));
        const matchingBtn = Array.from(presetColors).find(btn => btn.dataset.color === color);
        if (matchingBtn) {
            matchingBtn.classList.add('selected');
        }
        
        // Update color picker
        colorPicker.value = color;
    }

    function setTool(tool) {
        currentTool = tool;
        isErasing = false;
        
        // Reset all tool buttons
        brushButton.classList.remove('active');
        eraserButton.classList.remove('active');
        
        // Clear stamp selection when switching to brush/eraser
        if (tool !== 'stamp') {
            selectedStamp = '';
            stampButtons.forEach(btn => btn.classList.remove('selected'));
        }
        
        switch(tool) {
            case 'brush':
                brushButton.classList.add('active');
                ctx.globalCompositeOperation = 'source-over';
                break;
            case 'eraser':
                eraserButton.classList.add('active');
                isErasing = true;
                break;
        }
    }

    function setBrushSize(size) {
        currentLineWidth = size;
        brushSizeValue.textContent = size;
    }

    function saveDrawing() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const filename = `drawing_${year}${month}${day}_${hours}${minutes}${seconds}.png`;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    }

    function selectEraser() {
        setTool('eraser');
    }

    function clearCanvas() {
        saveCanvasState(); // Save state before clearing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTool('brush'); // Reset to brush tool
        redoStack = []; // Clear redo stack
        updateUndoRedoButtons();
    }

    // --- Event Listeners for Toolbar ---
    colorPicker.addEventListener('change', (e) => {
        selectColor(e.target.value);
    });

    // Preset color buttons
    presetColors.forEach(btn => {
        btn.addEventListener('click', () => {
            selectColor(btn.dataset.color);
        });
    });

    brushSizeSlider.addEventListener('input', (e) => {
        setBrushSize(parseInt(e.target.value));
    });

    // Tool buttons
    brushButton.addEventListener('click', () => {
        setTool('brush');
    });

    eraserButton.addEventListener('click', () => {
        setTool('eraser');
    });

    // Stamp selection
    stampButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove previous selection
            stampButtons.forEach(b => b.classList.remove('selected'));
            // Select current stamp
            btn.classList.add('selected');
            selectedStamp = btn.dataset.stamp;
            
            // Clear tool selection when stamp is selected
            brushButton.classList.remove('active');
            eraserButton.classList.remove('active');
            isErasing = false;
            ctx.globalCompositeOperation = 'source-over';
        });
    });

    // Action buttons
    undoButton.addEventListener('click', () => {
        undo();
    });

    redoButton.addEventListener('click', () => {
        redo();
    });

    saveButton.addEventListener('click', () => {
        saveDrawing();
    });

    clearButton.addEventListener('click', () => {
        clearCanvas();
    });

    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    // --- Initial setup ---
    // Set default color and selection
    selectColor(currentColor);
    // Initialize brush size display
    setBrushSize(currentLineWidth);
    // Initialize undo/redo buttons
    updateUndoRedoButtons();
    // Set default tool
    setTool('brush');
    // Save initial blank canvas state
    saveCanvasState();

    // 多言語対応を初期化
    if (window.i18n) {
        window.i18n.init();
    }
});
