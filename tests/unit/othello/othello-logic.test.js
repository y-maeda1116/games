const {
  BOARD_SIZE, EMPTY, PLAYER_BLACK, PLAYER_WHITE,
  getValidMoves, flipDiscs, calculateScores,
  hasAnyValidMoves, checkGameOver, createInitialBoard,
} = require('../../../games/othello/logic');

describe('OthelloLogic', () => {
  describe('createInitialBoard', () => {
    test('creates an 8x8 board', () => {
      const board = createInitialBoard();
      expect(board).toHaveLength(8);
      for (const row of board) {
        expect(row).toHaveLength(8);
      }
    });

    test('places 4 initial discs in standard positions', () => {
      const board = createInitialBoard();
      expect(board[3][3]).toBe(PLAYER_WHITE);
      expect(board[3][4]).toBe(PLAYER_BLACK);
      expect(board[4][3]).toBe(PLAYER_BLACK);
      expect(board[4][4]).toBe(PLAYER_WHITE);
    });

    test('all other cells are empty', () => {
      const board = createInitialBoard();
      let emptyCount = 0;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (board[r][c] === EMPTY) emptyCount++;
        }
      }
      expect(emptyCount).toBe(60);
    });
  });

  describe('calculateScores', () => {
    test('returns 2-2 on initial board', () => {
      const board = createInitialBoard();
      const scores = calculateScores(board);
      expect(scores).toEqual({ black: 2, white: 2 });
    });

    test('returns 0-0 on empty board', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
      const scores = calculateScores(board);
      expect(scores).toEqual({ black: 0, white: 0 });
    });

    test('counts correctly after placing discs', () => {
      const board = createInitialBoard();
      board[0][0] = PLAYER_BLACK;
      board[0][1] = PLAYER_BLACK;
      const scores = calculateScores(board);
      expect(scores.black).toBe(4);
      expect(scores.white).toBe(2);
    });
  });

  describe('getValidMoves', () => {
    test('returns empty array for occupied cell', () => {
      const board = createInitialBoard();
      const moves = getValidMoves(board, 3, 3, PLAYER_BLACK);
      expect(moves).toEqual([]);
    });

    test('returns empty array when no opponent discs to flip', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
      board[0][0] = PLAYER_BLACK;
      const moves = getValidMoves(board, 2, 2, PLAYER_WHITE);
      expect(moves).toEqual([]);
    });

    test('identifies valid horizontal flip', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
      board[3][3] = PLAYER_WHITE;
      board[3][4] = PLAYER_BLACK;
      const moves = getValidMoves(board, 3, 5, PLAYER_WHITE);
      expect(moves.length).toBeGreaterThan(0);
      expect(moves).toContainEqual({ r: 3, c: 4 });
    });

    test('identifies valid vertical flip', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
      board[3][3] = PLAYER_BLACK;
      board[4][3] = PLAYER_WHITE;
      const moves = getValidMoves(board, 5, 3, PLAYER_BLACK);
      expect(moves.length).toBeGreaterThan(0);
      expect(moves).toContainEqual({ r: 4, c: 3 });
    });

    test('identifies valid diagonal flip', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
      board[3][3] = PLAYER_WHITE;
      board[4][4] = PLAYER_BLACK;
      const moves = getValidMoves(board, 5, 5, PLAYER_WHITE);
      expect(moves.length).toBeGreaterThan(0);
      expect(moves).toContainEqual({ r: 4, c: 4 });
    });

    test('returns all directions that produce flips', () => {
      const board = createInitialBoard();
      const moves = getValidMoves(board, 2, 3, PLAYER_BLACK);
      expect(moves.length).toBeGreaterThan(0);
      expect(moves).toContainEqual({ r: 3, c: 3 });
    });
  });

  describe('flipDiscs', () => {
    test('flips specified discs to the given player', () => {
      const board = createInitialBoard();
      const discsToFlip = [{ r: 3, c: 3 }];
      flipDiscs(board, discsToFlip, PLAYER_BLACK);
      expect(board[3][3]).toBe(PLAYER_BLACK);
    });

    test('does not modify other cells', () => {
      const board = createInitialBoard();
      const snapshot = board.map(r => [...r]);
      flipDiscs(board, [{ r: 3, c: 3 }], PLAYER_BLACK);
      expect(board[3][4]).toBe(snapshot[3][4]);
      expect(board[4][3]).toBe(snapshot[4][3]);
      expect(board[4][4]).toBe(snapshot[4][4]);
    });
  });

  describe('hasAnyValidMoves', () => {
    test('returns true for black on initial board', () => {
      const board = createInitialBoard();
      expect(hasAnyValidMoves(board, PLAYER_BLACK)).toBe(true);
    });

    test('returns true for white on initial board', () => {
      const board = createInitialBoard();
      expect(hasAnyValidMoves(board, PLAYER_WHITE)).toBe(true);
    });

    test('returns false when board is full', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PLAYER_BLACK));
      expect(hasAnyValidMoves(board, PLAYER_WHITE)).toBe(false);
    });
  });

  describe('checkGameOver', () => {
    test('returns false on initial board', () => {
      const board = createInitialBoard();
      expect(checkGameOver(board)).toBe(false);
    });

    test('returns true when board is full', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PLAYER_BLACK));
      expect(checkGameOver(board)).toBe(true);
    });

    test('returns true when neither player has moves', () => {
      const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PLAYER_BLACK));
      board[0][0] = EMPTY;
      expect(checkGameOver(board)).toBe(true);
    });
  });
});
