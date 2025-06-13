document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const boardContainer = document.getElementById('game-board-container');
    const playerTurnElement = document.getElementById('player-turn');
    const newGameButton = document.getElementById('new-game-btn');
    const senteCapturedContainer = document.getElementById('sente-captured-pieces');
    const goteCapturedContainer = document.getElementById('gote-captured-pieces');
    const singlePlayerCheckbox = document.getElementById('single-player-checkbox');

    // --- Piece Definitions with Image Paths ---
    // NOTE: Actual image files need to be placed in 'images_shogi_game/' directory
    // For Gote pieces, if using CSS rotation, img_gote can be same as img_sente.
    // Here, we assume only one set of images (Sente orientation) and CSS will handle Gote.
    const IMAGE_DIR = 'images_shogi_game/';
    const PIECES = {
        KING:   { name: '玉', img: IMAGE_DIR + 'king.svg' }, // Or 'osho.svg'
        ROOK:   { name: '飛', img: IMAGE_DIR + 'rook.svg' },
        BISHOP: { name: '角', img: IMAGE_DIR + 'bishop.svg' },
        GOLD:   { name: '金', img: IMAGE_DIR + 'gold.svg' },
        SILVER: { name: '銀', img: IMAGE_DIR + 'silver.svg' },
        KNIGHT: { name: '桂', img: IMAGE_DIR + 'knight.svg' },
        LANCE:  { name: '香', img: IMAGE_DIR + 'lance.svg' },
        PAWN:   { name: '歩', img: IMAGE_DIR + 'pawn.svg' },
        PROMOTED_ROOK:   { name: '龍', img: IMAGE_DIR + 'promoted_rook.svg' },    // Dragon
        PROMOTED_BISHOP: { name: '馬', img: IMAGE_DIR + 'promoted_bishop.svg' },  // Horse
        PROMOTED_SILVER: { name: '全', img: IMAGE_DIR + 'promoted_silver.svg' },
        PROMOTED_KNIGHT: { name: '圭', img: IMAGE_DIR + 'promoted_knight.svg' },
        PROMOTED_LANCE:  { name: '杏', img: IMAGE_DIR + 'promoted_lance.svg' },
        PROMOTED_PAWN:   { name: 'と', img: IMAGE_DIR + 'promoted_pawn.svg' },    // Tokin
    };

    // Helper to get piece definition (e.g., PIECES.PAWN based on '歩')
    function getPieceDefByType(pieceTypeSymbol) {
        for (const key in PIECES) {
            if (PIECES[key].name === pieceTypeSymbol) return PIECES[key];
        }
        return null; // Should not happen
    }
    // Reverse map from symbol to key (e.g., '玉' -> 'KING')
    const pieceSymbolToKey = {};
    for (const key in PIECES) { pieceSymbolToKey[PIECES[key].name] = key; }


    const UNPROMOTED_MAP = { // Maps promoted piece *symbol* to unpromoted piece *symbol*
        [PIECES.PROMOTED_ROOK.name]: PIECES.ROOK.name, [PIECES.PROMOTED_BISHOP.name]: PIECES.BISHOP.name,
        [PIECES.PROMOTED_SILVER.name]: PIECES.SILVER.name, [PIECES.PROMOTED_KNIGHT.name]: PIECES.KNIGHT.name,
        [PIECES.PROMOTED_LANCE.name]: PIECES.LANCE.name, [PIECES.PROMOTED_PAWN.name]: PIECES.PAWN.name,
    };
    const PROMOTION_MAP = { // Maps unpromoted piece *symbol* to promoted piece *symbol*
        [PIECES.ROOK.name]: PIECES.PROMOTED_ROOK.name, [PIECES.BISHOP.name]: PIECES.PROMOTED_BISHOP.name,
        [PIECES.SILVER.name]: PIECES.PROMOTED_SILVER.name, [PIECES.KNIGHT.name]: PIECES.PROMOTED_KNIGHT.name,
        [PIECES.LANCE.name]: PIECES.PROMOTED_LANCE.name, [PIECES.PAWN.name]: PIECES.PROMOTED_PAWN.name,
    };
    const PROMOTABLE_PIECE_SYMBOLS = Object.keys(PROMOTION_MAP);

    // Piece values for AI (using piece symbols as keys)
    const PIECE_VALUES = {
        [PIECES.PAWN.name]: 1, [PIECES.LANCE.name]: 3, [PIECES.KNIGHT.name]: 3, [PIECES.SILVER.name]: 5, [PIECES.GOLD.name]: 6,
        [PIECES.BISHOP.name]: 8, [PIECES.ROOK.name]: 10, [PIECES.KING.name]: 1000,
        [PIECES.PROMOTED_PAWN.name]: 4, [PIECES.PROMOTED_LANCE.name]: 4, [PIECES.PROMOTED_KNIGHT.name]: 4, [PIECES.PROMOTED_SILVER.name]: 6,
        [PIECES.PROMOTED_BISHOP.name]: 10, [PIECES.PROMOTED_ROOK.name]: 12,
    };


    const PLAYER_SENTE = 'sente'; const PLAYER_GOTE = 'gote';
    const SENTE_PROMOTION_ZONE = [0, 1, 2]; const GOTE_PROMOTION_ZONE = [6, 7, 8];
    let board = []; let currentPlayer = PLAYER_SENTE; let selectedPiece = null;
    let selectedPieceForDrop = null; let senteCapturedPieces = []; let goteCapturedPieces = [];
    let isGameOver = false; let gameStatusMessage = ""; let isSinglePlayerMode = false; let isAiThinking = false;

    function deepCopyBoard(b) { return b.map(r => r.map(p => (p ? { ...p } : null))); }
    function getKingPosition(player, currentBoard) { for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { const p = currentBoard[r][c]; if (p && p.type === PIECES.KING.name && p.player === player) return { r, c }; } return null; }

    // --- Piece Movement Logic (operates on piece *symbols*) ---
    const pieceMoveLogic = {
        [PIECES.PAWN.name]:(r,c,player,p,b)=>{const dir=player===PLAYER_SENTE?-1:1;return[[r+dir,c]];},
        [PIECES.LANCE.name]:(r,c,player,p,b)=>{const dir=player===PLAYER_SENTE?-1:1;const m=[];for(let i=1;i<9;i++){const nR=r+dir*i;if(nR<0||nR>8)break;const tP=b[nR][c];if(tP){if(tP.player!==player)m.push([nR,c]);break;}m.push([nR,c]);}return m;},
        [PIECES.KNIGHT.name]:(r,c,player,p,b)=>{const dir=player===PLAYER_SENTE?-1:1;return[[r+dir*2,c-1],[r+dir*2,c+1]];},
        [PIECES.SILVER.name]:(r,c,player,p,b)=>{const dir=player===PLAYER_SENTE?-1:1;return[[r+dir,c],[r+dir,c-1],[r+dir,c+1],[r-dir,c-1],[r-dir,c+1]];},
        [PIECES.GOLD.name]:(r,c,player,p,b)=>{const dir=player===PLAYER_SENTE?-1:1;return[[r+dir,c],[r-dir,c],[r,c-1],[r,c+1],[r+dir,c-1],[r+dir,c+1]].filter(([nr,nc])=>!(nr===r-dir&&(nc===c-1||nc===c+1)));},
        [PIECES.BISHOP.name]:(r,c,player,p,b)=>{const m=[];const dirs=[[-1,-1],[-1,1],[1,-1],[1,1]];for(const[dr,dc]of dirs){for(let i=1;i<9;i++){const nR=r+dr*i;const nC=c+dc*i;if(nR<0||nR>8||nC<0||nC>8)break;const tP=b[nR][nC];if(tP){if(tP.player!==player)m.push([nR,nC]);break;}m.push([nR,nC]);}}if(p.promoted){m.push([r+1,c],[r-1,c],[r,c+1],[r,c-1]);}return m;},
        [PIECES.ROOK.name]:(r,c,player,p,b)=>{const m=[];const dirs=[[-1,0],[1,0],[0,-1],[0,1]];for(const[dr,dc]of dirs){for(let i=1;i<9;i++){const nR=r+dr*i;const nC=c+dc*i;if(nR<0||nR>8||nC<0||nC>8)break;const tP=b[nR][nC];if(tP){if(tP.player!==player)m.push([nR,nC]);break;}m.push([nR,nC]);}}if(p.promoted){m.push([r+1,c+1],[r+1,c-1],[r-1,c+1],[r-1,c-1]);}return m;},
        [PIECES.KING.name]:(r,c,player,p,b)=>{return[[r-1,c-1],[r-1,c],[r-1,c+1],[r,c-1],[r,c+1],[r+1,c-1],[r+1,c],[r+1,c+1]];}
    };
    pieceMoveLogic[PIECES.PROMOTED_PAWN.name]=pieceMoveLogic[PIECES.GOLD.name]; pieceMoveLogic[PIECES.PROMOTED_LANCE.name]=pieceMoveLogic[PIECES.GOLD.name]; pieceMoveLogic[PIECES.PROMOTED_KNIGHT.name]=pieceMoveLogic[PIECES.GOLD.name]; pieceMoveLogic[PIECES.PROMOTED_SILVER.name]=pieceMoveLogic[PIECES.GOLD.name];

    function getValidMoves(pc,r,c,cB){
        let currentPieceType = pc.type; // This is a symbol like '歩'
        if(pc.promoted && PROMOTION_MAP[pc.type]) { // If type is '歩' and promoted is true
            currentPieceType = PROMOTION_MAP[pc.type]; // currentPieceType becomes 'と'
        }
        const moveFn = pieceMoveLogic[currentPieceType];

        if(!moveFn) return [];

        // For promoted Rook/Bishop, their base logic already has the p.promoted check.
        // So we call the base type's logic and pass the full piece object.
        const unpromotedTypeIfSlider = UNPROMOTED_MAP[currentPieceType]; // '龍' -> '飛'
        if(unpromotedTypeIfSlider && (unpromotedTypeIfSlider === PIECES.ROOK.name || unpromotedTypeIfSlider === PIECES.BISHOP.name)){
             const baseLogic = pieceMoveLogic[unpromotedTypeIfSlider]; // logic for '飛'
             if(baseLogic) return baseLogic(r,c,pc.player,pc, cB).filter(m=>m[0]>=0&&m[0]<9&&m[1]>=0&&m[1]<9&&(!cB[m[0]][m[1]]||cB[m[0]][m[1]].player!==pc.player));
        }

        return moveFn(r,c,pc.player,pc,cB).filter(([tR,tC])=>tR>=0&&tR<9&&tC>=0&&tC<9&&(!cB[tR][tC]||cB[tR][tC].player!==pc.player));
    }

    function isInCheck(player,currentBoard){const kingPos=getKingPosition(player,currentBoard);if(!kingPos)return false;const opp=player===PLAYER_SENTE?PLAYER_GOTE:PLAYER_SENTE;for(let r=0;r<9;r++){for(let c=0;c<9;c++){const p=currentBoard[r][c];if(p&&p.player===opp){const moves=getValidMoves(p,r,c,currentBoard);if(moves.some(([mr,mc])=>mr===kingPos.r&&mc===kingPos.c))return true;}}}return false;}
    function isCheckmate(player,currentBoard){if(!isInCheck(player,currentBoard))return false;for(let r=0;r<9;r++){for(let c=0;c<9;c++){const p=currentBoard[r][c];if(p&&p.player===player){const moves=getValidMoves(p,r,c,currentBoard);for(const[mr,mc]of moves){const tB=deepCopyBoard(currentBoard);let simPiece={...p};tB[mr][mc]=simPiece;tB[r][c]=null;if(canPromote(simPiece,mr,r,player)&&(mustPromote(simPiece,mr,player)||true)){simPiece.promoted=true;}if(!isInCheck(player,tB))return false;}}}}const captured=player===PLAYER_SENTE?senteCapturedPieces:goteCapturedPieces;for(const cp of captured){for(let dr=0;dr<9;dr++){for(let dc=0;dc<9;dc++){if(isValidDrop(cp.type,dr,dc,player,currentBoard)){const tB=deepCopyBoard(currentBoard);tB[dr][dc]={type:cp.type,player:player,promoted:false};if(!isInCheck(player,tB))return false;}}}}return true;}

    function initializeBoard(){isSinglePlayerMode=singlePlayerCheckbox.checked;board=Array(9).fill(null).map(()=>Array(9).fill(null));senteCapturedPieces=[];goteCapturedPieces=[];isGameOver=false;gameStatusMessage="";isAiThinking=false;const place=(t,p,r,c)=>{board[r][c]={type:t,player:p,promoted:false};};place(PIECES.LANCE.name,PLAYER_GOTE,0,0);place(PIECES.KNIGHT.name,PLAYER_GOTE,0,1);place(PIECES.SILVER.name,PLAYER_GOTE,0,2);place(PIECES.GOLD.name,PLAYER_GOTE,0,3);place(PIECES.KING.name,PLAYER_GOTE,0,4);place(PIECES.GOLD.name,PLAYER_GOTE,0,5);place(PIECES.SILVER.name,PLAYER_GOTE,0,6);place(PIECES.KNIGHT.name,PLAYER_GOTE,0,7);place(PIECES.LANCE.name,PLAYER_GOTE,0,8);place(PIECES.BISHOP.name,PLAYER_GOTE,1,1);place(PIECES.ROOK.name,PLAYER_GOTE,1,7);for(let i=0;i<9;i++)place(PIECES.PAWN.name,PLAYER_GOTE,2,i);for(let i=0;i<9;i++)place(PIECES.PAWN.name,PLAYER_SENTE,6,i);place(PIECES.ROOK.name,PLAYER_SENTE,7,1);place(PIECES.BISHOP.name,PLAYER_SENTE,7,7);place(PIECES.LANCE.name,PLAYER_SENTE,8,0);place(PIECES.KNIGHT.name,PLAYER_SENTE,8,1);place(PIECES.SILVER.name,PLAYER_SENTE,8,2);place(PIECES.GOLD.name,PLAYER_SENTE,8,3);place(PIECES.KING.name,PLAYER_SENTE,8,4);place(PIECES.GOLD.name,PLAYER_SENTE,8,5);place(PIECES.SILVER.name,PLAYER_SENTE,8,6);place(PIECES.KNIGHT.name,PLAYER_SENTE,8,7);place(PIECES.LANCE.name,PLAYER_SENTE,8,8);selectedPiece=null;selectedPieceForDrop=null;currentPlayer=PLAYER_SENTE;updatePlayerTurnDisplay();renderBoard();}

    function renderBoard() {
        boardContainer.innerHTML = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.dataset.row = r; square.dataset.col = c;
                const pieceData = board[r][c]; // e.g. { type: '歩', player: 'sente', promoted: false }
                if (pieceData) {
                    const pieceElementContainer = document.createElement('div'); // To hold image and apply rotation/classes
                    pieceElementContainer.classList.add('piece', pieceData.player);

                    let pieceSymbolToRender = pieceData.type;
                    if (pieceData.promoted && PROMOTION_MAP[pieceData.type]) {
                        pieceSymbolToRender = PROMOTION_MAP[pieceData.type];
                    }
                    const pieceDef = getPieceDefByType(pieceSymbolToRender);

                    if (pieceDef && pieceDef.img) {
                        const imgElement = document.createElement('img');
                        imgElement.src = pieceDef.img;
                        imgElement.alt = pieceDef.name;
                        // No need to add pieceData.player to imgElement if .piece container handles rotation
                        pieceElementContainer.appendChild(imgElement);
                    } else { // Fallback to text if image not found or def missing
                        pieceElementContainer.textContent = pieceSymbolToRender;
                    }

                    if (pieceData.type === PIECES.KING.name && isInCheck(pieceData.player, board)) {
                        pieceElementContainer.classList.add('in-check'); // Highlight container of the king's image
                    }
                    square.appendChild(pieceElementContainer);
                }
                boardContainer.appendChild(square);
            }
        }
        addSquareClickListeners(); renderCapturedPieces(); updatePlayerTurnDisplay();
    }

    function renderCapturedPieces() {
        const setup = (cont, list, owner) => {
            if(!cont) return; cont.innerHTML = '';
            const counts = {}; list.forEach(p => counts[p.type] = (counts[p.type] || 0) + 1); // p.type is a symbol e.g. '歩'
            Object.entries(counts).forEach(([typeSymbol, count]) => {
                const disp = document.createElement('div');
                disp.classList.add('captured-piece-display');
                if(selectedPieceForDrop && selectedPieceForDrop.type === typeSymbol && currentPlayer === owner) disp.classList.add('selected-for-drop');

                const pieceDef = getPieceDefByType(typeSymbol);
                if (pieceDef && pieceDef.img) {
                    const imgElement = document.createElement('img');
                    imgElement.src = pieceDef.img; // Using default (Sente) orientation for captured pieces
                    imgElement.alt = pieceDef.name;
                    imgElement.style.width = '20px'; // Smaller images for captured area
                    imgElement.style.height = '20px';
                    disp.appendChild(imgElement);
                    disp.appendChild(document.createTextNode(` (${count})`));
                } else {
                    disp.textContent = `${typeSymbol} (${count})`;
                }
                disp.dataset.pieceType = typeSymbol; // Store symbol
                if(currentPlayer === owner && !isGameOver && !(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE)) disp.addEventListener('click',()=>handleCapturedPieceClick(typeSymbol, owner));
                cont.appendChild(disp);
            });
        };
        setup(senteCapturedContainer, senteCapturedPieces, PLAYER_SENTE);
        setup(goteCapturedContainer, goteCapturedPieces, PLAYER_GOTE);
    }

    function updatePlayerTurnDisplay(){let turnText=isGameOver?gameStatusMessage:`${currentPlayer===PLAYER_SENTE?"Sente's":"Gote's"} Turn`;if(isAiThinking)turnText="AI is thinking...";else if(selectedPieceForDrop&&!isGameOver)turnText+=` (Dropping ${selectedPieceForDrop.type})`;if(gameStatusMessage&&!isGameOver&&isInCheck(currentPlayer,board)&&!isAiThinking)turnText+=` - ${gameStatusMessage}`;playerTurnElement.textContent=turnText;}
    function isPromotionZone(row,player){return player===PLAYER_SENTE?SENTE_PROMOTION_ZONE.includes(row):GOTE_PROMOTION_ZONE.includes(row);}
    function canPromote(pc,toR,fromR,plyr){if(pc.promoted||!PROMOTABLE_PIECE_SYMBOLS.includes(pc.type))return false;return isPromotionZone(toR,plyr)||isPromotionZone(fromR,plyr);}
    function mustPromote(pc,toR,plyr){if(pc.type===PIECES.PAWN.name||pc.type===PIECES.LANCE.name)return plyr===PLAYER_SENTE?toR===0:toR===8;if(pc.type===PIECES.KNIGHT.name)return plyr===PLAYER_SENTE?(toR===0||toR===1):(toR===7||toR===8);return false;}
    function isValidDrop(pieceTypeSymbol,toR,toC,player,currentBoard){if(currentBoard[toR][toC])return false;if((pieceTypeSymbol===PIECES.PAWN.name||pieceTypeSymbol===PIECES.LANCE.name)&&((player===PLAYER_SENTE&&toR===0)||(player===PLAYER_GOTE&&toR===8)))return false;if(pieceTypeSymbol===PIECES.KNIGHT.name&&((player===PLAYER_SENTE&&(toR===0||toR===1))||(player===PLAYER_GOTE&&(toR===7||toR===8))))return false;if(pieceTypeSymbol===PIECES.PAWN.name){for(let r=0;r<9;r++){const ep=currentBoard[r][toC];if(ep&&ep.player===player&&ep.type===PIECES.PAWN.name&&!ep.promoted)return false;}}return true;}

    // AI Logic
    function makeAiMove(){isAiThinking=true;updatePlayerTurnDisplay();setTimeout(()=>{let allLegalActions=[];for(let r=0;r<9;r++){for(let c=0;c<9;c++){const piece=board[r][c];if(piece&&piece.player===PLAYER_GOTE){const moves=getValidMoves(piece,r,c,board);for(const[mr,mc]of moves){const tempBoard=deepCopyBoard(board);const pieceCopy={...piece};const capturedPieceOnTarget=tempBoard[mr][mc];tempBoard[mr][mc]=pieceCopy;tempBoard[r][c]=null;let isPromotion=false;if(canPromote(pieceCopy,mr,r,PLAYER_GOTE)&&!pieceCopy.promoted){if(mustPromote(pieceCopy,mr,PLAYER_GOTE)||true){isPromotion=true;}}const pieceForCheckTest={...pieceCopy};if(isPromotion)pieceForCheckTest.promoted=true;tempBoard[mr][mc]=pieceForCheckTest;if(!isInCheck(PLAYER_GOTE,tempBoard)){let score=0;if(capturedPieceOnTarget)score+=(PIECE_VALUES[capturedPieceOnTarget.type]||1)*10;if(isPromotion)score+=2;if(isInCheck(PLAYER_SENTE,tempBoard))score+=50;allLegalActions.push({action:'move',piece,fromR:r,fromC:c,toR:mr,toC:mc,promotion:isPromotion,score});}}}}}for(const capPiece of goteCapturedPieces){for(let dr=0;dr<9;dr++){for(let dc=0;dc<9;dc++){if(isValidDrop(capPiece.type,dr,dc,PLAYER_GOTE,board)){const tempBoard=deepCopyBoard(board);tempBoard[dr][dc]={type:capPiece.type,player:PLAYER_GOTE,promoted:false};if(!isInCheck(PLAYER_GOTE,tempBoard)){let score=1;if(isInCheck(PLAYER_SENTE,tempBoard))score+=50;allLegalActions.push({action:'drop',pieceType:capPiece.type,toR:dr,toC:dc,score});}}}}}if(allLegalActions.length===0){console.log("AI has no legal moves!");isAiThinking=false;updatePlayerTurnDisplay();return;}allLegalActions.sort((a,b)=>b.score-a.score);const bestScore=allLegalActions[0].score;const bestMoves=allLegalActions.filter(m=>m.score===bestScore);const chosenAction=bestMoves[Math.floor(Math.random()*bestMoves.length)];console.log("AI Chose: ",chosenAction);if(chosenAction.action==='move'){const pieceToMove=board[chosenAction.fromR][chosenAction.fromC];const targetPiece=board[chosenAction.toR][chosenAction.toC];if(targetPiece){let unpromotedType=UNPROMOTED_MAP[targetPiece.type]||targetPiece.type;goteCapturedPieces.push({type:unpromotedType,originalPlayer:targetPiece.player});}board[chosenAction.fromR][chosenAction.fromC]=null;pieceToMove.promoted=chosenAction.promotion;board[chosenAction.toR][chosenAction.toC]=pieceToMove;}else if(chosenAction.action==='drop'){board[chosenAction.toR][chosenAction.toC]={type:chosenAction.pieceType,player:PLAYER_GOTE,promoted:false};const dropIdx=goteCapturedPieces.findIndex(p=>p.type===chosenAction.pieceType);if(dropIdx>-1)goteCapturedPieces.splice(dropIdx,1);}isAiThinking=false;switchPlayerAndCheckGameEnd();},500);}
    function handleCapturedPieceClick(typeSymbol,owner){if(isGameOver||currentPlayer!==owner||(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE))return;if(selectedPieceForDrop&&selectedPieceForDrop.type===typeSymbol){selectedPieceForDrop=null;}else{selectedPieceForDrop={type:typeSymbol,originalPlayer:owner};selectedPiece=null;}renderCapturedPieces();updatePlayerTurnDisplay();}
    function handleSquareClick(event){if(isGameOver||isAiThinking||(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE))return;const clickedSq=event.target.closest('.square');if(!clickedSq)return;const toR=parseInt(clickedSq.dataset.row);const toC=parseInt(clickedSq.dataset.col);if(selectedPieceForDrop){const pieceToDropSymbol=selectedPieceForDrop.type;if(board[toR][toC]){if(board[toR][toC].player===currentPlayer){selectedPiece={piece:board[toR][toC],fromRow:toR,fromCol:toC};selectedPieceForDrop=null;renderCapturedPieces();updatePlayerTurnDisplay();console.log(`Switched to move mode. Selected ${selectedPiece.piece.type}`);}else{console.log("Cannot drop onto an occupied square.");}return;}if(isValidDrop(pieceToDropSymbol,toR,toC,currentPlayer,board)){const tempBoard=deepCopyBoard(board);tempBoard[toR][toC]={type:pieceToDropSymbol,player:currentPlayer,promoted:false};if(isInCheck(currentPlayer,tempBoard)){console.log("Illegal drop: cannot put own king in check.");gameStatusMessage="Illegal: Puts King in Check";updatePlayerTurnDisplay();setTimeout(()=>{gameStatusMessage="";updatePlayerTurnDisplay();},2000);return;}board[toR][toC]=tempBoard[toR][toC];const hand=currentPlayer===PLAYER_SENTE?senteCapturedPieces:goteCapturedPieces;const idx=hand.findIndex(p=>p.type===pieceToDropSymbol);if(idx>-1)hand.splice(idx,1);console.log(`${currentPlayer} dropped ${pieceToDropSymbol} at (${toR},${toC})`);selectedPieceForDrop=null;switchPlayerAndCheckGameEnd();}else{console.log(`Invalid drop for ${pieceToDropSymbol} at (${toR},${toC})`);}}else if(selectedPiece){const{piece,fromRow,fromCol}=selectedPiece;if(fromRow===toR&&fromCol===toC){selectedPiece=null;console.log("Deselected.");return;}const targetPiece=board[toR][toC];if(targetPiece&&targetPiece.player===currentPlayer){selectedPiece={piece:targetPiece,fromRow:toR,fromCol:toC};console.log(`Reselected: ${targetPiece.type}`);return;}const validMoves=getValidMoves(piece,fromRow,fromCol,board);if(validMoves.some(([r,c])=>r===toR&&c===toC)){const tempBoard=deepCopyBoard(board);let pieceToMoveCopy={...piece};if(targetPiece&&targetPiece.player!==currentPlayer){}tempBoard[toR][toC]=pieceToMoveCopy;tempBoard[fromRow][fromCol]=null;let potentialPromotion=false;if(canPromote(pieceToMoveCopy,toR,fromRow,currentPlayer)){if(mustPromote(pieceToMoveCopy,toR,currentPlayer)||window.confirm(`Promote ${pieceToMoveCopy.type} to ${PROMOTION_MAP[pieceToMoveCopy.type] || pieceToMoveCopy.type}?`)){potentialPromotion=true;pieceToMoveCopy.promoted=true;}}tempBoard[toR][toC]=pieceToMoveCopy;if(isInCheck(currentPlayer,tempBoard)){console.log("Illegal move: cannot put own king in check.");gameStatusMessage="Illegal: Puts King in Check";updatePlayerTurnDisplay();setTimeout(()=>{gameStatusMessage="";updatePlayerTurnDisplay();},2000);return;}let actualMovedPiece={...piece};if(targetPiece&&targetPiece.player!==currentPlayer){const captured=targetPiece;let unpromotedType=UNPROMOTED_MAP[captured.type]||captured.type;(currentPlayer===PLAYER_SENTE?senteCapturedPieces:goteCapturedPieces).push({type:unpromotedType,originalPlayer:captured.player});console.log(`${currentPlayer} captured ${captured.type}`);}board[fromRow][fromCol]=null;if(canPromote(actualMovedPiece,toR,fromRow,currentPlayer)){if(mustPromote(actualMovedPiece,toR,currentPlayer)||pieceToMoveCopy.promoted){actualMovedPiece.promoted=true;console.log(`Piece ${piece.type} promoted.`);}}board[toR][toC]=actualMovedPiece;console.log(`${currentPlayer} moved ${piece.type} from (${fromRow},${fromCol}) to (${toR},${toC})`);selectedPiece=null;switchPlayerAndCheckGameEnd();}else{console.log(`Invalid move for ${piece.type}`);}}else{const pieceOnSq=board[toR][toC];if(pieceOnSq&&pieceOnSq.player===currentPlayer){selectedPiece={piece:pieceOnSq,fromRow:toR,fromCol:toC};selectedPieceForDrop=null;console.log(`Selected: ${pieceOnSq.type}`);renderCapturedPieces();updatePlayerTurnDisplay();}else if(pieceOnSq){console.log("Opponent's piece.");}else{console.log("Empty square.");}}}
    function switchPlayerAndCheckGameEnd(){const prevPlayer=currentPlayer;currentPlayer=currentPlayer===PLAYER_SENTE?PLAYER_GOTE:PLAYER_SENTE;gameStatusMessage="";if(isCheckmate(currentPlayer,board)){gameStatusMessage=`Checkmate! ${prevPlayer} wins!`;isGameOver=true;console.log(gameStatusMessage);}else if(isInCheck(currentPlayer,board)){gameStatusMessage="Check!";console.log("Player is in Check!");}renderBoard();if(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE&&!isGameOver){makeAiMove();}}
    function addSquareClickListeners(){const squares=document.querySelectorAll('.square');squares.forEach(sq=>{sq.removeEventListener('click',handleSquareClick);sq.addEventListener('click',handleSquareClick);});}
    newGameButton.addEventListener('click',startGame);singlePlayerCheckbox.addEventListener('change',startGame);function startGame(){console.log("New Game started");initializeBoard();}startGame();
});
console.log("Shogi game script (with piece images logic) loaded.");
