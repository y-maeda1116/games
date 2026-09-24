/**
 * Shogi pure game logic — no DOM dependencies.
 * Attached to window.ShogiLogic for use by script.js.
 * Also exports via CommonJS for Jest unit tests.
 */
const ShogiLogic = (() => {
  const PIECES = {
    KING: '玉', ROOK: '飛', BISHOP: '角', GOLD: '金', SILVER: '銀',
    KNIGHT: '桂', LANCE: '香', PAWN: '歩',
    PROMOTED_ROOK: '龍', PROMOTED_BISHOP: '馬',
    PROMOTED_SILVER: '全', PROMOTED_KNIGHT: '圭',
    PROMOTED_LANCE: '杏', PROMOTED_PAWN: 'と',
  };

  const PROMOTION_MAP = {
    ROOK: 'PROMOTED_ROOK', BISHOP: 'PROMOTED_BISHOP',
    SILVER: 'PROMOTED_SILVER', KNIGHT: 'PROMOTED_KNIGHT',
    LANCE: 'PROMOTED_LANCE', PAWN: 'PROMOTED_PAWN',
  };

  const UNPROMOTED_MAP = {
    PROMOTED_ROOK: 'ROOK', PROMOTED_BISHOP: 'BISHOP',
    PROMOTED_SILVER: 'SILVER', PROMOTED_KNIGHT: 'KNIGHT',
    PROMOTED_LANCE: 'LANCE', PROMOTED_PAWN: 'PAWN',
  };

  const PROMOTABLE_PIECE_KEYS = Object.keys(PROMOTION_MAP);

  const PIECE_VALUES = {
    PAWN: 1, LANCE: 3, KNIGHT: 3, SILVER: 5, GOLD: 6,
    BISHOP: 8, ROOK: 10, KING: 1000,
    PROMOTED_PAWN: 4, PROMOTED_LANCE: 4, PROMOTED_KNIGHT: 4,
    PROMOTED_SILVER: 6, PROMOTED_BISHOP: 10, PROMOTED_ROOK: 12,
  };

  const PLAYER_SENTE = 'sente';
  const PLAYER_GOTE = 'gote';
  const SENTE_PROMOTION_ZONE = [0, 1, 2];
  const GOTE_PROMOTION_ZONE = [6, 7, 8];

  function deepCopyBoard(b) {
    return b.map(r => r.map(p => (p ? { ...p } : null)));
  }

  function getKingPosition(player, currentBoard) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const p = currentBoard[r][c];
        if (p && p.type === 'KING' && p.player === player) return { r, c };
      }
    }
    return null;
  }

  const pieceMoveLogic = {
    PAWN: (r, c, player, p, b) => {
      const dir = player === PLAYER_SENTE ? -1 : 1;
      return [[r + dir, c]];
    },
    LANCE: (r, c, player, p, b) => {
      const dir = player === PLAYER_SENTE ? -1 : 1;
      const m = [];
      for (let i = 1; i < 9; i++) {
        const nR = r + dir * i;
        if (nR < 0 || nR > 8) break;
        const tP = b[nR][c];
        if (tP) { if (tP.player !== player) m.push([nR, c]); break; }
        m.push([nR, c]);
      }
      return m;
    },
    KNIGHT: (r, c, player, p, b) => {
      const dir = player === PLAYER_SENTE ? -1 : 1;
      return [[r + dir * 2, c - 1], [r + dir * 2, c + 1]];
    },
    SILVER: (r, c, player, p, b) => {
      const dir = player === PLAYER_SENTE ? -1 : 1;
      return [[r + dir, c], [r + dir, c - 1], [r + dir, c + 1], [r - dir, c - 1], [r - dir, c + 1]];
    },
    GOLD: (r, c, player, p, b) => {
      const dir = player === PLAYER_SENTE ? -1 : 1;
      return [[r + dir, c], [r - dir, c], [r, c - 1], [r, c + 1], [r + dir, c - 1], [r + dir, c + 1]]
        .filter(([nr, nc]) => !(nr === r - dir && (nc === c - 1 || nc === c + 1)));
    },
    BISHOP: (r, c, player, p, b) => {
      const m = [];
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) {
        for (let i = 1; i < 9; i++) {
          const nR = r + dr * i, nC = c + dc * i;
          if (nR < 0 || nR > 8 || nC < 0 || nC > 8) break;
          const tP = b[nR][nC];
          if (tP) { if (tP.player !== player) m.push([nR, nC]); break; }
          m.push([nR, nC]);
        }
      }
      return m;
    },
    ROOK: (r, c, player, p, b) => {
      const m = [];
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        for (let i = 1; i < 9; i++) {
          const nR = r + dr * i, nC = c + dc * i;
          if (nR < 0 || nR > 8 || nC < 0 || nC > 8) break;
          const tP = b[nR][nC];
          if (tP) { if (tP.player !== player) m.push([nR, nC]); break; }
          m.push([nR, nC]);
        }
      }
      return m;
    },
    KING: (r, c, player, p, b) => {
      return [[r - 1, c - 1], [r - 1, c], [r - 1, c + 1], [r, c - 1], [r, c + 1], [r + 1, c - 1], [r + 1, c], [r + 1, c + 1]];
    },
    PROMOTED_ROOK: (r, c, player, p, b) => {
      let m = pieceMoveLogic.ROOK(r, c, player, p, b);
      m.push(...[[r + 1, c + 1], [r + 1, c - 1], [r - 1, c + 1], [r - 1, c - 1]]);
      return m;
    },
    PROMOTED_BISHOP: (r, c, player, p, b) => {
      let m = pieceMoveLogic.BISHOP(r, c, player, p, b);
      m.push(...[[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]);
      return m;
    },
  };
  pieceMoveLogic.PROMOTED_PAWN = pieceMoveLogic.GOLD;
  pieceMoveLogic.PROMOTED_LANCE = pieceMoveLogic.GOLD;
  pieceMoveLogic.PROMOTED_KNIGHT = pieceMoveLogic.GOLD;
  pieceMoveLogic.PROMOTED_SILVER = pieceMoveLogic.GOLD;

  function getValidMoves(pc, r, c, cB) {
    let k = pc.type;
    if (pc.promoted && PROMOTION_MAP[pc.type]) {
      k = PROMOTION_MAP[pc.type];
    }
    const fn = pieceMoveLogic[k];
    if (!fn) return [];
    return fn(r, c, pc.player, pc, cB)
      .filter(([tR, tC]) => tR >= 0 && tR < 9 && tC >= 0 && tC < 9 && (!cB[tR][tC] || cB[tR][tC].player !== pc.player));
  }

  function isInCheck(player, currentBoard) {
    const kingPos = getKingPosition(player, currentBoard);
    if (!kingPos) return false;
    const opp = player === PLAYER_SENTE ? PLAYER_GOTE : PLAYER_SENTE;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const p = currentBoard[r][c];
        if (p && p.player === opp) {
          const moves = getValidMoves(p, r, c, currentBoard);
          if (moves.some(([mr, mc]) => mr === kingPos.r && mc === kingPos.c)) return true;
        }
      }
    }
    return false;
  }

  function isCheckmate(player, currentBoard, senteCaptured, goteCaptured) {
    if (!isInCheck(player, currentBoard)) return false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const p = currentBoard[r][c];
        if (p && p.player === player) {
          const moves = getValidMoves(p, r, c, currentBoard);
          for (const [mr, mc] of moves) {
            const tB = deepCopyBoard(currentBoard);
            let simPiece = { ...p };
            tB[mr][mc] = simPiece;
            tB[r][c] = null;
            if (canPromote(simPiece, mr, r, player) && (mustPromote(simPiece, mr, player) || true)) {
              simPiece.promoted = true;
            }
            if (!isInCheck(player, tB)) return false;
          }
        }
      }
    }
    const captured = player === PLAYER_SENTE ? senteCaptured : goteCaptured;
    if (captured) {
      for (const cp of captured) {
        for (let dr = 0; dr < 9; dr++) {
          for (let dc = 0; dc < 9; dc++) {
            if (isValidDrop(cp.type, dr, dc, player, currentBoard)) {
              const tB = deepCopyBoard(currentBoard);
              tB[dr][dc] = { type: cp.type, player: player, promoted: false };
              if (!isInCheck(player, tB)) return false;
            }
          }
        }
      }
    }
    return true;
  }

  function isPromotionZone(row, player) {
    return player === PLAYER_SENTE
      ? SENTE_PROMOTION_ZONE.includes(row)
      : GOTE_PROMOTION_ZONE.includes(row);
  }

  function canPromote(pc, toR, fromR, plyr) {
    if (pc.promoted || !PROMOTABLE_PIECE_KEYS.includes(pc.type)) return false;
    return isPromotionZone(toR, plyr) || isPromotionZone(fromR, plyr);
  }

  function mustPromote(pc, toR, plyr) {
    if (pc.type === 'PAWN' || pc.type === 'LANCE') {
      return plyr === PLAYER_SENTE ? toR === 0 : toR === 8;
    }
    if (pc.type === 'KNIGHT') {
      return plyr === PLAYER_SENTE ? (toR === 0 || toR === 1) : (toR === 7 || toR === 8);
    }
    return false;
  }

  function isValidDrop(key, toR, toC, player, cB) {
    if (cB[toR][toC]) return false;
    if ((key === 'PAWN' || key === 'LANCE') &&
        ((player === PLAYER_SENTE && toR === 0) || (player === PLAYER_GOTE && toR === 8))) return false;
    if (key === 'KNIGHT' &&
        ((player === PLAYER_SENTE && (toR === 0 || toR === 1)) || (player === PLAYER_GOTE && (toR === 7 || toR === 8)))) return false;
    if (key === 'PAWN') {
      for (let r = 0; r < 9; r++) {
        const ep = cB[r][toC];
        if (ep && ep.player === player && ep.type === 'PAWN' && !ep.promoted) return false;
      }
    }
    return true;
  }

  return {
    PIECES, PROMOTION_MAP, UNPROMOTED_MAP, PROMOTABLE_PIECE_KEYS, PIECE_VALUES,
    PLAYER_SENTE, PLAYER_GOTE, SENTE_PROMOTION_ZONE, GOTE_PROMOTION_ZONE,
    deepCopyBoard, getKingPosition, getValidMoves, isInCheck, isCheckmate,
    isPromotionZone, canPromote, mustPromote, isValidDrop,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShogiLogic;
}

if (typeof window !== 'undefined') {
  window.ShogiLogic = ShogiLogic;
}
