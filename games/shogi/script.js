document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const boardContainer = document.getElementById('game-board-container');
    const homeButton = document.getElementById('homeButton');
    const playerTurnElement = document.getElementById('player-turn');
    const newGameButton = document.getElementById('new-game-btn');
    const senteCapturedContainer = document.getElementById('sente-captured-pieces');
    const goteCapturedContainer = document.getElementById('gote-captured-pieces');
    const singlePlayerCheckbox = document.getElementById('single-player-checkbox');
    const highlightModeCheckbox = document.getElementById('toggle-highlight-mode-checkbox');

    // --- Piece Definitions from ShogiLogic ---
    const { PIECES, PROMOTION_MAP, UNPROMOTED_MAP, PROMOTABLE_PIECE_KEYS, PIECE_VALUES,
            PLAYER_SENTE, PLAYER_GOTE, SENTE_PROMOTION_ZONE, GOTE_PROMOTION_ZONE,
            deepCopyBoard, getKingPosition, getValidMoves,
            isInCheck, isCheckmate, isPromotionZone,
            canPromote, mustPromote, isValidDrop } = window.ShogiLogic;
    let board = []; let currentPlayer = PLAYER_SENTE; let selectedPiece = null;
    let selectedPieceForDrop = null; let senteCapturedPieces = []; let goteCapturedPieces = [];
    let isGameOver = false; let gameStatusMessage = ""; let isSinglePlayerMode = false; let isAiThinking = false;
    let isHighlightModeEnabled = true; // Initialized below from checkbox

    // --- DOM Utility ---
    function getSquareElement(row, col) { return document.querySelector(`.square[data-row='${row}'][data-col='${col}']`); }

    // --- Valid Move Highlighting ---
    function clearAllValidMoveHighlights() {
        document.querySelectorAll('.square.valid-move-highlight').forEach(sq => {
            sq.classList.remove('valid-move-highlight');
        });
    }

    function showValidMoveHighlights(piece, fromRow, fromCol) {
        clearAllValidMoveHighlights();
        if (!isHighlightModeEnabled || !piece) return;

        const validMoves = getValidMoves(piece, fromRow, fromCol, board);
        validMoves.forEach(([r, c]) => {
            const squareEl = getSquareElement(r, c);
            if (squareEl) {
                squareEl.classList.add('valid-move-highlight');
            }
        });
    }

    // --- Game Initialization & Rendering ---
    function initializeBoard(){isSinglePlayerMode=singlePlayerCheckbox.checked;isHighlightModeEnabled=highlightModeCheckbox.checked;board=Array(9).fill(null).map(()=>Array(9).fill(null));senteCapturedPieces=[];goteCapturedPieces=[];isGameOver=false;gameStatusMessage="";isAiThinking=false;const place=(k,p,r,c)=>{board[r][c]={type:k,player:p,promoted:false};};place('LANCE',PLAYER_GOTE,0,0);place('KNIGHT',PLAYER_GOTE,0,1);place('SILVER',PLAYER_GOTE,0,2);place('GOLD',PLAYER_GOTE,0,3);place('KING',PLAYER_GOTE,0,4);place('GOLD',PLAYER_GOTE,0,5);place('SILVER',PLAYER_GOTE,0,6);place('KNIGHT',PLAYER_GOTE,0,7);place('LANCE',PLAYER_GOTE,0,8);place('ROOK',PLAYER_GOTE,1,1);place('BISHOP',PLAYER_GOTE,1,7);for(let i=0;i<9;i++)place('PAWN',PLAYER_GOTE,2,i);for(let i=0;i<9;i++)place('PAWN',PLAYER_SENTE,6,i);place('BISHOP',PLAYER_SENTE,7,1);place('ROOK',PLAYER_SENTE,7,7);place('LANCE',PLAYER_SENTE,8,0);place('KNIGHT',PLAYER_SENTE,8,1);place('SILVER',PLAYER_SENTE,8,2);place('GOLD',PLAYER_SENTE,8,3);place('KING',PLAYER_SENTE,8,4);place('GOLD',PLAYER_SENTE,8,5);place('SILVER',PLAYER_SENTE,8,6);place('KNIGHT',PLAYER_SENTE,8,7);place('LANCE',PLAYER_SENTE,8,8);selectedPiece=null;selectedPieceForDrop=null;currentPlayer=PLAYER_SENTE;clearAllValidMoveHighlights();updatePlayerTurnDisplay();renderBoard();}
    function renderBoard(){boardContainer.innerHTML='';for(let r=0;r<9;r++){for(let c=0;c<9;c++){const sq=document.createElement('div');sq.classList.add('square');sq.dataset.row=r;sq.dataset.col=c;const pD=board[r][c];if(pD){const pE=document.createElement('div');pE.classList.add('piece',pD.player);let dSK=pD.type;if(pD.promoted&&PROMOTION_MAP[pD.type]){dSK=PROMOTION_MAP[pD.type];}pE.textContent=PIECES[dSK];if(pD.type==='KING'&&isInCheck(pD.player,board))pE.classList.add('in-check');sq.appendChild(pE);}if(selectedPiece&&selectedPiece.fromRow===r&&selectedPiece.fromCol===c)sq.classList.add('selected-piece-square'); /* Optional: highlight selected piece's square */ boardContainer.appendChild(sq);}}addSquareClickListeners();renderCapturedPieces();updatePlayerTurnDisplay();}
    function renderCapturedPieces(){const setup=(cont,list,owner)=>{if(!cont)return;cont.innerHTML='';const counts={};list.forEach(p=>counts[p.type]=(counts[p.type]||0)+1);Object.entries(counts).forEach(([key,count])=>{const disp=document.createElement('div');disp.classList.add('captured-piece-display');if(selectedPieceForDrop&&selectedPieceForDrop.type===key&&currentPlayer===owner)disp.classList.add('selected-for-drop');disp.textContent=`${PIECES[key]} (${count})`;disp.dataset.pieceTypeKey=key;if(currentPlayer===owner&&!isGameOver&&!(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE))disp.addEventListener('click',()=>handleCapturedPieceClick(key,owner));cont.appendChild(disp);});};setup(senteCapturedContainer,senteCapturedPieces,PLAYER_SENTE);setup(goteCapturedContainer,goteCapturedPieces,PLAYER_GOTE);}
    function updatePlayerTurnDisplay(){let turnText=isGameOver?gameStatusMessage:`${currentPlayer===PLAYER_SENTE?"Sente's":"Gote's"} Turn`;if(isAiThinking)turnText="AI is thinking...";else if(selectedPieceForDrop&&!isGameOver)turnText+=` (Dropping ${PIECES[selectedPieceForDrop.type]})`;if(gameStatusMessage&&!isGameOver&&isInCheck(currentPlayer,board)&&!isAiThinking)turnText+=` - ${gameStatusMessage}`;playerTurnElement.textContent=turnText;}

    // --- AI Logic --- (Same as before)
    function makeAiMove(){isAiThinking=true;updatePlayerTurnDisplay();setTimeout(()=>{let allLegalActions=[];for(let r=0;r<9;r++){for(let c=0;c<9;c++){const piece=board[r][c];if(piece&&piece.player===PLAYER_GOTE){const moves=getValidMoves(piece,r,c,board);for(const[mr,mc]of moves){const tempBoard=deepCopyBoard(board);const pieceCopy={...piece};const capturedPieceOnTarget=tempBoard[mr][mc];tempBoard[mr][mc]=pieceCopy;tempBoard[r][c]=null;let isPromotion=false;if(canPromote(pieceCopy,mr,r,PLAYER_GOTE)&&!pieceCopy.promoted){if(mustPromote(pieceCopy,mr,PLAYER_GOTE)||true){isPromotion=true;}}const pieceForCheckTest={...pieceCopy};if(isPromotion)pieceForCheckTest.promoted=true;tempBoard[mr][mc]=pieceForCheckTest;if(!isInCheck(PLAYER_GOTE,tempBoard)){let score=0;if(capturedPieceOnTarget)score+=(PIECE_VALUES[capturedPieceOnTarget.type]||1)*10;if(isPromotion)score+=2;if(isInCheck(PLAYER_SENTE,tempBoard))score+=50;allLegalActions.push({action:'move',piece,fromR:r,fromC:c,toR:mr,toC:mc,promotion:isPromotion,score});}}}}}for(const capPiece of goteCapturedPieces){for(let dr=0;dr<9;dr++){for(let dc=0;dc<9;dc++){if(isValidDrop(capPiece.type,dr,dc,PLAYER_GOTE,board)){const tempBoard=deepCopyBoard(board);tempBoard[dr][dc]={type:capPiece.type,player:PLAYER_GOTE,promoted:false};if(!isInCheck(PLAYER_GOTE,tempBoard)){let score=1;if(isInCheck(PLAYER_SENTE,tempBoard))score+=50;allLegalActions.push({action:'drop',pieceTypeKey:capPiece.type,toR:dr,toC:dc,score});}}}}}if(allLegalActions.length===0){console.log("AI has no legal moves!");isAiThinking=false;updatePlayerTurnDisplay();return;}allLegalActions.sort((a,b)=>b.score-a.score);const bestScore=allLegalActions[0].score;const bestMoves=allLegalActions.filter(m=>m.score===bestScore);const chosenAction=bestMoves[Math.floor(Math.random()*bestMoves.length)];console.log("AI Chose: ",chosenAction);if(chosenAction.action==='move'){const pieceToMove=board[chosenAction.fromR][chosenAction.fromC];const targetPiece=board[chosenAction.toR][chosenAction.toC];if(targetPiece){let unpromotedTypeKey=UNPROMOTED_MAP[targetPiece.type]||targetPiece.type;goteCapturedPieces.push({type:unpromotedTypeKey,originalPlayer:targetPiece.player});}board[chosenAction.fromR][chosenAction.fromC]=null;pieceToMove.promoted=chosenAction.promotion;board[chosenAction.toR][chosenAction.toC]=pieceToMove;}else if(chosenAction.action==='drop'){board[chosenAction.toR][chosenAction.toC]={type:chosenAction.pieceTypeKey,player:PLAYER_GOTE,promoted:false};const dropIdx=goteCapturedPieces.findIndex(p=>p.type===chosenAction.pieceTypeKey);if(dropIdx>-1)goteCapturedPieces.splice(dropIdx,1);}isAiThinking=false;switchPlayerAndCheckGameEnd();},500);}

    // --- Click Handlers & Game Flow ---
    function handleCapturedPieceClick(typeKey,owner){if(isGameOver||currentPlayer!==owner||(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE))return; clearAllValidMoveHighlights(); if(selectedPieceForDrop&&selectedPieceForDrop.type===typeKey){selectedPieceForDrop=null;}else{selectedPieceForDrop={type:typeKey,originalPlayer:owner};selectedPiece=null;}renderCapturedPieces();updatePlayerTurnDisplay();}
    function handleSquareClick(event){if(isGameOver||isAiThinking||(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE&&!isAiThinking))return;const clickedSq=event.target.closest('.square');if(!clickedSq)return;const toR=parseInt(clickedSq.dataset.row);const toC=parseInt(clickedSq.dataset.col);if(selectedPieceForDrop){const pieceToDropKey=selectedPieceForDrop.type;if(board[toR][toC]){if(board[toR][toC].player===currentPlayer){selectedPiece={piece:board[toR][toC],fromRow:toR,fromCol:toC};selectedPieceForDrop=null;showValidMoveHighlights(selectedPiece.piece,selectedPiece.fromRow,selectedPiece.fromCol);renderCapturedPieces();updatePlayerTurnDisplay();console.log(`Switched to move mode. Selected ${PIECES[selectedPiece.piece.type]}`);}else{console.log("Cannot drop onto an occupied square.");}return;}if(isValidDrop(pieceToDropKey,toR,toC,currentPlayer,board)){const tempBoard=deepCopyBoard(board);tempBoard[toR][toC]={type:pieceToDropKey,player:currentPlayer,promoted:false};if(isInCheck(currentPlayer,tempBoard)){console.log("Illegal drop: cannot put own king in check.");gameStatusMessage="Illegal: Puts King in Check";updatePlayerTurnDisplay();setTimeout(()=>{gameStatusMessage="";updatePlayerTurnDisplay();},2000);return;}board[toR][toC]=tempBoard[toR][toC];const hand=currentPlayer===PLAYER_SENTE?senteCapturedPieces:goteCapturedPieces;const idx=hand.findIndex(p=>p.type===pieceToDropKey);if(idx>-1)hand.splice(idx,1);console.log(`${currentPlayer} dropped ${PIECES[pieceToDropKey]} at (${toR},${toC})`);selectedPieceForDrop=null;clearAllValidMoveHighlights();switchPlayerAndCheckGameEnd();}else{console.log(`Invalid drop for ${PIECES[pieceToDropKey]} at (${toR},${toC})`);}}else if(selectedPiece){const{piece,fromRow,fromCol}=selectedPiece;if(fromRow===toR&&fromCol===toC){selectedPiece=null;clearAllValidMoveHighlights();console.log("Deselected.");return;}const targetPiece=board[toR][toC];if(targetPiece&&targetPiece.player===currentPlayer){selectedPiece={piece:targetPiece,fromRow:toR,fromCol:toC};showValidMoveHighlights(selectedPiece.piece,selectedPiece.fromRow,selectedPiece.fromCol);console.log(`Reselected: ${PIECES[targetPiece.type]}`);return;}const validMoves=getValidMoves(piece,fromRow,fromCol,board);if(validMoves.some(([r,c])=>r===toR&&c===toC)){const tempBoard=deepCopyBoard(board);let pieceToMoveCopy={...piece};if(targetPiece&&targetPiece.player!==currentPlayer){}tempBoard[toR][toC]=pieceToMoveCopy;tempBoard[fromRow][fromCol]=null;let potentialPromotion=false;if(canPromote(pieceToMoveCopy,toR,fromRow,currentPlayer)){if(mustPromote(pieceToMoveCopy,toR,currentPlayer)||window.confirm(`Promote ${PIECES[pieceToMoveCopy.type]} to ${PIECES[PROMOTION_MAP[pieceToMoveCopy.type]] || PIECES[pieceToMoveCopy.type]}?`)){potentialPromotion=true;pieceToMoveCopy.promoted=true;}}tempBoard[toR][toC]=pieceToMoveCopy;if(isInCheck(currentPlayer,tempBoard)){console.log("Illegal move: cannot put own king in check.");gameStatusMessage="Illegal: Puts King in Check";updatePlayerTurnDisplay();setTimeout(()=>{gameStatusMessage="";updatePlayerTurnDisplay();},2000);return;}let actualMovedPiece={...piece};if(targetPiece&&targetPiece.player!==currentPlayer){const captured=targetPiece;let unpromotedTypeKey=UNPROMOTED_MAP[captured.type]||captured.type;(currentPlayer===PLAYER_SENTE?senteCapturedPieces:goteCapturedPieces).push({type:unpromotedTypeKey,originalPlayer:captured.player});console.log(`${currentPlayer} captured ${PIECES[captured.type]}`);}board[fromRow][fromCol]=null;if(canPromote(actualMovedPiece,toR,fromRow,currentPlayer)){if(mustPromote(actualMovedPiece,toR,currentPlayer)||pieceToMoveCopy.promoted){actualMovedPiece.promoted=true;console.log(`Piece ${PIECES[piece.type]} promoted.`);}}board[toR][toC]=actualMovedPiece;console.log(`${currentPlayer} moved ${PIECES[piece.type]} from (${fromRow},${fromCol}) to (${toR},${toC})`);selectedPiece=null;clearAllValidMoveHighlights();switchPlayerAndCheckGameEnd();}else{console.log(`Invalid move for ${PIECES[piece.type]}`);}}else{const pieceOnSq=board[toR][toC];if(pieceOnSq&&pieceOnSq.player===currentPlayer){selectedPiece={piece:pieceOnSq,fromRow:toR,fromCol:toC};selectedPieceForDrop=null;showValidMoveHighlights(selectedPiece.piece,selectedPiece.fromRow,selectedPiece.fromCol);console.log(`Selected: ${PIECES[pieceOnSq.type]} at (${toR}, ${toC})`);renderCapturedPieces();updatePlayerTurnDisplay();}else if(pieceOnSq){console.log("Opponent's piece.");}else{clearAllValidMoveHighlights(); console.log("Empty square.");}}}
    function switchPlayerAndCheckGameEnd(){const prevPlayer=currentPlayer;currentPlayer=currentPlayer===PLAYER_SENTE?PLAYER_GOTE:PLAYER_SENTE;gameStatusMessage="";if(isCheckmate(currentPlayer,board,senteCapturedPieces,goteCapturedPieces)){gameStatusMessage=`Checkmate! ${prevPlayer} wins!`;isGameOver=true;console.log(gameStatusMessage);}else if(isInCheck(currentPlayer,board)){gameStatusMessage="Check!";console.log("Player is in Check!");}clearAllValidMoveHighlights(); renderBoard();if(isSinglePlayerMode&&currentPlayer===PLAYER_GOTE&&!isGameOver){makeAiMove();}}
    function addSquareClickListeners(){const squares=document.querySelectorAll('.square');squares.forEach(sq=>{sq.removeEventListener('click',handleSquareClick);sq.addEventListener('click',handleSquareClick);});}

    // Event Listeners for Controls
    newGameButton.addEventListener('click',startGame);
    singlePlayerCheckbox.addEventListener('change',startGame);
    highlightModeCheckbox.addEventListener('change', () => {
        isHighlightModeEnabled = highlightModeCheckbox.checked;
        if (!isHighlightModeEnabled) {
            clearAllValidMoveHighlights();
        } else {
            // If a piece is already selected, show its highlights
            if (selectedPiece) {
                showValidMoveHighlights(selectedPiece.piece, selectedPiece.fromRow, selectedPiece.fromCol);
            }
        }
    });

    function startGame(){console.log("New Game started");initializeBoard();}
    // Initial call to set mode from checkbox state
    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    isHighlightModeEnabled = highlightModeCheckbox.checked;
    startGame();
});
console.log("Shogi game script (with highlight toggle logic) loaded.");
