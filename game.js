/**
 * Tic-Tac-Toe Game
 * A modern implementation with AI opponents and multiplayer modes
 */

// ========================================
// Game State Management
// ========================================
class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameMode = null; // 'single' or 'multi'
        this.difficulty = null; // 'easy', 'medium', 'hard'
        this.scores = {
            player1: 0,
            player2: 0,
            draws: 0
        };
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        this.init();
    }

    // ========================================
    // Initialization
    // ========================================
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadTheme();
        this.loadScores();
    }

    cacheDOM() {
        // Sections
        this.modeSelection = document.getElementById('modeSelection');
        this.difficultySelection = document.getElementById('difficultySelection');
        this.gameSection = document.getElementById('gameSection');
        
        // Mode & Difficulty
        this.modeCards = document.querySelectorAll('.mode-card');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.backToModeBtn = document.getElementById('backToMode');
        
        // Game Board
        this.gameBoard = document.getElementById('gameBoard');
        this.cells = document.querySelectorAll('.cell');
        
        // Score Display
        this.player1ScoreEl = document.getElementById('player1Score');
        this.player2ScoreEl = document.getElementById('player2Score');
        this.drawsScoreEl = document.getElementById('drawsScore');
        this.player1NameEl = document.getElementById('player1Name');
        this.player2NameEl = document.getElementById('player2Name');
        
        // Turn Indicator
        this.turnIndicator = document.getElementById('turnIndicator');
        this.turnText = this.turnIndicator.querySelector('.turn-text');
        this.turnIcon = this.turnIndicator.querySelector('.turn-icon');
        
        // Controls
        this.restartBtn = document.getElementById('restartBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        
        // Modal
        this.winnerModal = document.getElementById('winnerModal');
        this.winnerIcon = document.getElementById('winnerIcon');
        this.winnerTitle = document.getElementById('winnerTitle');
        this.winnerMessage = document.getElementById('winnerMessage');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');
        
        // Theme
        this.themeToggle = document.getElementById('themeToggle');
    }

    bindEvents() {
        // Mode selection
        this.modeCards.forEach(card => {
            card.addEventListener('click', () => this.selectMode(card.dataset.mode));
        });

        // Difficulty selection
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectDifficulty(btn.dataset.difficulty));
        });

        // Back button
        this.backToModeBtn.addEventListener('click', () => this.showSection('mode'));

        // Game board
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
            cell.addEventListener('mouseenter', (e) => this.handleCellHover(e));
            cell.addEventListener('mouseleave', (e) => this.handleCellLeave(e));
        });

        // Game controls
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.newGameBtn.addEventListener('click', () => this.backToMenu());

        // Modal actions
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.backToMenuBtn.addEventListener('click', () => this.backToMenu());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // ========================================
    // Navigation & UI
    // ========================================
    showSection(section) {
        this.modeSelection.classList.add('hidden');
        this.difficultySelection.classList.add('hidden');
        this.gameSection.classList.add('hidden');

        switch(section) {
            case 'mode':
                this.modeSelection.classList.remove('hidden');
                break;
            case 'difficulty':
                this.difficultySelection.classList.remove('hidden');
                break;
            case 'game':
                this.gameSection.classList.remove('hidden');
                break;
        }
    }

    selectMode(mode) {
        this.gameMode = mode;
        if (mode === 'single') {
            this.showSection('difficulty');
        } else {
            this.startGame();
        }
    }

    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.startGame();
    }

    // ========================================
    // Game Logic
    // ========================================
    startGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.removeAttribute('data-preview');
        });

        if (this.gameMode === 'single') {
            this.player1NameEl.textContent = 'You';
            this.player2NameEl.textContent = 'AI';
        } else {
            this.player1NameEl.textContent = 'Player X';
            this.player2NameEl.textContent = 'Player O';
        }

        this.showSection('game');
        this.updateTurnIndicator();
        this.updateScoreDisplay();
    }

    handleCellClick(e) {
        const cell = e.currentTarget;
        const index = parseInt(cell.dataset.index);

        if (!this.gameActive || this.board[index]) return;
        if (this.gameMode === 'single' && this.currentPlayer === 'O') return;

        this.makeMove(index);
    }

    handleCellHover(e) {
        const cell = e.currentTarget;
        const index = parseInt(cell.dataset.index);
        
        if (!this.gameActive || this.board[index] || cell.classList.contains('occupied')) return;
        
        cell.dataset.preview = this.currentPlayer;
        cell.classList.add(`preview-${this.currentPlayer.toLowerCase()}`);
    }

    handleCellLeave(e) {
        const cell = e.currentTarget;
        cell.removeAttribute('data-preview');
        cell.classList.remove('preview-x', 'preview-o');
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add('occupied', 'marked', this.currentPlayer.toLowerCase());

        if (this.checkWin()) {
            this.handleWin();
            return;
        }

        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();

        if (this.gameMode === 'single' && this.currentPlayer === 'O') {
            this.gameBoard.classList.add('board-disabled');
            setTimeout(() => this.aiMove(), 500);
        }
    }

    checkWin() {
        return this.winningCombos.some(combo => {
            const [a, b, c] = combo;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== null);
    }

    getWinningCombo() {
        return this.winningCombos.find(combo => {
            const [a, b, c] = combo;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }

    handleWin() {
        this.gameActive = false;
        const winningCombo = this.getWinningCombo();
        
        winningCombo.forEach(index => {
            this.cells[index].classList.add('winner');
        });

        if (this.currentPlayer === 'X') {
            this.scores.player1++;
        } else {
            this.scores.player2++;
        }

        this.updateScoreDisplay();
        this.highlightActiveScore();

        setTimeout(() => {
            this.showWinModal(this.currentPlayer);
        }, 800);
    }

    handleDraw() {
        this.gameActive = false;
        this.scores.draws++;
        this.updateScoreDisplay();

        setTimeout(() => {
            this.showDrawModal();
        }, 500);
    }

    // ========================================
    // AI Implementation
    // ========================================
    aiMove() {
        if (!this.gameActive) return;

        let move;
        switch(this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }

        if (move !== null) {
            this.makeMove(move);
        }
        
        this.gameBoard.classList.remove('board-disabled');
    }

    getRandomMove() {
        const available = this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(index => index !== null);
        
        return available.length > 0 
            ? available[Math.floor(Math.random() * available.length)]
            : null;
    }

    getMediumMove() {
        // 70% chance of making the best move, 30% random
        if (Math.random() < 0.7) {
            return this.getBestMove();
        }
        return this.getRandomMove();
    }

    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        if (this.checkAIMatch('O')) return 10 - depth;
        if (this.checkAIMatch('X')) return depth - 10;
        if (board.every(cell => cell !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkAIMatch(player) {
        return this.winningCombos.some(combo => {
            const [a, b, c] = combo;
            return this.board[a] === player && 
                   this.board[b] === player && 
                   this.board[c] === player;
        });
    }

    // ========================================
    // UI Updates
    // ========================================
    updateTurnIndicator() {
        const playerName = this.currentPlayer === 'X' 
            ? (this.gameMode === 'single' ? 'Your' : "Player X's")
            : (this.gameMode === 'single' ? "AI's" : "Player O's");
        
        this.turnText.textContent = `${playerName} turn`;
        this.turnIcon.textContent = this.currentPlayer === 'X' ? '●' : '●';
        this.turnIcon.className = `turn-icon ${this.currentPlayer.toLowerCase()}`;
    }

    updateScoreDisplay() {
        this.player1ScoreEl.textContent = this.scores.player1;
        this.player2ScoreEl.textContent = this.scores.player2;
        this.drawsScoreEl.textContent = this.scores.draws;
        this.saveScores();
    }

    highlightActiveScore() {
        const scoreCards = document.querySelectorAll('.score-card');
        scoreCards.forEach(card => card.classList.remove('active'));

        if (this.currentPlayer === 'X') {
            document.querySelector('.score-card.player1').classList.add('active');
        } else {
            document.querySelector('.score-card.player2').classList.add('active');
        }
    }

    // ========================================
    // Modal Display
    // ========================================
    showWinModal(winner) {
        const isPlayerX = winner === 'X';
        const isAI = this.gameMode === 'single' && !isPlayerX;
        
        this.winnerIcon.textContent = isAI ? '⚙' : '★';
        this.winnerIcon.style.color = isPlayerX ? 'var(--player-x)' : 'var(--player-o)';
        
        if (this.gameMode === 'single') {
            this.winnerTitle.textContent = isPlayerX ? 'You Win!' : 'AI Wins!';
            this.winnerMessage.textContent = isPlayerX 
                ? 'Congratulations! You beat the AI!' 
                : 'The AI outsmarted you this time.';
        } else {
            this.winnerTitle.textContent = `Player ${winner} Wins!`;
            this.winnerMessage.textContent = 'Congratulations on your victory!';
        }

        this.winnerModal.classList.remove('hidden');
    }

    showDrawModal() {
        this.winnerIcon.textContent = '⚭';
        this.winnerIcon.style.color = 'var(--text-muted)';
        this.winnerTitle.textContent = "It's a Draw!";
        this.winnerMessage.textContent = 'Both players played well. Try again!';
        this.winnerModal.classList.remove('hidden');
    }

    // ========================================
    // Game Actions
    // ========================================
    playAgain() {
        this.winnerModal.classList.add('hidden');
        this.startGame();
    }

    restartGame() {
        this.startGame();
    }

    backToMenu() {
        this.winnerModal.classList.add('hidden');
        this.showSection('mode');
        this.gameActive = false;
    }

    // ========================================
    // Theme Management
    // ========================================
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('tictactoe-theme', newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('tictactoe-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // ========================================
    // Score Persistence
    // ========================================
    saveScores() {
        localStorage.setItem('tictactoe-scores', JSON.stringify(this.scores));
    }

    loadScores() {
        const savedScores = localStorage.getItem('tictactoe-scores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScoreDisplay();
        }
    }
}

// ========================================
// Initialize Game
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
