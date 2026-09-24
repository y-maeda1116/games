const {
  PIECES, PROMOTION_MAP, PLAYER_SENTE, PLAYER_GOTE,
  SENTE_PROMOTION_ZONE, GOTE_PROMOTION_ZONE,
  deepCopyBoard, getValidMoves, isInCheck, isCheckmate,
  isPromotionZone, canPromote, mustPromote, isValidDrop,
} = require('../../../games/shogi/logic');

describe('ShogiLogic', () => {
  describe('deepCopyBoard', () => {
    test('creates an independent copy', () => {
      const board = [[{ type: 'PAWN', player: PLAYER_SENTE, promoted: false }, null]];
      const copy = deepCopyBoard(board);
      copy[0][0].type = 'ROOK';
      expect(board[0][0].type).toBe('PAWN');
    });
  });

  describe('getValidMoves', () => {
    const emptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(null));

    test('pawn moves one square forward for sente', () => {
      const board = emptyBoard();
      const pawn = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      board[6][4] = pawn;
      const moves = getValidMoves(pawn, 6, 4, board);
      expect(moves).toContainEqual([5, 4]);
      expect(moves).toHaveLength(1);
    });

    test('pawn moves one square forward for gote', () => {
      const board = emptyBoard();
      const pawn = { type: 'PAWN', player: PLAYER_GOTE, promoted: false };
      board[2][4] = pawn;
      const moves = getValidMoves(pawn, 2, 4, board);
      expect(moves).toContainEqual([3, 4]);
      expect(moves).toHaveLength(1);
    });

    test('knight moves in L-shape for sente', () => {
      const board = emptyBoard();
      const knight = { type: 'KNIGHT', player: PLAYER_SENTE, promoted: false };
      board[8][4] = knight;
      const moves = getValidMoves(knight, 8, 4, board);
      expect(moves).toContainEqual([6, 3]);
      expect(moves).toContainEqual([6, 5]);
      expect(moves).toHaveLength(2);
    });

    test('king moves one square in any direction', () => {
      const board = emptyBoard();
      const king = { type: 'KING', player: PLAYER_SENTE, promoted: false };
      board[4][4] = king;
      const moves = getValidMoves(king, 4, 4, board);
      expect(moves.length).toBe(8);
      expect(moves).toContainEqual([3, 3]);
      expect(moves).toContainEqual([5, 5]);
    });

    test('rook moves along ranks and files', () => {
      const board = emptyBoard();
      const rook = { type: 'ROOK', player: PLAYER_SENTE, promoted: false };
      board[4][4] = rook;
      const moves = getValidMoves(rook, 4, 4, board);
      expect(moves.length).toBeGreaterThan(0);
      expect(moves).toContainEqual([0, 4]);
      expect(moves).toContainEqual([8, 4]);
      expect(moves).toContainEqual([4, 0]);
      expect(moves).toContainEqual([4, 8]);
    });

    test('bishop moves diagonally', () => {
      const board = emptyBoard();
      const bishop = { type: 'BISHOP', player: PLAYER_SENTE, promoted: false };
      board[4][4] = bishop;
      const moves = getValidMoves(bishop, 4, 4, board);
      expect(moves).toContainEqual([0, 0]);
      expect(moves).toContainEqual([8, 8]);
    });

    test('cannot move to square occupied by own piece', () => {
      const board = emptyBoard();
      const pawn = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      const other = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      board[6][4] = pawn;
      board[5][4] = other;
      const moves = getValidMoves(pawn, 6, 4, board);
      expect(moves).not.toContainEqual([5, 4]);
    });

    test('can capture opponent piece', () => {
      const board = emptyBoard();
      const pawn = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      const enemy = { type: 'PAWN', player: PLAYER_GOTE, promoted: false };
      board[6][4] = pawn;
      board[5][4] = enemy;
      const moves = getValidMoves(pawn, 6, 4, board);
      expect(moves).toContainEqual([5, 4]);
    });

    test('promoted rook gains diagonal moves', () => {
      const board = emptyBoard();
      const promotedRook = { type: 'ROOK', player: PLAYER_SENTE, promoted: true };
      board[4][4] = promotedRook;
      const moves = getValidMoves(promotedRook, 4, 4, board);
      expect(moves).toContainEqual([3, 3]);
      expect(moves).toContainEqual([3, 5]);
      expect(moves).toContainEqual([5, 3]);
      expect(moves).toContainEqual([5, 5]);
    });

    test('promoted bishop gains orthogonal moves', () => {
      const board = emptyBoard();
      const promotedBishop = { type: 'BISHOP', player: PLAYER_SENTE, promoted: true };
      board[4][4] = promotedBishop;
      const moves = getValidMoves(promotedBishop, 4, 4, board);
      expect(moves).toContainEqual([3, 4]);
      expect(moves).toContainEqual([5, 4]);
      expect(moves).toContainEqual([4, 3]);
      expect(moves).toContainEqual([4, 5]);
    });
  });

  describe('isInCheck', () => {
    const emptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(null));

    test('returns false when king is not attacked', () => {
      const board = emptyBoard();
      board[8][4] = { type: 'KING', player: PLAYER_SENTE, promoted: false };
      expect(isInCheck(PLAYER_SENTE, board)).toBe(false);
    });

    test('returns true when opponent piece attacks king', () => {
      const board = emptyBoard();
      board[8][4] = { type: 'KING', player: PLAYER_SENTE, promoted: false };
      board[7][4] = { type: 'PAWN', player: PLAYER_GOTE, promoted: false };
      expect(isInCheck(PLAYER_SENTE, board)).toBe(true);
    });

    test('returns false when no king on board', () => {
      const board = emptyBoard();
      expect(isInCheck(PLAYER_SENTE, board)).toBe(false);
    });
  });

  describe('isCheckmate', () => {
    const emptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(null));

    test('returns false when not in check', () => {
      const board = emptyBoard();
      board[8][4] = { type: 'KING', player: PLAYER_SENTE, promoted: false };
      expect(isCheckmate(PLAYER_SENTE, board, [], [])).toBe(false);
    });

    test('returns true when king has no escape', () => {
      const board = emptyBoard();
      board[0][0] = { type: 'KING', player: PLAYER_SENTE, promoted: false };
      board[1][0] = { type: 'PAWN', player: PLAYER_GOTE, promoted: false };
      board[0][1] = { type: 'GOLD', player: PLAYER_GOTE, promoted: false };
      board[1][1] = { type: 'GOLD', player: PLAYER_GOTE, promoted: false };
      expect(isCheckmate(PLAYER_SENTE, board, [], [])).toBe(true);
    });
  });

  describe('promotion', () => {
    test('canPromote returns true in promotion zone', () => {
      const piece = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      expect(canPromote(piece, 2, 5, PLAYER_SENTE)).toBe(true);
    });

    test('canPromote returns false when already promoted', () => {
      const piece = { type: 'PAWN', player: PLAYER_SENTE, promoted: true };
      expect(canPromote(piece, 2, 5, PLAYER_SENTE)).toBe(false);
    });

    test('canPromote returns true when moving from promotion zone', () => {
      const piece = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      expect(canPromote(piece, 3, 2, PLAYER_SENTE)).toBe(true);
    });

    test('mustPromote for pawn at last rank sente', () => {
      const piece = { type: 'PAWN', promoted: false };
      expect(mustPromote(piece, 0, PLAYER_SENTE)).toBe(true);
      expect(mustPromote(piece, 1, PLAYER_SENTE)).toBe(false);
    });

    test('mustPromote for lance at last rank gote', () => {
      const piece = { type: 'LANCE', promoted: false };
      expect(mustPromote(piece, 8, PLAYER_GOTE)).toBe(true);
    });

    test('mustPromote for knight at last two ranks sente', () => {
      const piece = { type: 'KNIGHT', promoted: false };
      expect(mustPromote(piece, 0, PLAYER_SENTE)).toBe(true);
      expect(mustPromote(piece, 1, PLAYER_SENTE)).toBe(true);
      expect(mustPromote(piece, 2, PLAYER_SENTE)).toBe(false);
    });

    test('mustPromote returns false for gold', () => {
      const piece = { type: 'GOLD', promoted: false };
      expect(mustPromote(piece, 0, PLAYER_SENTE)).toBe(false);
    });
  });

  describe('isValidDrop', () => {
    const emptyBoard = () => Array(9).fill(null).map(() => Array(9).fill(null));

    test('cannot drop on occupied square', () => {
      const board = emptyBoard();
      board[4][4] = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      expect(isValidDrop('PAWN', 4, 4, PLAYER_SENTE, board)).toBe(false);
    });

    test('can drop on empty square', () => {
      const board = emptyBoard();
      expect(isValidDrop('PAWN', 4, 4, PLAYER_SENTE, board)).toBe(true);
    });

    test('cannot drop pawn on last rank for sente', () => {
      const board = emptyBoard();
      expect(isValidDrop('PAWN', 0, 4, PLAYER_SENTE, board)).toBe(false);
    });

    test('cannot drop lance on last rank for sente', () => {
      const board = emptyBoard();
      expect(isValidDrop('LANCE', 0, 4, PLAYER_SENTE, board)).toBe(false);
    });

    test('cannot drop knight on last two ranks for sente', () => {
      const board = emptyBoard();
      expect(isValidDrop('KNIGHT', 0, 4, PLAYER_SENTE, board)).toBe(false);
      expect(isValidDrop('KNIGHT', 1, 4, PLAYER_SENTE, board)).toBe(false);
    });

    test('cannot drop pawn in column with own unpromoted pawn (nifu)', () => {
      const board = emptyBoard();
      board[5][4] = { type: 'PAWN', player: PLAYER_SENTE, promoted: false };
      expect(isValidDrop('PAWN', 3, 4, PLAYER_SENTE, board)).toBe(false);
    });

    test('can drop pawn in column if own pawn is promoted', () => {
      const board = emptyBoard();
      board[5][4] = { type: 'PAWN', player: PLAYER_SENTE, promoted: true };
      expect(isValidDrop('PAWN', 3, 4, PLAYER_SENTE, board)).toBe(true);
    });
  });

  describe('isPromotionZone', () => {
    test('sente promotion zone is rows 0-2', () => {
      expect(isPromotionZone(0, PLAYER_SENTE)).toBe(true);
      expect(isPromotionZone(1, PLAYER_SENTE)).toBe(true);
      expect(isPromotionZone(2, PLAYER_SENTE)).toBe(true);
      expect(isPromotionZone(3, PLAYER_SENTE)).toBe(false);
    });

    test('gote promotion zone is rows 6-8', () => {
      expect(isPromotionZone(6, PLAYER_GOTE)).toBe(true);
      expect(isPromotionZone(7, PLAYER_GOTE)).toBe(true);
      expect(isPromotionZone(8, PLAYER_GOTE)).toBe(true);
      expect(isPromotionZone(5, PLAYER_GOTE)).toBe(false);
    });
  });
});
