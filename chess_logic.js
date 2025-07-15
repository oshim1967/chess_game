export let isWhiteTurn = true;
let enPassantTarget = null;
export let castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
let positionHistory = [];

function boardToString(boardState) {
    return boardState.map(row => row.join(',')).join('|');
}

export function isThreefoldRepetition(board) {
    const currentPosition = boardToString(board);
    const count = positionHistory.filter(pos => pos === currentPosition).length;
    return count >= 2;
}

export function initializeBoard() {
    const newBoard = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ];
    isWhiteTurn = true;
    enPassantTarget = null;
    castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
    positionHistory = [boardToString(newBoard)];
    return newBoard;
}

export function movePiece(board, fromRow, fromCol, toRow, toCol, promotionPiece = null) {
    const newBoard = JSON.parse(JSON.stringify(board));
    const piece = newBoard[fromRow][fromCol];

    // En Passant
    if (piece.toLowerCase() === 'p' && enPassantTarget && toRow === enPassantTarget.r && toCol === enPassantTarget.c) {
        const isWhitePiece = piece === piece.toUpperCase();
        const capturedPawnRow = isWhitePiece ? toRow + 1 : toRow - 1;
        newBoard[capturedPawnRow][toCol] = '';
    }
    
    // Move piece
    const capturedPiece = newBoard[toRow][toCol];
    console.log(`🔄 Перемещение: ${piece} с ${fromRow},${fromCol} на ${toRow},${toCol}`);
    if (capturedPiece) {
        console.log(`🎯 Захватываем фигуру: ${capturedPiece}`);
    }
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = '';

    // Promotion - только для пешек
    if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
        const isWhitePiece = piece === piece.toUpperCase();
        newBoard[toRow][toCol] = promotionPiece || (isWhitePiece ? 'Q' : 'q');
    }

    // Castling
    if (piece.toLowerCase() === 'k') {
        const isWhitePiece = piece === piece.toUpperCase();
        if (isWhitePiece) {
            castlingRights.w.k = false;
            castlingRights.w.q = false;
        } else {
            castlingRights.b.k = false;
            castlingRights.b.q = false;
        }
        // Move rook if castling
        if (Math.abs(fromCol - toCol) === 2) {
            const rookCol = toCol === 6 ? 7 : 0;
            const newRookCol = toCol === 6 ? 5 : 3;
            const rookRow = fromRow; // Ладья всегда на том же ряду, что и король
            console.log(`🏰 Рокировка: перемещаем ладью с ${rookRow},${rookCol} на ${rookRow},${newRookCol}`);
            console.log(`🏰 Ладья до рокировки:`, newBoard[rookRow][rookCol]);
            newBoard[rookRow][newRookCol] = newBoard[rookRow][rookCol];
            newBoard[rookRow][rookCol] = '';
            console.log(`🏰 Ладья после рокировки:`, newBoard[rookRow][newRookCol]);
        }
    }
    if (piece.toLowerCase() === 'r') {
        const isWhitePiece = piece === piece.toUpperCase();
        if (fromCol === 0) {
            if (isWhitePiece) castlingRights.w.q = false; else castlingRights.b.q = false;
        } else if (fromCol === 7) {
            if (isWhitePiece) castlingRights.w.k = false; else castlingRights.b.k = false;
        }
    }

    // Set new en passant target
    if (piece.toLowerCase() === 'p' && Math.abs(fromRow - toRow) === 2) {
        enPassantTarget = { r: (fromRow + toRow) / 2, c: fromCol };
    } else {
        enPassantTarget = null;
    }
    
    // Switch turn
    isWhiteTurn = !isWhiteTurn;
    
    positionHistory.push(boardToString(newBoard));
    
    return newBoard;
}

