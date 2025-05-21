document.addEventListener('DOMContentLoaded', () => {
    const piecesArea = document.getElementById('pieces-area');
    const puzzleBoard = document.getElementById('puzzle-board');
    const messageArea = document.getElementById('message-area');
    const resetButton = document.getElementById('reset-button');

    const imageUrl = 'images_puzzle_game/smiling_sun.svg';
    const puzzleRows = 2; // For a 3x2 puzzle
    const puzzleCols = 3;
    const totalPieces = puzzleRows * puzzleCols;

    // Assuming the image is 300x200, so each piece is 100x100
    const pieceWidth = 100;
    const pieceHeight = 100;
    const imageWidth = 300;
    const imageHeight = 200;

    let correctlyPlacedPieces = 0;
    let draggedPiece = null;

    function initGame() {
        // Clear previous game state
        piecesArea.innerHTML = '<p class="area-title">Puzzle Pieces</p>'; // Keep title
        puzzleBoard.innerHTML = '<p class="area-title">Place Pieces Here</p>'; // Keep title
        messageArea.textContent = '';
        correctlyPlacedPieces = 0;

        // Configure puzzle board grid
        puzzleBoard.style.gridTemplateColumns = `repeat(${puzzleCols}, ${pieceWidth}px)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${puzzleRows}, ${pieceHeight}px)`;

        let pieces = [];

        for (let i = 0; i < totalPieces; i++) {
            // Create puzzle piece
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${imageUrl})`;

            const row = Math.floor(i / puzzleCols); // 0 or 1 for a 3x2 puzzle
            const col = i % puzzleCols;             // 0, 1, or 2 for a 3x2 puzzle

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

        // Shuffle pieces and add to pieces area
        shuffleArray(pieces).forEach(piece => {
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
        const targetSlot = event.target.closest('.puzzle-slot');
        targetSlot.classList.remove('drag-over');

        if (!draggedPiece || !targetSlot || targetSlot.hasChildNodes()) {
            // If no piece is being dragged, or target is not a slot, or slot is occupied
            return;
        }

        const pieceId = draggedPiece.dataset.pieceId;
        const correctSlotId = draggedPiece.dataset.correctSlot;
        const targetSlotId = targetSlot.dataset.slotId;

        if (correctSlotId === targetSlotId) {
            // Correct placement
            targetSlot.appendChild(draggedPiece);
            draggedPiece.setAttribute('draggable', false); // Piece is locked
            draggedPiece.style.cursor = 'default';
            targetSlot.classList.add('occupied');
            // targetSlot.innerHTML = ''; // Clear any 'Slot X' text
            correctlyPlacedPieces++;

            if (correctlyPlacedPieces === totalPieces) {
                messageArea.textContent = 'You Win!';
            }
        } else {
            // Incorrect placement - piece automatically returns to piecesArea due to no append elsewhere.
            // Or, if we want more explicit return: piecesArea.appendChild(draggedPiece);
            // For now, default behavior is it stays in piecesArea if not dropped correctly.
            // To make it visually "snap back" if dropped on a wrong slot on the board:
            // piecesArea.appendChild(draggedPiece); // Add it back to the pieces area
        }
    }

    // Reset button
    resetButton.addEventListener('click', initGame);

    // Initialize the game
    initGame();
});
