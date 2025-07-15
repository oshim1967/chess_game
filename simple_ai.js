import * as Logic from './chess_logic.js?v=1752586932';

export function getRandomMove(board, isWhite) {
    const allMoves = [];
    
    console.log("Ищем ходы для:", isWhite ? "белых" : "черных");
    
    // Собираем все возможные ходы для текущего игрока
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const pieceIsWhite = piece === piece.toUpperCase();
                if (pieceIsWhite === isWhite) {
                    const moves = Logic.getLegalMoves(board, row, col);
                    moves.forEach(move => {
                        allMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.r,
                            toCol: move.c
                        });
                    });
                }
            }
        }
    }
    
    console.log("Найдено ходов:", allMoves.length);
    
    // Выбираем случайный ход
    if (allMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * allMoves.length);
        const selectedMove = allMoves[randomIndex];
        console.log("Выбран случайный ход:", selectedMove);
        return selectedMove;
    }
    
    console.log("Нет доступных ходов!");
    return null;
}

// Таблицы позиционных бонусов для фигур
const positionTables = {
    'p': [ // Пешки
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [10,10, 20, 30, 30, 20, 10, 10],
        [50,50, 50, 50, 50, 50, 50, 50],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    'n': [ // Кони
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    'b': [ // Слоны
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    'r': [ // Ладьи
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5, 0,  0,  0,  0,  0,  0, -5],
        [-5, 0,  0,  0,  0,  0,  0, -5],
        [-5, 0,  0,  0,  0,  0,  0, -5],
        [-5, 0,  0,  0,  0,  0,  0, -5],
        [-5, 0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    'q': [ // Ферзь
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,   0,  5,  5,  5,  5,  0, -5],
        [0,    0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    'k': [ // Король
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ]
};

// Улучшенная оценка позиции
function evaluatePosition(board, isWhite) {
    const pieceValues = {
        'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
        'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
    };
    
    let score = 0;
    let whiteKingPos = null;
    let blackKingPos = null;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const pieceIsWhite = piece === piece.toUpperCase();
                const pieceType = piece.toLowerCase();
                
                // Материальная стоимость
                let value = pieceValues[pieceType];
                
                // Позиционный бонус
                if (positionTables[pieceType]) {
                    const tableRow = pieceIsWhite ? 7 - row : row;
                    value += positionTables[pieceType][tableRow][col];
                }
                
                // Контроль центра
                if ((row === 3 || row === 4) && (col === 3 || col === 4)) {
                    value += 10;
                }
                
                // Запоминаем позицию королей
                if (pieceType === 'k') {
                    if (pieceIsWhite) {
                        whiteKingPos = { row, col };
                    } else {
                        blackKingPos = { row, col };
                    }
                }
                
                score += pieceIsWhite ? value : -value;
            }
        }
    }
    
    // Безопасность короля
    if (whiteKingPos && blackKingPos) {
        // Штраф за короля в центре в миттельшпиле
        if (whiteKingPos.row > 1 && whiteKingPos.row < 6 && 
            whiteKingPos.col > 1 && whiteKingPos.col < 6) {
            score -= 50;
        }
        if (blackKingPos.row > 1 && blackKingPos.row < 6 && 
            blackKingPos.col > 1 && blackKingPos.col < 6) {
            score += 50;
        }
    }
    
    return isWhite ? score : -score;
}

// Улучшенный AI с лучшим анализом
export function getBestMove(board, isWhite, depth = 2) {
    const allMoves = [];
    
    // Собираем все возможные ходы
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const pieceIsWhite = piece === piece.toUpperCase();
                if (pieceIsWhite === isWhite) {
                    const moves = Logic.getLegalMoves(board, row, col);
                    moves.forEach(move => {
                        allMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.r,
                            toCol: move.c,
                            piece: piece
                        });
                    });
                }
            }
        }
    }
    
    if (allMoves.length === 0) return null;
    
    // Оцениваем каждый ход
    const moveScores = [];
    
    for (const move of allMoves) {
        // Делаем ход
        const newBoard = JSON.parse(JSON.stringify(board));
        const piece = newBoard[move.fromRow][move.fromCol];
        const capturedPiece = newBoard[move.toRow][move.toCol];
        newBoard[move.toRow][move.toCol] = piece;
        newBoard[move.fromRow][move.fromCol] = '';
        
        // Оцениваем позицию
        let score = evaluatePosition(newBoard, isWhite);
        
        // Дополнительные бонусы
        
        // Взятие фигур
        if (capturedPiece !== '') {
            const captureValues = {
                'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
                'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
            };
            score += captureValues[capturedPiece.toLowerCase()] * 10;
        }
        
        // Развитие фигур в дебюте
        if (piece.toLowerCase() === 'n' || piece.toLowerCase() === 'b') {
            if ((isWhite && move.fromRow === 7) || (!isWhite && move.fromRow === 0)) {
                score += 50; // Бонус за вывод фигуры
            }
        }
        
        // Рокировка
        if (piece.toLowerCase() === 'k' && Math.abs(move.fromCol - move.toCol) === 2) {
            score += 60; // Бонус за рокировку
        }
        
        // Контроль центра
        if ((move.toRow === 3 || move.toRow === 4) && (move.toCol === 3 || move.toCol === 4)) {
            score += 30;
        }
        
        // Избегаем повторяющихся ходов одной фигурой
        if (move.piece.toLowerCase() === 'r') {
            // Штраф за частое использование ладьи в начале игры
            score -= 20;
        }
        
        moveScores.push({ move, score });
    }
    
    // Сортируем по убыванию
    moveScores.sort((a, b) => b.score - a.score);
    
    // Выбираем из топ-3 ходов для разнообразия
    const topMoves = moveScores.slice(0, Math.min(3, moveScores.length));
    const randomTopMove = topMoves[Math.floor(Math.random() * topMoves.length)];
    
    console.log("AI выбрал ход:", randomTopMove.move, "с оценкой:", randomTopMove.score);
    
    return randomTopMove.move;
}