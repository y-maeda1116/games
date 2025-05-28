document.addEventListener('DOMContentLoaded', () => {
    const piecesArea = document.getElementById('pieces-area') as HTMLDivElement;
    const puzzleBoard = document.getElementById('puzzle-board') as HTMLDivElement;
    const messageArea = document.getElementById('message-area') as HTMLDivElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;

    const availableImages: string[] = [
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
    let selectedImageUrl: string; // Will be set in initGame

    const puzzleRows: number = 3; // For a 3x3 puzzle
    const puzzleCols: number = 3;
    const totalPieces: number = puzzleRows * puzzleCols;

    // Assuming the image is 300x300, so each piece is 100x100
    const pieceWidth: number = 100;
    const pieceHeight: number = 100;
    const imageWidth: number = 300;
    const imageHeight: number = 300;

    let correctlyPlacedPieces: number = 0;
    let draggedPiece: HTMLDivElement | null = null;

    function initGame(): void {
        // Randomly select an image for the puzzle
        const randomIndex: number = Math.floor(Math.random() * availableImages.length);
        selectedImageUrl = availableImages[randomIndex];

        // Clear previous game state
        if (piecesArea) piecesArea.innerHTML = '<p class="area-title">Puzzle Pieces</p>'; // Keep title
        if (puzzleBoard) puzzleBoard.innerHTML = '<p class="area-title">Place Pieces Here</p>'; // Keep title
        if (messageArea) messageArea.textContent = '';
        correctlyPlacedPieces = 0;

        // Configure puzzle board grid
        if (puzzleBoard) {
            puzzleBoard.style.gridTemplateColumns = `repeat(${puzzleCols}, ${pieceWidth}px)`;
            puzzleBoard.style.gridTemplateRows = `repeat(${puzzleRows}, ${pieceHeight}px)`;
        }

        let pieces: HTMLDivElement[] = [];

        for (let i = 0; i < totalPieces; i++) {
            // Create puzzle piece
            const piece = document.createElement('div') as HTMLDivElement;
            piece.classList.add('puzzle-piece');
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${selectedImageUrl})`;

            const row: number = Math.floor(i / puzzleCols); // 0, 1, or 2 for a 3x3 puzzle
            const col: number = i % puzzleCols;             // 0, 1, or 2 for a 3x3 puzzle

            // Calculate background position for this piece
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;

            piece.setAttribute('draggable', 'true');
            piece.dataset.pieceId = String(i); // Unique ID for the piece itself
            piece.dataset.correctSlot = `slot-${i}`; // Expected slot ID

            pieces.push(piece);

            // Create puzzle slot
            const slot = document.createElement('div') as HTMLDivElement;
            slot.classList.add('puzzle-slot');
            slot.style.width = `${pieceWidth}px`;
            slot.style.height = `${pieceHeight}px`;
            slot.dataset.slotId = `slot-${i}`;

            if (puzzleBoard) puzzleBoard.appendChild(slot);

            // Add drag and drop listeners to slots
            slot.addEventListener('dragover', handleDragOver as EventListener);
            slot.addEventListener('dragleave', handleDragLeave as EventListener);
            slot.addEventListener('drop', handleDrop as EventListener);
        }

        // Shuffle pieces and add to pieces area
        shuffleArray(pieces).forEach(piece => {
            if (piecesArea) piecesArea.appendChild(piece);
            // Add drag listeners to pieces
            piece.addEventListener('dragstart', handleDragStart as EventListener);
            piece.addEventListener('dragend', handleDragEnd as EventListener);
        });
    }

    function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Drag and Drop Handlers ---
    function handleDragStart(event: DragEvent): void {
        const target = event.target as HTMLDivElement;
        draggedPiece = target;
        if (event.dataTransfer && target.dataset.pieceId) {
            event.dataTransfer.setData('text/plain', target.dataset.pieceId);
            event.dataTransfer.effectAllowed = 'move';
        }
        setTimeout(() => {
            target.style.opacity = '0.5'; // Make it semi-transparent while dragging
        }, 0);
    }

    function handleDragEnd(event: DragEvent): void {
        const target = event.target as HTMLDivElement;
        target.style.opacity = '1'; // Reset opacity
        draggedPiece = null;
    }

    function handleDragOver(event: DragEvent): void {
        event.preventDefault(); // Necessary to allow dropping
        const target = event.target as HTMLDivElement;
        if (target.classList.contains('puzzle-slot') && !target.hasChildNodes()) {
            target.classList.add('drag-over');
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        } else {
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'none';
        }
    }

    function handleDragLeave(event: DragEvent): void {
        const target = event.target as HTMLDivElement;
        if (target.classList.contains('puzzle-slot')) {
            target.classList.remove('drag-over');
        }
    }

    function handleDrop(event: DragEvent): void {
        event.preventDefault();
        const targetSlot = (event.target as HTMLElement).closest<HTMLDivElement>('.puzzle-slot');
        if (!targetSlot) return;
        targetSlot.classList.remove('drag-over');

        if (!draggedPiece) {
            return;
        }

        const correctSlotId = draggedPiece.dataset.correctSlot;
        const correctSlotElement = document.querySelector<HTMLDivElement>(`[data-slot-id="${correctSlotId}"]`);

        if (!correctSlotElement) {
            console.error("Correct slot element not found!");
            if (piecesArea) piecesArea.appendChild(draggedPiece); // Return to pieces area
            return;
        }

        const targetRect = targetSlot.getBoundingClientRect();
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const correctRect = correctSlotElement.getBoundingClientRect();
        const correctCenterX = correctRect.left + correctRect.width / 2;
        const correctCenterY = correctRect.top + correctRect.height / 2;

        const distanceX = targetCenterX - correctCenterX;
        const distanceY = targetCenterY - correctCenterY;
        const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        const tolerance = pieceWidth / 2;

        if (distance <= tolerance && !correctSlotElement.hasChildNodes()) {
            correctSlotElement.appendChild(draggedPiece);
            draggedPiece.setAttribute('draggable', 'false');
            draggedPiece.style.cursor = 'default';
            correctSlotElement.classList.add('occupied');
            correctlyPlacedPieces++;

            if (correctlyPlacedPieces === totalPieces && messageArea) {
                messageArea.textContent = 'You Win!';
            }
        } else {
            if (piecesArea && (!draggedPiece.parentNode || draggedPiece.parentNode !== piecesArea)) {
                 piecesArea.appendChild(draggedPiece);
            }
        }
    }

    // Reset button
    if (resetButton) {
        resetButton.addEventListener('click', initGame as EventListener);
    }

    // Initialize the game
    initGame();
});
