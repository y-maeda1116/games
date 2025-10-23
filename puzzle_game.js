document.addEventListener('DOMContentLoaded', () => {
    const piecesArea = document.getElementById('pieces-area');
    const puzzleBoard = document.getElementById('puzzle-board');
    const messageArea = document.getElementById('message-area');
    const resetButton = document.getElementById('reset-button');
    const homeButton = document.getElementById('homeButton');

    const availableImages = [
        'images_puzzle_game/smiling_sun.svg',
        'images_puzzle_game/puzzle_image_1.svg',
        'images_puzzle_game/puzzle_image_2.svg',
        'images_puzzle_game/puzzle_image_3.svg',
        'images_puzzle_game/puzzle_image_4.svg',
        'images_puzzle_game/puzzle_image_5.svg',
        'images_puzzle_game/puzzle_image_6.svg',
        'images_puzzle_game/puzzle_image_7.svg',
        'images_puzzle_game/puzzle_image_8.svg',
        'images_puzzle_game/puzzle_image_9.svg',
        'images_puzzle_game/puzzle_image_10.svg'
    ];
    let selectedImageUrl; // Will be set in initGame

    const puzzleRows = 3; // For a 3x3 puzzle
    const puzzleCols = 3;
    const totalPieces = puzzleRows * puzzleCols;

    // Assuming the image is 300x300, so each piece is 100x100
    const pieceWidth = 100;
    const pieceHeight = 100;
    const imageWidth = 300;
    const imageHeight = 300;

    let correctlyPlacedPieces = 0;
    let draggedPiece = null;

    function initGame() {
        // Randomly select an image for the puzzle
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        selectedImageUrl = availableImages[randomIndex];

        // Clear previous game state
        piecesArea.innerHTML = '<p class="area-title">Puzzle Pieces</p>'; // Keep title
        puzzleBoard.innerHTML = '<p class="area-title">Place Pieces Here</p>'; // Keep title
        messageArea.textContent = '';
        correctlyPlacedPieces = 0;

        // Configure puzzle board grid
        puzzleBoard.style.gridTemplateColumns = `repeat(${puzzleCols}, ${pieceWidth}px)`;
        puzzleBoard.style.gridTemplateRows = `auto repeat(${puzzleRows}, ${pieceHeight}px)`;

        let pieces = [];

        for (let i = 0; i < totalPieces; i++) {
            // Create puzzle piece
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${selectedImageUrl})`;

            const row = Math.floor(i / puzzleCols); // 0, 1, or 2 for a 3x3 puzzle
            const col = i % puzzleCols;             // 0, 1, or 2 for a 3x3 puzzle

            // Calculate background position for this piece
            // (col * pieceWidth) gives the x-offset of the slice
            // (row * pieceHeight) gives the y-offset of the slice
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;


            piece.setAttribute('draggable', true);
            piece.dataset.pieceId = i; // Unique ID for the piece itself
            piece.dataset.correctSlot = `slot-${i}`; // Expected slot ID

            pieces.push(piece);

            // Create puzzle slot
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.style.width = `${pieceWidth}px`;
            slot.style.height = `${pieceHeight}px`;
            slot.dataset.slotId = `slot-${i}`;
            // slot.textContent = `Slot ${i}`; // Optional: for debugging

            puzzleBoard.appendChild(slot);

            // Add drag and drop listeners to slots
            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('dragleave', handleDragLeave);
            slot.addEventListener('drop', handleDrop);
        }

        // Add pieces to pieces area in order (no shuffling)
        pieces.forEach(piece => {
            piecesArea.appendChild(piece);
            // Add drag listeners to pieces
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Drag and Drop Handlers ---
    function handleDragStart(event) {
        draggedPiece = event.target;
        event.dataTransfer.setData('text/plain', event.target.dataset.pieceId);
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            event.target.style.opacity = '0.5'; // Make it semi-transparent while dragging
        }, 0);
    }

    function handleDragEnd(event) {
        event.target.style.opacity = '1'; // Reset opacity
        draggedPiece = null;
        // If not dropped on a valid slot, it will remain in piecesArea or snap back (later)
    }

    function handleDragOver(event) {
        event.preventDefault(); // Necessary to allow dropping
        if (event.target.classList.contains('puzzle-slot') && !event.target.hasChildNodes()) {
            event.target.classList.add('drag-over');
            event.dataTransfer.dropEffect = 'move';
        } else {
            event.dataTransfer.dropEffect = 'none';
        }
    }

    function handleDragLeave(event) {
        if (event.target.classList.contains('puzzle-slot')) {
            event.target.classList.remove('drag-over');
        }
    }

    function handleDrop(event) {
        event.preventDefault();
        const targetSlot = event.target.closest('.puzzle-slot'); // Slot where mouse was released
        if (!targetSlot) return; // Should always be a slot if dragover was allowed
        targetSlot.classList.remove('drag-over');

        if (!draggedPiece) {
            return;
        }

        const correctSlotId = draggedPiece.dataset.correctSlot;
        const correctSlotElement = document.querySelector(`[data-slot-id="${correctSlotId}"]`);

        if (!correctSlotElement) {
            // Should not happen in normal flow
            console.error("Correct slot element not found!");
            piecesArea.appendChild(draggedPiece); // Return to pieces area
            return;
        }

        // Calculate center of targetSlot (where mouse was released)
        const targetRect = targetSlot.getBoundingClientRect();
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        // Calculate center of correctSlotElement
        const correctRect = correctSlotElement.getBoundingClientRect();
        const correctCenterX = correctRect.left + correctRect.width / 2;
        const correctCenterY = correctRect.top + correctRect.height / 2;

        // Calculate distance
        const distanceX = targetCenterX - correctCenterX;
        const distanceY = targetCenterY - correctCenterY;
        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        const tolerance = pieceWidth / 2; // Half the width of a piece

        if (distance <= tolerance && !correctSlotElement.hasChildNodes()) {
            // Correct placement (within tolerance and correct slot is not occupied)
            correctSlotElement.appendChild(draggedPiece);
            draggedPiece.setAttribute('draggable', false); // Piece is locked
            draggedPiece.style.cursor = 'default';
            correctSlotElement.classList.add('occupied');
            correctlyPlacedPieces++;

            if (correctlyPlacedPieces === totalPieces) {
                messageArea.textContent = 'You Win!';
            }
        } else {
            // Incorrect placement (either too far, or correct slot is already occupied)
            // Return piece to piecesArea.
            // Note: draggedPiece might have been temporarily removed from DOM if it was in piecesArea.
            // Ensure it's re-appended.
            if (!draggedPiece.parentNode || draggedPiece.parentNode !== piecesArea) {
                 piecesArea.appendChild(draggedPiece);
            }
        }
    }

    // Shuffle pieces function
    function shufflePieces() {
        // Get all pieces currently in the pieces area
        const pieces = Array.from(piecesArea.querySelectorAll('.puzzle-piece'));
        
        // Remove all pieces from pieces area (except title)
        pieces.forEach(piece => piece.remove());
        
        // Shuffle the pieces array
        shuffleArray(pieces);
        
        // Add shuffled pieces back to pieces area
        pieces.forEach(piece => {
            piecesArea.appendChild(piece);
        });
    }

    // Button event listeners
    const shuffleButton = document.getElementById('shuffle-button');
    shuffleButton.addEventListener('click', shufflePieces);
    resetButton.addEventListener('click', initGame);

    // Home button
    homeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Initialize the game
    initGame();
});
