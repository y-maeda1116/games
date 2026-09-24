/**
 * Othello pure game logic — no DOM dependencies.
 * Attached to window.OthelloLogic for use by script.js.
 * Also exports via CommonJS for Jest unit tests.
 */
const OthelloLogic = (() => {
  const BOARD_SIZE = 8;
  const EMPTY = 0;
  const PLAYER_BLACK = 1;
  const PLAYER_WHITE = 2;

  /**
   * Returns an array of {r, c} discs that would be flipped
   * if `player` placed a disc at (row, col).
   * Returns empty array for occupied cells or cells that produce no flips.
   */
  function getValidMoves(board, row, col, player) {
    if (board[row][col] !== EMPTY) return [];

    const opponent = (player === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    let discsToFlip = [];

    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      const potentialFlipsInDirection = [];

      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
        potentialFlipsInDirection.push({ r, c });
        r += dr;
        c += dc;
      }
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        if (potentialFlipsInDirection.length > 0) {
          discsToFlip = discsToFlip.concat(potentialFlipsInDirection);
        }
      }
    }
    return discsToFlip;
  }

  /**
   * Flips discs on the board array in-place.
   */
  function flipDiscs(board, discsToFlip, player) {
    for (const disc of discsToFlip) {
      board[disc.r][disc.c] = player;
    }
  }

  /**
   * Counts black and white discs.
   */
  function calculateScores(board) {
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
   * Checks if `player` has at least one valid move.
   */
  function hasAnyValidMoves(board, player) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === EMPTY) {
          if (getValidMoves(board, r, c, player).length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Game is over when neither player has valid moves.
   */
  function checkGameOver(board) {
    return !hasAnyValidMoves(board, PLAYER_BLACK) && !hasAnyValidMoves(board, PLAYER_WHITE);
  }

  /**
   * Creates an empty board with the standard 4-disc opening.
   */
  function createInitialBoard() {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
    board[3][3] = PLAYER_WHITE;
    board[3][4] = PLAYER_BLACK;
    board[4][3] = PLAYER_BLACK;
    board[4][4] = PLAYER_WHITE;
    return board;
  }

  return {
    BOARD_SIZE,
    EMPTY,
    PLAYER_BLACK,
    PLAYER_WHITE,
    getValidMoves,
    flipDiscs,
    calculateScores,
    hasAnyValidMoves,
    checkGameOver,
    createInitialBoard,
  };
})();

// CommonJS export for Jest
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OthelloLogic;
}

// Browser global
if (typeof window !== 'undefined') {
  window.OthelloLogic = OthelloLogic;
}
