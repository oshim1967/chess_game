import * as UI from './ui.js?v=1752581823';
import * as Logic from './chess_logic.js?v=1752581823';
import { getComputerMove as getStockfishMove } from './stockfish.js?v=1752581823';
import { getRandomMove } from './simple_ai.js?v=1752581823';

const skillLevelInput = document.getElementById('skill-level');
const newGameBtn = document.getElementById('new-game-btn');

let gameState = {
    board: [],
    playerColor: 'white',
    isComputerTurn: false,
    selectedPiece: null,
    possibleMoves: [],
    positionHistory: [] // История позиций для троекратного повторения
};

function isThreefoldRepetition() {
    const currentFen = getFen().split(' ').slice(0, 4).join(' '); // Сравниваем только позицию, ход и рокировки
    const count = gameState.positionHistory.filter(fen => fen.split(' ').slice(0, 4).join(' ') === currentFen).length;
    return count >= 2; // Текущая позиция будет 3-й
}

function startNewGame() {
    console.log("===== ВЕРСИЯ 1752581823 - ЗАПУСК НОВОЙ ИГРЫ =====");
    
    // Сбросим игровое состояние
    gameState.board = Logic.initializeBoard();
    gameState.isComputerTurn = false;
    gameState.selectedPiece = null;
    gameState.possibleMoves = [];
    gameState.positionHistory = [getFen().split(' ').slice(0, 4).join(' ')]; // Сохраняем начальную позицию
    
    // Случайно выбираем цвет игрока
    const randomValue = Math.random();
    gameState.playerColor = randomValue < 0.5 ? 'white' : 'black';
    
    console.log("🎯 НОВАЯ ИГРА. Случайное значение:", randomValue);
    console.log("🎯 Игрок играет:", gameState.playerColor);
    console.log("🤖 Компьютер играет:", gameState.playerColor === 'white' ? 'black' : 'white');
    console.log("📊 Уровень сложности:", skillLevelInput.value);
    console.log("📋 Состояние доски после инициализации:", gameState.board);
    
    UI.createBoard(gameState.board, gameState.playerColor, gameState.isComputerTurn);
    updateStatus();

    // Компьютер ходит первым, если игрок играет черными (компьютер играет белыми)
    if (gameState.playerColor === 'black') {
        console.log("Компьютер ходит первым (белыми)");
        setTimeout(() => makeComputerMove(), 1000);
    } else {
        console.log("Игрок ходит первым (белыми)");
    }
}

function handleSquareClick(row, col) {
    if (gameState.isComputerTurn) {
        console.log("❌ Клик заблокирован: сейчас ходит компьютер");
        return;
    }
    
    const isPlayerTurn = (gameState.playerColor === 'white' && Logic.isWhiteTurn) || 
                         (gameState.playerColor === 'black' && !Logic.isWhiteTurn);

    console.log("🎯 Клик по клетке:", row, col);
    console.log("🎯 Цвет игрока:", gameState.playerColor);
    console.log("🎯 Сейчас ходят:", Logic.isWhiteTurn ? "белые" : "черные");
    console.log("🎯 Очередь игрока?", isPlayerTurn);

    if (!isPlayerTurn) {
        console.log("❌ Клик заблокирован: не очередь игрока");
        return;
    }

    if (gameState.selectedPiece) {
        const isValidMove = gameState.possibleMoves.some(m => m.r === row && m.c === col);
        if (isValidMove) {
            handlePlayerMove(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col);
        }
        gameState.selectedPiece = null;
        gameState.possibleMoves = [];
        UI.removeHighlights();
    } else {
        const piece = gameState.board[row][col];
        const isOwnPiece = piece && ((gameState.playerColor === 'white' && piece === piece.toUpperCase()) || (gameState.playerColor === 'black' && piece === piece.toLowerCase()));
        
        console.log("🎯 Фигура на клетке:", piece);
        console.log("🎯 Своя фигура?", isOwnPiece);
        
        if (isOwnPiece) {
            gameState.selectedPiece = { piece, row, col };
            gameState.possibleMoves = Logic.getLegalMoves(gameState.board, row, col);
            UI.highlightPossibleMoves(gameState.possibleMoves);
            console.log("✅ Фигура выбрана:", piece, "возможные ходы:", gameState.possibleMoves.length);
        }
    }
}

function handleMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    gameState.board = Logic.movePiece(gameState.board, fromRow, fromCol, toRow, toCol, promotionPiece);
    gameState.positionHistory.push(getFen().split(' ').slice(0, 4).join(' '));
    
    UI.createBoard(gameState.board, gameState.playerColor, gameState.isComputerTurn);
    updateStatus();

    const isGameOver = updateStatus(); 
    return isGameOver;
}

function handlePlayerMove(fromRow, fromCol, toRow, toCol) {
    console.log("👤 === НАЧАЛО ХОДА ИГРОКА ===");
    const piece = gameState.board[fromRow][fromCol];
    console.log("👤 Игрок делает ход:", piece, "from", fromRow, fromCol, "to", toRow, toCol);
    
    let promotionPiece = null;
    if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
        const choice = prompt("Promote to (Q, R, B, N):", "Q") || "Q";
        promotionPiece = Logic.isWhiteTurn ? choice.toUpperCase() : choice.toLowerCase();
    }

    const isGameOver = handleMove(fromRow, fromCol, toRow, toCol, promotionPiece);
    
    console.log("👤 === КОНЕЦ ХОДА ИГРОКА ===");
    if (!isGameOver) {
        setTimeout(() => makeComputerMove(), 500);
    }
}

async function makeComputerMove() {
    console.log("🤖 === НАЧАЛО ХОДА КОМПЬЮТЕРА ===");
    const isComputersTurn = (gameState.playerColor === 'black' && Logic.isWhiteTurn) || 
                           (gameState.playerColor === 'white' && !Logic.isWhiteTurn);
    
    if (!isComputersTurn) {
        console.log("❌ Не очередь компьютера, пропускаем ход");
        return;
    }
    
    gameState.isComputerTurn = true;
    updateStatus();
    
    const depth = parseInt(skillLevelInput.value, 10);
    const fen = getFen();
    console.log("📨 Отправка FEN в Lichess:", fen);
    const move = await getStockfishMove(fen, depth, gameState.board);
    console.log("📥 Получен ход от Lichess:", move);

    if (move && move.fromRow !== undefined) {
        console.log("✅ Компьютер делает ход:", move);
        handleMove(move.fromRow, move.fromCol, move.toRow, move.toCol);
    } else {
        console.error("❌ Не удалось получить корректный ход от AI:", move);
        console.log("🎲 Пробуем получить случайный ход от simple_ai.js");
        const randomMove = getRandomMove(gameState.board, Logic.isWhiteTurn);
        if (randomMove) {
            console.log("🎲 Используем случайный ход от simple_ai:", randomMove);
            handleMove(randomMove.fromRow, randomMove.fromCol, randomMove.toRow, randomMove.toCol);
        } else {
            console.error("❌ Не удалось найти никакого хода для компьютера");
        }
    }
    
    gameState.isComputerTurn = false;
    updateStatus();
    console.log("🤖 === КОНЕЦ ХОДА КОМПЬЮТЕРА ===");
}

function updateStatus() {
    const isWhite = Logic.isWhiteTurn;
    let status = isWhite ? "Ход белых" : "Ход черных";
    let isGameOver = false;

    const hasMoves = Logic.hasLegalMoves(gameState.board, isWhite);

    if (Logic.isKingInCheck(isWhite, gameState.board)) {
        if (!hasMoves) {
            status = isWhite ? "Черные победили - Мат!" : "Белые победили - Мат!";
            isGameOver = true;
        } else {
            status += " - Шах!";
        }
    } else if (!hasMoves) {
        status = "Ничья - Пат!";
        isGameOver = true;
    } else if (isThreefoldRepetition()) {
        status = "Ничья - Троекратное повторение";
        isGameOver = true;
    }

    if(gameState.isComputerTurn && !isGameOver) {
        status = "Компьютер думает...";
    }
    UI.updateStatus(status);
    return isGameOver;
}

