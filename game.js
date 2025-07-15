import * as UI from './ui.js?v=1752581823';
import * as Logic from './chess_logic.js?v=1752581823';
import { getComputerMove as getStockfishMove } from './stockfish.js?v=1752581823';
import { getRandomMove } from './simple_ai.js?v=1752581823';

const skillLevelInput = document.getElementById('skill-level');
const newGameBtn = document.getElementById('new-game-btn');

function getRandomComputerMove() {
    const isWhite = Logic.isWhiteTurn;
    return getRandomMove(gameState.board, isWhite);
}

let gameState = {
    board: [],
    playerColor: 'white',
    isComputerTurn: false,
    selectedPiece: null,
    possibleMoves: []
};

function startNewGame() {
    console.log("===== ВЕРСИЯ 1752581823 - ЗАПУСК НОВОЙ ИГРЫ =====");
    
    // Сбросим игровое состояние
    gameState.board = Logic.initializeBoard();
    gameState.isComputerTurn = false;
    gameState.selectedPiece = null;
    gameState.possibleMoves = [];
    
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

function handlePlayerMove(fromRow, fromCol, toRow, toCol) {
    console.log("👤 === НАЧАЛО ХОДА ИГРОКА ===");
    const piece = gameState.board[fromRow][fromCol];
    console.log("👤 Игрок делает ход:", piece, "from", fromRow, fromCol, "to", toRow, toCol);
    console.log("📋 Доска ПЕРЕД ходом игрока:", JSON.stringify(gameState.board));
    
    let promotionPiece = null;
    if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
        const choice = prompt("Promote to (Q, R, B, N):", "Q") || "Q";
        promotionPiece = Logic.isWhiteTurn ? choice.toUpperCase() : choice.toLowerCase();
    }

    const oldBoard = JSON.stringify(gameState.board);
    gameState.board = Logic.movePiece(gameState.board, fromRow, fromCol, toRow, toCol, promotionPiece);
    const newBoard = JSON.stringify(gameState.board);
    
    console.log("📋 Доска ПОСЛЕ хода игрока:", newBoard);
    console.log("🔄 Доска изменилась?", oldBoard !== newBoard);
    console.log("🎯 Теперь ходят:", Logic.isWhiteTurn ? "белые" : "черные");
    
    UI.createBoard(gameState.board, gameState.playerColor, gameState.isComputerTurn);
    updateStatus();

    console.log("👤 === КОНЕЦ ХОДА ИГРОКА ===");
    if (!Logic.isCheckmate(Logic.isWhiteTurn, gameState.board) && !Logic.isThreefoldRepetition(gameState.board)) {
        setTimeout(() => makeComputerMove(), 500); // Небольшая задержка для наглядности
    }
}

async function makeComputerMove() {
    console.log("🤖 === НАЧАЛО ХОДА КОМПЬЮТЕРА ===");
    console.log("🎯 Цвет игрока:", gameState.playerColor);
    console.log("🎯 Сейчас ходят:", Logic.isWhiteTurn ? "белые" : "черные");
    
    // Проверяем, действительно ли сейчас очередь компьютера
    const isComputersTurn = (gameState.playerColor === 'black' && Logic.isWhiteTurn) || 
                           (gameState.playerColor === 'white' && !Logic.isWhiteTurn);
    
    console.log("🎯 Очередь компьютера?", isComputersTurn);
    
    if (!isComputersTurn) {
        console.log("❌ Не очередь компьютера, пропускаем ход");
        return;
    }
    
    console.log("📋 Доска ПЕРЕД ходом компьютера:", JSON.stringify(gameState.board));
    
    gameState.isComputerTurn = true;
    updateStatus();
    
    const depth = parseInt(skillLevelInput.value, 10);
    const fen = getFen();
    console.log("📨 Отправка FEN в Lichess:", fen);
    const move = await getStockfishMove(fen, depth, gameState.board);
    console.log("📥 Получен ход от Lichess:", move);

    if (move && move.fromRow !== undefined && move.fromCol !== undefined && move.toRow !== undefined && move.toCol !== undefined) {
        console.log("✅ Компьютер делает ход:", move);
        const oldBoard = JSON.stringify(gameState.board);
        gameState.board = Logic.movePiece(gameState.board, move.fromRow, move.fromCol, move.toRow, move.toCol);
        const newBoard = JSON.stringify(gameState.board);
        console.log("📋 Доска ПОСЛЕ хода компьютера:", newBoard);
        console.log("🔄 Доска изменилась?", oldBoard !== newBoard);
        console.log("🎯 Теперь ходят:", Logic.isWhiteTurn ? "белые" : "черные");
    } else {
        console.error("❌ Не удалось получить корректный ход от AI:", move);
        // Попробуем получить случайный ход как крайнюю меру
        console.log("🎲 Пробуем получить случайный ход от simple_ai.js");
        const isWhite = Logic.isWhiteTurn;
        const randomMove = getRandomMove(gameState.board, isWhite);
        if (randomMove) {
            console.log("🎲 Используем случайный ход от simple_ai:", randomMove);
            const oldBoard = JSON.stringify(gameState.board);
            gameState.board = Logic.movePiece(gameState.board, randomMove.fromRow, randomMove.fromCol, randomMove.toRow, randomMove.toCol);
            const newBoard = JSON.stringify(gameState.board);
            console.log("📋 Доска ПОСЛЕ случайного хода:", newBoard);
            console.log("🔄 Доска изменилась?", oldBoard !== newBoard);
        } else {
            console.error("❌ Не удалось найти никакого хода для компьютера");
        }
    }
    
    gameState.isComputerTurn = false;
    UI.createBoard(gameState.board, gameState.playerColor, gameState.isComputerTurn);
    updateStatus();
    console.log("🤖 === КОНЕЦ ХОДА КОМПЬЮТЕРА ===");
}

function updateStatus() {
    const isWhite = Logic.isWhiteTurn;
    let status = isWhite ? "Ход белых" : "Ход черных";
    if (Logic.isCheckmate(isWhite, gameState.board)) {
        status = isWhite ? "Черные победили - Мат!" : "Белые победили - Мат!";
    } else if (Logic.isThreefoldRepetition(gameState.board)) {
        status = "Ничья - Троекратное повтор��ние";
    } else if (Logic.isKingInCheck(isWhite, gameState.board)) {
        status += " - Шах!";
    }
    if(gameState.isComputerTurn) {
        status = "Компьютер думает...";
    }
    UI.updateStatus(status);
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
    fen += ` ${castling || '-'} - 0 1`;
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
