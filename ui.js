const boardContainer = document.getElementById('board-container');
const statusText = document.getElementById('status-text');
const skillLabel = document.getElementById('skill-label');
const animationStyleSelect = document.getElementById('animation-style');
const settingsBtn = document.getElementById('settings-btn');
const statusPanel = document.getElementById('status-panel');
const panelOverlay = document.getElementById('panel-overlay');
const closePanelBtn = document.getElementById('close-panel-btn');

const pieceToUnicode = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
};

let onSquareClickCallback = () => {};
let onPieceDragStartCallback = () => {};
let onPieceDropCallback = () => {};

function getSkillTitle(depth) {
    if (depth <= 3) return '3-й разряд';
    if (depth <= 6) return '2-й разряд';
    if (depth <= 10) return '1-й разряд';
    if (depth <= 13) return 'Кандидат в мастера';
    if (depth <= 16) return 'Мастер';
    return 'Гроссмейстер';
}

export function updateSkillLabel(level) {
    skillLabel.textContent = 'Разряд: ' + getSkillTitle(level);
}

export function createBoard(board, playerColor, isComputerTurn) {
    boardContainer.innerHTML = '';
    document.querySelectorAll('body > .piece.dragging').forEach(el => el.remove());

    const fragment = document.createDocumentFragment();
    const rows = playerColor === 'white' 
        ? Array.from({ length: 8 }, (_, i) => i) 
        : Array.from({ length: 8 }, (_, i) => 7 - i);

    let squareCount = 0;
    for (const i of rows) {
        for (let j = 0; j < 8; j++) {
            squareCount++;
            const square = document.createElement('div');
            square.classList.add('square', (i + j) % 2 === 0 ? 'black' : 'white');
            square.dataset.row = i;
            square.dataset.col = j;
            square.addEventListener('click', () => onSquareClickCallback(i, j));

            const piece = board[i][j];
            if (piece && pieceToUnicode[piece]) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                // Добавляем класс для цвета фигуры
                if (piece === piece.toUpperCase()) {
                    pieceElement.classList.add('white-piece');
                } else {
                    pieceElement.classList.add('black-piece');
                }
                pieceElement.innerText = pieceToUnicode[piece];
                pieceElement.id = `piece-${i}-${j}`;
                attachPointerHandlers(pieceElement, i, j, isComputerTurn);
                square.appendChild(pieceElement);
            }
            fragment.appendChild(square);
        }
    }
    boardContainer.appendChild(fragment);
    console.log(`Создано ${squareCount} клеток.`);
}

function attachPointerHandlers(pieceElement, row, col, isComputerTurn) {
    pieceElement.onpointerdown = (e) => {
        if (isComputerTurn) return;
        
        onPieceDragStartCallback(row, col, e);

        pieceElement.setPointerCapture(e.pointerId);
        pieceElement.classList.add('dragging');
        
        // Make the original piece invisible while dragging
        pieceElement.style.opacity = '0';

        const clonedPiece = pieceElement.cloneNode(true);
        clonedPiece.style.opacity = '1';
        clonedPiece.style.position = 'absolute';
        clonedPiece.style.pointerEvents = 'none';
        clonedPiece.style.zIndex = 1001;
        document.body.appendChild(clonedPiece);
        moveAt(e.pageX, e.pageY, clonedPiece);
        
        const onMove = (event) => moveAt(event.pageX, event.pageY, clonedPiece);
        document.addEventListener('pointermove', onMove);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        pieceElement.onpointerup = (event) => {
            pieceElement.releasePointerCapture(e.pointerId);
            document.removeEventListener('pointermove', onMove);
            document.body.removeChild(clonedPiece);
            document.body.style.overflow = ''; // Restore scrolling
            pieceElement.style.opacity = '1';
            const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
            const targetSquare = elemBelow ? elemBelow.closest('.square') : null;
            console.log('Dropped on:', targetSquare);
            onPieceDropCallback(targetSquare);
            pieceElement.classList.remove('dragging');
        };
        e.preventDefault();
    };
}

function moveAt(pageX, pageY, pieceElement) {
    pieceElement.style.left = pageX - pieceElement.offsetWidth / 2 + 'px';
    pieceElement.style.top = pageY - pieceElement.offsetHeight / 2 + 'px';
}

export function highlightPossibleMoves(moves) {
    removeHighlights();
    moves.forEach(move => {
        const targetSquare = document.querySelector(`[data-row='${move.r}'][data-col='${move.c}']`);
        if (targetSquare) {
            const highlight = document.createElement('div');
            highlight.classList.add('highlight');
            targetSquare.appendChild(highlight);
        }
    });
}

export function removeHighlights() {
    document.querySelectorAll('.highlight').forEach(h => h.remove());
}

export function updateStatus(status) {
    statusText.textContent = status;
}

export function setOnSquareClick(callback) {
    onSquareClickCallback = callback;
}

export function setOnPieceDragStart(callback) {
    onPieceDragStartCallback = callback;
}

export function setOnPieceDrop(callback) {
    onPieceDropCallback = callback;
}

export function getAnimationSpeed() {
    return animationStyleSelect ? animationStyleSelect.value : 'slide';
}

function openPanel() {
    statusPanel.classList.add('panel-visible');
    panelOverlay.classList.add('active');
    settingsBtn.classList.add('active');
}

function closePanel() {
    statusPanel.classList.remove('panel-visible');
    panelOverlay.classList.remove('active');
    settingsBtn.classList.remove('active');
}

settingsBtn.addEventListener('click', () => {
    statusPanel.classList.toggle('panel-visible');
    panelOverlay.classList.toggle('active');
    settingsBtn.classList.toggle('active');
});

closePanelBtn.addEventListener('click', closePanel);
panelOverlay.addEventListener('click', closePanel);
