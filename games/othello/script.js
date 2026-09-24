console.log("Othello game script loaded.");

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const gameInfoElement = document.getElementById('game-info');
    const homeButton = document.getElementById('homeButton');
    const pvpButton = document.getElementById('player-vs-player');
    const pvaButton = document.getElementById('player-vs-ai');

    const { BOARD_SIZE, EMPTY, PLAYER_BLACK, PLAYER_WHITE, getValidMoves: _getValidMoves, flipDiscs: _flipDiscs, calculateScores, hasAnyValidMoves, checkGameOver } = window.OthelloLogic;

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
        const scores = calculateScores(board);
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
     * Delegates to OthelloLogic.calculateScores.
     */

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
            const validMoves = _getValidMoves(board, row, col, currentPlayer);
            if (validMoves.length > 0) {
                _placeDiscInternal(row, col, currentPlayer);
                _flipDiscs(board, validMoves, currentPlayer);
                renderBoard(); // Render after placing and flipping

                // Switch player
                currentPlayer = (currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
                updateGameInfo(); // Update info for the new player

                if (checkGameOver(board)) {
                    endGame();
                    return;
                }

                // If PvA and it's AI's turn (White)
                if (gameMode === 'pva' && currentPlayer === PLAYER_WHITE) {
                    setTimeout(aiMove, 500); // AI makes a move after a short delay
                } else if (!hasAnyValidMoves(board, currentPlayer)) {
                    alert(`Player ${currentPlayer === PLAYER_BLACK ? 'Black' : 'White'} has no valid moves. Turn passes.`);
                    currentPlayer = (currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK; // Pass turn
                    updateGameInfo();
                     if (gameMode === 'pva' && currentPlayer === PLAYER_WHITE) { // If AI's turn again after pass
                        setTimeout(aiMove, 500);
                    } else if (hasAnyValidMoves(board, currentPlayer)) {
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

    function endGame() {
        const scores = calculateScores(board);
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
                    const flips = _getValidMoves(board, r, c, PLAYER_WHITE);
                    if (flips.length > maxFlips) {
                        maxFlips = flips.length;
                        bestMove = { r, c, flips };
                    }
                }
            }
        }

        if (bestMove && bestMove.flips.length > 0) {
            _placeDiscInternal(bestMove.r, bestMove.c, PLAYER_WHITE);
            _flipDiscs(board, bestMove.flips, PLAYER_WHITE);
                                       // which should be PLAYER_WHITE here.
            renderBoard();

            currentPlayer = PLAYER_BLACK; // Switch to human player
            updateGameInfo();

            if (checkGameOver(board)) {
                endGame();
            } else if (!hasAnyValidMoves(board, PLAYER_BLACK)) {
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
            if (checkGameOver(board)) { // Check if game ends after AI passes
                endGame();
            } else if (!hasAnyValidMoves(board, PLAYER_BLACK)) {
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
        window.location.href = '../../index.html';
    });

    gameInfoElement.textContent = "Select a game mode to start.";
    // No board is rendered initially until a mode is selected.
});
