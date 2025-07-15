import { assert } from './node_modules/chai/chai.js';

import {
    initializeBoard,
    getPieceMoves,
    isKingInCheck,
    getLegalMoves,
    setTurn,
    movePiece
} from './chess_logic.js';

describe('Chess Logic', () => {
    let board;
    const setBoard = (newBoard) => {
        board = newBoard;
    };

    beforeEach(() => {
        board = initializeBoard();
    });

    it('should test pawn moves', () => {
        let moves = getPieceMoves(6, 4, board);
        assert.isTrue(moves.some(m => m.r === 5 && m.c === 4), "Pawn should move 1 step forward");
        assert.isTrue(moves.some(m => m.r === 4 && m.c === 4), "Pawn should move 2 steps forward from start");

        setBoard([
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', 'p', '', '', '', '', ''],
            ['', 'P', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ]);
        setTurn(true);
        let whitePawnMoves = getPieceMoves(4, 1, board);
        assert.isTrue(whitePawnMoves.some(m => m.r === 3 && m.c === 2), "White pawn should capture black pawn");
        
        setTurn(false);
        setBoard([
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', 'p', '', '', '', '', ''],
            ['', 'P', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ]);
        let blackPawnMoves = getPieceMoves(3, 2, board);
        assert.isTrue(blackPawnMoves.some(m => m.r === 4 && m.c === 1), "Black pawn should capture white pawn");
    });

    it('should test rook moves', () => {
        setBoard([
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', 'R', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ]);
        let moves = getPieceMoves(3, 3, board);
        assert.equal(moves.length, 14, "Rook should have 14 possible moves on an empty board");
    });

    it('should test bishop moves', () => {
        setBoard([
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', 'B', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ]);
        let moves = getPieceMoves(3, 3, board);
        assert.equal(moves.length, 13, "Bishop should have 13 possible moves on an empty board");
    });

    it('should test knight moves', () => {
        let moves = getPieceMoves(7, 6, board);
        assert.isTrue(moves.some(m => m.r === 5 && m.c === 5), "Knight move 1");
        assert.isTrue(moves.some(m => m.r === 5 && m.c === 7), "Knight move 2");
    });

    it('should test queen moves', () => {
        setBoard([
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', 'Q', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ]);
        let moves = getPieceMoves(3, 3, board);
        assert.equal(moves.length, 27, "Queen should have 27 possible moves on an empty board");
    });

    it('should test king moves', () => {
        setBoard([
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', 'K', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ]);
        let moves = getPieceMoves(3, 3, board, true); // ignore castling
        assert.equal(moves.length, 8, "King should have 8 possible moves on an empty board");
    });

    it('should test en passant', () => {
        setBoard([
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', 'P', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ]);
        board = movePiece(board, 6, 0, 4, 0); // White pawn moves two steps
        board = movePiece(board, 1, 1, 3, 1); // Black pawn moves two steps
        board = movePiece(board, 4, 0, 3, 1); // White pawn captures en passant
        let moves = getLegalMoves(board, 3, 1);
        assert.isTrue(moves.some(m => m.r === 2 && m.c === 0 && m.enPassantCapture), "En passant should be possible");
    });

    it('should detect check', () => {
        setBoard([
            ['k', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', 'R', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['K', '', '', '', '', '', '', ''],
        ]);
        assert.isTrue(isKingInCheck(false, board), "Black king should be in check");
        assert.isFalse(isKingInCheck(true, board), "White king should not be in check");
    });

    it('should test castling', () => {
        setBoard([
            ['r', '', '', '', 'k', '', '', 'r'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['R', '', '', '', 'K', '', '', 'R'],
        ]);
        let moves = getLegalMoves(board, 7, 4);
        assert.isTrue(moves.some(m => m.c === 6), "White king should be able to castle kingside");
        assert.isTrue(moves.some(m => m.c === 2), "White king should be able to castle queenside");

        setTurn(false);
        moves = getLegalMoves(board, 0, 4);
        assert.isTrue(moves.some(m => m.c === 6), "Black king should be able to castle kingside");
        assert.isTrue(moves.some(m => m.c === 2), "Black king should be able to castle queenside");
    });
});
