# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a chess game web application built with vanilla JavaScript, HTML, and CSS. The game features:
- Human vs computer gameplay using Stockfish API
- Drag-and-drop piece movement
- Full chess rules implementation including castling, en passant, and promotion
- Adjustable difficulty levels
- Russian language interface

## Development Commands

### Starting the Server
```bash
node server.js
```
The server runs on port 8893 and serves the game at `http://localhost:8893/`

### Running Tests
```bash
node chess.test.js
```
Tests use the Chai assertion library and cover chess logic functionality.

### Building and Testing Browser Environment
```bash
node build_tests.js
```
Builds tests for browser execution.

```bash
node run_browser_tests.js
```
Runs tests in a headless browser using Puppeteer.

## Code Architecture

### Core Modules (ES6 Modules)

**chess_logic.js** - Core chess engine
- `initializeBoard()` - Sets up initial chess position
- `movePiece()` - Executes moves and updates game state
- `getPieceMoves()` - Gets all possible moves for a piece
- `getLegalMoves()` - Filters moves to exclude those that leave king in check
- `isKingInCheck()` - Checks if king is under attack
- `isCheckmate()` - Determines if position is checkmate
- `isThreefoldRepetition()` - Detects draw by repetition
- Handles special rules: castling, en passant, promotion

**game.js** - Main game controller
- Manages game state and player interactions
- Handles computer moves via Stockfish API
- Processes user input (clicks and drag-and-drop)
- Generates FEN notation for Stockfish communication
- Controls game flow and turn management

**ui.js** - User interface management
- `createBoard()` - Renders the chess board
- `highlightPossibleMoves()` - Shows legal moves visually
- Handles drag-and-drop interactions with pointer events
- Manages settings panel and game status display
- Converts pieces to Unicode symbols for display

**stockfish.js** - AI integration
- `getComputerMove()` - Communicates with Stockfish API
- Converts between FEN notation and internal move format
- Handles API errors gracefully

### Key Files

**chess.html** - Main HTML interface with inline CSS grid styling
**chess_style.css** - Comprehensive styling for the chess board and UI
**server.js** - Express server that serves static files and chess.html as root
**package.json** - Dependencies include Express, Puppeteer, esbuild, and Chai

### Game State Management

The game maintains state through:
- `gameState` object in game.js containing board position, player color, selected piece, and turn info
- Global variables in chess_logic.js for turn tracking, castling rights, en passant target
- Position history for threefold repetition detection

### Testing Strategy

Tests are written for chess_logic.js and cover:
- Individual piece movement patterns
- Special rules (castling, en passant, promotion)
- Check detection and legal move filtering
- Game ending conditions

Tests can run in both Node.js and browser environments using Chai assertions.

## Development Notes

### API Integration
- Uses external Stockfish API at `https://stockfish.online/api/stockfish.php`
- Communicates via FEN notation
- Gracefully handles API failures

### Browser Compatibility
- Uses modern JavaScript features (ES6 modules, async/await)
- Requires modern browser support for pointer events and CSS grid
- Chess pieces displayed using Unicode symbols

### Internationalization
- Interface is primarily in Russian
- Piece notation uses standard algebraic notation
- Status messages and labels in Russian

### Performance Considerations
- Efficient board representation using 2D arrays
- Legal move calculation filters out illegal moves by simulating king safety
- Drag-and-drop uses cloned elements to avoid DOM manipulation during drag