export function getPieceMoves(row, col, boardState, ignoreCastling = false) {
    const piece = boardState[row][col];
    if (!piece) return [];
    const moves = [];
    const isWhite = piece === piece.toUpperCase();

    if (piece.toLowerCase() === 'p') {
        const dir = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        if (boardState[row + dir] && boardState[row + dir][col] === '') {
            moves.push({ r: row + dir, c: col });
            if (row === startRow && boardState[row + 2 * dir][col] === '') {
                moves.push({ r: row + 2 * dir, c: col, enPassant: true });
            }
        }
        [-1, 1].forEach(side => {
            const newCol = col + side;
            if (newCol >= 0 && newCol < 8) {
                const targetRow = row + dir;
                if (targetRow >= 0 && targetRow < 8) {
                    // Capture
                    if (boardState[targetRow][newCol] && boardState[targetRow][newCol] !== '' && (isWhite !== (boardState[targetRow][newCol] === boardState[targetRow][newCol].toUpperCase()))) {
                        moves.push({ r: targetRow, c: newCol });
                    }
                    // En Passant
                    if (enPassantTarget && enPassantTarget.r === targetRow && enPassantTarget.c === newCol) {
                        moves.push({ r: targetRow, c: newCol, enPassantCapture: true });
                    }
                }
            }
        });
    } else if (['r', 'b', 'q'].includes(piece.toLowerCase())) {
        const directions = piece.toLowerCase() === 'r'
            ? [[0, 1], [0, -1], [1, 0], [-1, 0]]
            : piece.toLowerCase() === 'b'
            ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
            : [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const r = row + dr * i, c = col + dc * i;
                if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                if (boardState[r][c] === '') {
                    moves.push({ r, c });
                } else {
                    if (isWhite !== (boardState[r][c] === boardState[r][c].toUpperCase())) moves.push({ r, c });
                    break;
                }
            }
        });
    } else if (piece.toLowerCase() === 'n') {
        [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (boardState[r][c] === '' || isWhite !== (boardState[r][c] === boardState[r][c].toUpperCase())) {
                    moves.push({ r, c });
                }
            }
        });
    } else if (piece.toLowerCase() === 'k') {
        [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (boardState[r][c] === '' || isWhite !== (boardState[r][c] === boardState[r][c].toUpperCase())) {
                    moves.push({ r, c });
                }
            }
        });

        // Castling moves
        if (!ignoreCastling) {
            const rights = isWhite ? castlingRights.w : castlingRights.b;
            if (rights.k && boardState[row][col+1] === '' && boardState[row][col+2] === '' && !isPositionUnderAttack(row, col, !isWhite, boardState) && !isPositionUnderAttack(row, col+1, !isWhite, boardState) && !isPositionUnderAttack(row, col+2, !isWhite, boardState)) {
                moves.push({r: row, c: col + 2});
            }
            if (rights.q && boardState[row][col-1] === '' && boardState[row][col-2] === '' && boardState[row][col-3] === '' && !isPositionUnderAttack(row, col, !isWhite, boardState) && !isPositionUnderAttack(row, col-1, !isWhite, boardState) && !isPositionUnderAttack(row, col-2, !isWhite, boardState)) {
                moves.push({r: row, c: col - 2});
            }
        }
    }

    return moves;
}

function isPositionUnderAttack(r, c, byWhite, boardState) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = boardState[row][col];
            if (piece && (byWhite === (piece === piece.toUpperCase()))) {
                if (piece.toLowerCase() === 'k') {
                    if (Math.abs(row - r) <= 1 && Math.abs(col - c) <= 1) {
                        return true;
                    }
                } else {
                    const moves = getPieceMoves(row, col, boardState, true);
                    if (moves.some(m => m.r === r && m.c === c)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

export function isKingInCheck(isWhite, boardState) {
    const king = isWhite ? 'K' : 'k';
    let kingPos = { r: -1, c: -1 };
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] === king) {
                kingPos = { r, c };
                break;
            }
        }
    }
    if (kingPos.r === -1) return false; // No king on the board

    return isPositionUnderAttack(kingPos.r, kingPos.c, !isWhite, boardState);
}

export function getLegalMoves(board, row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    const isWhite = piece === piece.toUpperCase();
    
    return getPieceMoves(row, col, board).filter(move => {
        const tempBoard = JSON.parse(JSON.stringify(board));
        tempBoard[move.r][move.c] = tempBoard[row][col];
        tempBoard[row][col] = '';
        return !isKingInCheck(isWhite, tempBoard);
    });
}

export function isCheckmate(isWhite, boardState) {
    if (!isKingInCheck(isWhite, boardState)) {
        return false; // Not in check, so cannot be checkmate
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = boardState[r][c];
            if (piece && (isWhite === (piece === piece.toUpperCase()))) {
                if (getLegalMoves(boardState, r, c).length > 0) {
                    return false; // Found a legal move, so not checkmate
                }
            }
        }
    }
    return true; // In check and no legal moves
}

// Functions for testing
export function setTurn(turn) {
    isWhiteTurn = turn;
}

export function setEnPassantTarget(target) {
    enPassantTarget = target;
}

export function setCastlingRights(rights) {
    castlingRights = rights;
}
