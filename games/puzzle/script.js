document.addEventListener('DOMContentLoaded', () => {
    const piecesArea = document.getElementById('pieces-area');
    const puzzleBoard = document.getElementById('puzzle-board');
    const messageArea = document.getElementById('message-area');
    const resetButton = document.getElementById('reset-button');
    const homeButton = document.getElementById('homeButton');

    const imgVersion = 'v=20260421';
    const availableImages = [
        `../../assets/images/puzzle_game/smiling_sun.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_1.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_2.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_3.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_4.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_5.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_6.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_7.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_8.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_9.svg?${imgVersion}`,
        `../../assets/images/puzzle_game/puzzle_image_10.svg?${imgVersion}`
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
    let visualGroups = {};

    function computeVisualGroups(imgSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = imageWidth;
                canvas.height = imageHeight;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

                const pieceColors = [];
                for (let i = 0; i < totalPieces; i++) {
                    const row = Math.floor(i / puzzleCols);
                    const col = i % puzzleCols;
                    const data = ctx.getImageData(
                        col * pieceWidth, row * pieceHeight,
                        pieceWidth, pieceHeight
                    ).data;
                    let rSum = 0, gSum = 0, bSum = 0;
                    const count = data.length / 4;
                    for (let j = 0; j < data.length; j += 4) {
                        rSum += data[j];
                        gSum += data[j + 1];
                        bSum += data[j + 2];
                    }
                    pieceColors.push({ r: rSum / count, g: gSum / count, b: bSum / count });
                }

                const threshold = 15;
                const groups = {};
                const assigned = new Array(totalPieces).fill(-1);
                let groupId = 0;

                for (let i = 0; i < totalPieces; i++) {
                    if (assigned[i] !== -1) continue;
                    assigned[i] = groupId;
                    const members = [i];
                    for (let j = i + 1; j < totalPieces; j++) {
                        if (assigned[j] !== -1) continue;
                        const dr = Math.abs(pieceColors[i].r - pieceColors[j].r);
                        const dg = Math.abs(pieceColors[i].g - pieceColors[j].g);
                        const db = Math.abs(pieceColors[i].b - pieceColors[j].b);
                        if (dr < threshold && dg < threshold && db < threshold) {
                            assigned[j] = groupId;
                            members.push(j);
                        }
                    }
                    members.forEach(m => { groups[m] = members; });
                    groupId++;
                }

                resolve(groups);
            };
            img.onerror = () => {
                const groups = {};
                for (let i = 0; i < totalPieces; i++) { groups[i] = [i]; }
                resolve(groups);
            };
            img.src = imgSrc;
        });
    }

    function clearContainer(container, titleText) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        const title = document.createElement('p');
        title.className = 'area-title';
        title.textContent = titleText;
        container.appendChild(title);
    }

    async function initGame() {
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        selectedImageUrl = availableImages[randomIndex];

        clearContainer(piecesArea, 'Puzzle Pieces');
        clearContainer(puzzleBoard, 'Place Pieces Here');
        messageArea.textContent = '';
        correctlyPlacedPieces = 0;

        visualGroups = await computeVisualGroups(selectedImageUrl);

        puzzleBoard.style.gridTemplateColumns = `repeat(${puzzleCols}, ${pieceWidth}px)`;
        puzzleBoard.style.gridTemplateRows = `auto repeat(${puzzleRows}, ${pieceHeight}px)`;

        const pieces = [];

        for (let i = 0; i < totalPieces; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.style.backgroundImage = `url(${selectedImageUrl})`;

            const row = Math.floor(i / puzzleCols);
            const col = i % puzzleCols;

            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;

            piece.setAttribute('draggable', true);
            piece.dataset.pieceId = i;
            piece.dataset.correctSlot = `slot-${i}`;

            pieces.push(piece);

            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.style.width = `${pieceWidth}px`;
            slot.style.height = `${pieceHeight}px`;
            slot.dataset.slotId = `slot-${i}`;

            puzzleBoard.appendChild(slot);

            slot.addEventListener('dragover', handleDragOver);
            slot.addEventListener('dragleave', handleDragLeave);
            slot.addEventListener('drop', handleDrop);
        }

        pieces.forEach(piece => {
            piecesArea.appendChild(piece);
            piece.addEventListener('dragstart', handleDragStart);
            piece.addEventListener('dragend', handleDragEnd);
            piece.addEventListener('touchstart', handleTouchStart, { passive: false });
            piece.addEventListener('touchmove', handleTouchMove, { passive: false });
            piece.addEventListener('touchend', handleTouchEnd, { passive: false });
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

    // --- Touch Event Handlers (iOS対応) ---
    let touchStartPos = null;
    let touchPiece = null;

    function handleTouchStart(event) {
        event.preventDefault();
        touchPiece = event.target;
        draggedPiece = touchPiece;
        
        const touch = event.touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };
        
        touchPiece.style.opacity = '0.5';
        touchPiece.style.zIndex = '1000';
        touchPiece.style.position = 'fixed';
        touchPiece.style.pointerEvents = 'none';
    }

    function handleTouchMove(event) {
        if (!touchPiece) return;
        event.preventDefault();
        
        const touch = event.touches[0];
        const rect = touchPiece.getBoundingClientRect();
        
        touchPiece.style.left = (touch.clientX - rect.width / 2) + 'px';
        touchPiece.style.top = (touch.clientY - rect.height / 2) + 'px';
    }

    function handleTouchEnd(event) {
        if (!touchPiece) return;
        event.preventDefault();
        
        const touch = event.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetSlot = elementBelow ? elementBelow.closest('.puzzle-slot') : null;
        
        // Reset piece styles
        touchPiece.style.opacity = '1';
        touchPiece.style.zIndex = '';
        touchPiece.style.position = '';
        touchPiece.style.pointerEvents = '';
        touchPiece.style.left = '';
        touchPiece.style.top = '';
        
        if (targetSlot) {
            // Simulate drop event
            const fakeEvent = {
                target: targetSlot,
                preventDefault: () => {}
            };
            handleDrop(fakeEvent);
        } else {
            // Return to pieces area if not dropped on valid slot
            if (touchPiece.parentNode !== piecesArea) {
                piecesArea.appendChild(touchPiece);
            }
        }
        
        touchPiece = null;
        draggedPiece = null;
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
        if (!targetSlot) return;
        targetSlot.classList.remove('drag-over');

        if (!draggedPiece) return;

        const pieceIndex = parseInt(draggedPiece.dataset.pieceId);
        const targetIndex = parseInt(targetSlot.dataset.slotId.replace('slot-', ''));
        const compatibleSlots = visualGroups[pieceIndex] || [pieceIndex];

        const isCompatible = compatibleSlots.includes(targetIndex) && !targetSlot.hasChildNodes();

        if (isCompatible) {
            targetSlot.appendChild(draggedPiece);
            draggedPiece.setAttribute('draggable', false);
            draggedPiece.style.cursor = 'default';
            targetSlot.classList.add('occupied');
            correctlyPlacedPieces++;

            if (correctlyPlacedPieces === totalPieces) {
                messageArea.textContent = 'You Win!';
            }
        } else {
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
        window.location.href = '../../index.html';
    });

    // Initialize the game
    initGame();
});
