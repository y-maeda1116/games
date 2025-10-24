console.log("Othello game script loaded.");

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const gameInfoElement = document.getElementById('game-info');
    const homeButton = document.getElementById('homeButton');
    const pvpButton = document.getElementById('player-vs-player');
    const pvaButton = document.getElementById('player-vs-ai');

    const BOARD_SIZE = 8;
    const EMPTY = 0;
    const PLAYER_BLACK = 1;
    const PLAYER_WHITE = 2;

    let board = [];
    let currentPlayer;
    let gameMode = null; // 'pvp' (Player vs Player) or 'pva' (Player vs AI)

    /**
     * Initializes the game board array and sets up the initial pieces.
     * Also creates the visual board cells in HTML.
     */
    function initializeBoard() {
        boardElement.innerHTML = ''; // Clear any existing cells
        board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));

        // Create HTML cell elements
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', () => handleCellClick(r, c));
                boardElement.appendChild(cell);
            }
        }

        // Set initial pieces
        // Standard Othello setup:
        // D4 (3,3) = White, E4 (3,4) = Black
        // D5 (4,3) = Black, E5 (4,4) = White
        _placeDiscInternal(3, 3, PLAYER_WHITE);
        _placeDiscInternal(3, 4, PLAYER_BLACK);
        _placeDiscInternal(4, 3, PLAYER_BLACK);
        _placeDiscInternal(4, 4, PLAYER_WHITE);
    }

    /**
     * Internal helper to place a disc on the board array.
     * This function does NOT update the visual board.
     */
    function _placeDiscInternal(row, col, player) {
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            board[row][col] = player;
        }
    }

    /**
     * Renders the current state of the board array to the HTML board.
     */
    function renderBoard() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const cell = boardElement.children[r * BOARD_SIZE + c];
                cell.innerHTML = ''; // Clear previous disc
                if (board[r][c] !== EMPTY) {
                    const disc = document.createElement('div');
                    disc.classList.add('disc');
                    disc.classList.add(board[r][c] === PLAYER_BLACK ? 'black' : 'white');
                    cell.appendChild(disc);
                }
            }
        }
    }

    /**
     * Updates the game information display (current player, scores).
     */
    function updateGameInfo() {
        const scores = calculateScores();
        let playerText = '';
        if (currentPlayer === PLAYER_BLACK) {
            playerText = 'Black';
        } else if (currentPlayer === PLAYER_WHITE) {
            playerText = 'White';
        } else {
            playerText = 'N/A'; // Should not happen during active game
        }
        gameInfoElement.textContent = `Mode: ${gameMode ? gameMode.toUpperCase() : 'N/A'} | Current Player: ${playerText} | Black: ${scores.black} - White: ${scores.white}`;
    }

    /**
     * Calculates the current scores for black and white.
     */
    function calculateScores() {
        let blackScore = 0;
        let whiteScore = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] === PLAYER_BLACK) blackScore++;
                else if (board[r][c] === PLAYER_WHITE) whiteScore++;
            }
        }
        return { black: blackScore, white: whiteScore };
    }

    /**
     * Starts a new game with the selected mode.
     * @param {string} mode - The game mode ('pvp' or 'pva').
     */
    function startGame(mode) {
        gameMode = mode;
        currentPlayer = PLAYER_BLACK; // Black always starts
        initializeBoard(); // Initializes board data and HTML structure
        renderBoard();     // Renders the initial state
        updateGameInfo();  // Updates player info
        if (gameMode === 'pvp') {
            alert("Player vs Player mode selected. Black's turn.");
        } else if (gameMode === 'pva') {
            alert("Player vs AI mode selected. You are Black. Black's turn.");
        }
    }

    // --- Event Handlers and Game Logic (to be expanded) ---

    function handleCellClick(row, col) {
        if (!gameMode) {
            alert("Please select a game mode first!");
            return;
        }
        console.log(`Cell clicked: (${row}, ${col}), Player: ${currentPlayer}`);

        // Placeholder for actual move validation and execution
        if (board[row][col] === EMPTY) {
            // This is a simplified move for now, real logic will be complex
            // _placeDiscInternal(row, col, currentPlayer);
            // currentPlayer = (currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
            // renderBoard();
            // updateGameInfo();
            // alert(`Placed a ${currentPlayer === PLAYER_BLACK ? 'White' : 'Black'} disc. Next player: ${currentPlayer === PLAYER_BLACK ? 'Black' : 'White'}`);

            // For now, use the existing more complete (but still partial) logic
            const validMoves = getValidMoves(row, col, currentPlayer);
            if (validMoves.length > 0) {
                _placeDiscInternal(row, col, currentPlayer);
                flipDiscs(validMoves);
                renderBoard(); // Render after placing and flipping

                // Switch player
                currentPlayer = (currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
                updateGameInfo(); // Update info for the new player

                if (checkGameOver()) {
                    endGame();
                    return;
                }

                // If PvA and it's AI's turn (White)
                if (gameMode === 'pva' && currentPlayer === PLAYER_WHITE) {
                    setTimeout(aiMove, 500); // AI makes a move after a short delay
                } else if (!hasAnyValidMoves(currentPlayer)) {
                    alert(`Player ${currentPlayer === PLAYER_BLACK ? 'Black' : 'White'} has no valid moves. Turn passes.`);
                    currentPlayer = (currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK; // Pass turn
                    updateGameInfo();
                     if (gameMode === 'pva' && currentPlayer === PLAYER_WHITE) { // If AI's turn again after pass
                        setTimeout(aiMove, 500);
                    } else if (hasAnyValidMoves(currentPlayer)) {
                        // Current player (after pass) has moves
                    } else {
                         // Neither player has moves
                        endGame();
                    }
                }


            } else {
                alert("Invalid move!");
            }

        } else {
            alert("Cell is already occupied!");
        }
    }

    function getValidMoves(row, col, player) {
        if (board[row][col] !== EMPTY) return [];

        const opponent = (player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // Above
            [0, -1], /* পাশে */ [0, 1],  // Sides
            [1, -1], [1, 0], [1, 1]   // Below
        ];
        let discsToFlip = [];

        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            let potentialFlipsInDirection = [];

            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
                potentialFlipsInDirection.push({ r, c });
                r += dr;
                c += dc;
            }
            // If the line ends with the current player's disc, these are valid flips
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                if (potentialFlipsInDirection.length > 0) {
                     discsToFlip = discsToFlip.concat(potentialFlipsInDirection);
                }
            }
        }
        return discsToFlip; // Returns array of {r, c} for discs to flip
    }

    function flipDiscs(discsToFlip) {
        for (const disc of discsToFlip) {
            _placeDiscInternal(disc.r, disc.c, currentPlayer); // Flip to current player's color
        }
    }

    function hasAnyValidMoves(player) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] === EMPTY) {
                    if (getValidMoves(r, c, player).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function checkGameOver() {
        return !hasAnyValidMoves(PLAYER_BLACK) && !hasAnyValidMoves(PLAYER_WHITE);
    }

    function endGame() {
        const scores = calculateScores();
        let message = "Game Over!\n";
        if (scores.black > scores.white) {
            message += "Black wins!";
        } else if (scores.white > scores.black) {
            message += "White wins!";
        } else {
            message += "It's a draw!";
        }
        message += `\nFinal Score: Black ${scores.black} - White ${scores.white}`;
        gameInfoElement.textContent = message; // Update game info with final result
        alert(message);
        // Optionally disable board clicks here
        boardElement.style.pointerEvents = 'none';
    }

    function aiMove() {
        if (currentPlayer !== PLAYER_WHITE || gameMode !== 'pva') return;

        let bestMove = null;
        let maxFlips = -1;

        // Find all possible moves for AI
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] === EMPTY) {
                    const flips = getValidMoves(r, c, PLAYER_WHITE);
                    if (flips.length > maxFlips) {
                        maxFlips = flips.length;
                        bestMove = { r, c, flips };
                    }
                }
            }
        }

        if (bestMove && bestMove.flips.length > 0) {
            _placeDiscInternal(bestMove.r, bestMove.c, PLAYER_WHITE);
            flipDiscs(bestMove.flips); // Note: flipDiscs uses global `currentPlayer`
                                       // which should be PLAYER_WHITE here.
            renderBoard();

            currentPlayer = PLAYER_BLACK; // Switch to human player
            updateGameInfo();

            if (checkGameOver()) {
                endGame();
            } else if (!hasAnyValidMoves(PLAYER_BLACK)) {
                alert("Black has no valid moves. White (AI) plays again.");
                currentPlayer = PLAYER_WHITE; // AI's turn again
                updateGameInfo(); // Reflect AI is playing again
                setTimeout(aiMove, 500);
            }
        } else {
            // AI has no valid moves, pass turn to human
            alert("White (AI) has no valid moves. Black's turn.");
            currentPlayer = PLAYER_BLACK;
            updateGameInfo();
            if (checkGameOver()) { // Check if game ends after AI passes
                endGame();
            } else if (!hasAnyValidMoves(PLAYER_BLACK)) {
                alert("Black also has no valid moves. Game Over.");
                endGame();
            }
        }
    }

    // --- Initialize Game ---
    pvpButton.addEventListener('click', () => startGame('pvp'));
    pvaButton.addEventListener('click', () => startGame('pva'));

    // Initial message before game starts
    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    gameInfoElement.textContent = "Select a game mode to start.";
    // No board is rendered initially until a mode is selected.
});