export function getFen() {
    let fen = '';
    for (let i = 0; i < 8; i++) {
        let empty = 0;
        for (let j = 0; j < 8; j++) {
            const piece = gameState.board[i][j];
            if (piece) {
                if (empty > 0) { fen += empty; empty = 0; }
                fen += piece;
            } else {
                empty++;
            }
        }
        if (empty > 0) fen += empty;
        if (i < 7) fen += '/';
    }
    fen += Logic.isWhiteTurn ? ' w' : ' b';
    let castling = '';
    if (Logic.castlingRights.w.k) castling += 'K';
    if (Logic.castlingRights.w.q) castling += 'Q';
    if (Logic.castlingRights.b.k) castling += 'k';
    if (Logic.castlingRights.b.q) castling += 'q';
    fen += ` ${castling || '-'}`;

    const enPassant = Logic.getEnPassantTarget();
    if (enPassant) {
        const col = String.fromCharCode('a'.charCodeAt(0) + enPassant.c);
        const row = 8 - enPassant.r;
        fen += ` ${col}${row}`;
    } else {
        fen += ' -';
    }

    fen += ` ${Logic.getHalfmoveClock()} ${Logic.getFullmoveNumber()}`;
    
    return fen;
}

function onPieceDragStart(row, col, event) {
    if (gameState.isComputerTurn) {
        console.log("❌ Drag заблокирован: сейчас ходит компьютер");
        return;
    }
    
    const isPlayerTurn = (gameState.playerColor === 'white' && Logic.isWhiteTurn) || 
                         (gameState.playerColor === 'black' && !Logic.isWhiteTurn);

    console.log("🎯 Drag начат:", row, col);
    console.log("🎯 Цвет игрока:", gameState.playerColor);
    console.log("🎯 Сейчас ходят:", Logic.isWhiteTurn ? "белые" : "черные");
    console.log("🎯 Очередь игрока?", isPlayerTurn);

    if (!isPlayerTurn) {
        console.log("❌ Drag заблокирован: не очередь игрока");
        return;
    }

    const piece = gameState.board[row][col];
    const isOwnPiece = piece && ((gameState.playerColor === 'white' && piece === piece.toUpperCase()) || (gameState.playerColor === 'black' && piece === piece.toLowerCase()));
    
    console.log("🎯 Фигура для drag:", piece);
    console.log("🎯 Своя фигура?", isOwnPiece);
    
    if (isOwnPiece) {
        gameState.selectedPiece = { piece, row, col };
        gameState.possibleMoves = Logic.getLegalMoves(gameState.board, row, col);
        UI.highlightPossibleMoves(gameState.possibleMoves);
        console.log("✅ Drag разрешен, возможные ходы:", gameState.possibleMoves.length);
    }
}

function onPieceDrop(targetSquare) {
    if (!targetSquare || !gameState.selectedPiece) {
        UI.createBoard(gameState.board, gameState.playerColor, gameState.isComputerTurn);
        return;
    };

    const toRow = parseInt(targetSquare.dataset.row);
    const toCol = parseInt(targetSquare.dataset.col);
    const isValidMove = gameState.possibleMoves.some(m => m.r === toRow && m.c === toCol);

    if (isValidMove) {
        handlePlayerMove(gameState.selectedPiece.row, gameState.selectedPiece.col, toRow, toCol);
    } else {
        UI.createBoard(gameState.board, gameState.playerColor, gameState.isComputerTurn);
    }
    
    gameState.selectedPiece = null;
    gameState.possibleMoves = [];
    UI.removeHighlights();
}


// Initial setup
skillLevelInput.addEventListener('input', () => UI.updateSkillLabel(skillLevelInput.value));
UI.updateSkillLabel(skillLevelInput.value);

newGameBtn.addEventListener('click', startNewGame);

UI.setOnSquareClick(handleSquareClick);
UI.setOnPieceDragStart(onPieceDragStart);
UI.setOnPieceDrop(onPieceDrop);

startNewGame();
