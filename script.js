// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form elements
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');
        
        // Show loading state
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
        submitBtn.disabled = true;
        
        try {
            // Get form data
            const formData = {
                name: this.querySelector('input[name="name"]').value,
                email: this.querySelector('input[name="email"]').value,
                message: this.querySelector('textarea[name="message"]').value
            };

            // Send data to backend
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            // Show success message
            alert('Thank you for your message! You will receive a confirmation email shortly.');
            this.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message: ' + error.message);
        } finally {
            // Reset button state
            btnText.style.display = 'inline-block';
            loadingSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.backgroundColor = '#ffffff';
    }
});

// Puzzle Game Logic
class PuzzleGame {
    constructor() {
        this.board = document.getElementById('puzzle-board');
        this.moveCount = document.getElementById('move-count');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.tiles = [];
        this.moves = 0;
        this.size = 3;
        
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.startNewGame();
    }

    startNewGame() {
        this.moves = 0;
        this.moveCount.textContent = this.moves;
        this.tiles = Array.from({length: this.size * this.size - 1}, (_, i) => i + 1);
        this.tiles.push(null); // Empty tile
        this.shuffleBoard();
        this.renderBoard();
    }

    shuffleBoard() {
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }
        
        // Ensure the puzzle is solvable
        let inversions = 0;
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== null) {
                for (let j = i + 1; j < this.tiles.length; j++) {
                    if (this.tiles[j] !== null && this.tiles[i] > this.tiles[j]) {
                        inversions++;
                    }
                }
            }
        }
        
        if (inversions % 2 === 1) {
            // Swap any two tiles to make it solvable
            [this.tiles[0], this.tiles[1]] = [this.tiles[1], this.tiles[0]];
        }
    }

    renderBoard() {
        this.board.innerHTML = '';
        this.tiles.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = `puzzle-tile ${tile === null ? 'empty' : ''}`;
            if (tile !== null) {
                tileElement.textContent = tile;
            }
            tileElement.addEventListener('click', () => this.moveTile(index));
            this.board.appendChild(tileElement);
        });
    }

    moveTile(index) {
        const emptyIndex = this.tiles.indexOf(null);
        if (this.isAdjacent(index, emptyIndex)) {
            [this.tiles[index], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[index]];
            this.moves++;
            this.moveCount.textContent = this.moves;
            this.renderBoard();
            
            if (this.checkWin()) {
                setTimeout(() => {
                    alert(`Congratulations! You solved the puzzle in ${this.moves} moves!`);
                }, 300);
            }
        }
    }

    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / this.size);
        const col1 = index1 % this.size;
        const row2 = Math.floor(index2 / this.size);
        const col2 = index2 % this.size;
        
        return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
               (Math.abs(col1 - col2) === 1 && row1 === row2);
    }

    checkWin() {
        return this.tiles.every((tile, index) => {
            if (index === this.tiles.length - 1) return tile === null;
            return tile === index + 1;
        });
    }
}

// Initialize the puzzle game
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});

// Memory Game Logic
class MemoryGame {
    constructor() {
        this.board = document.getElementById('memory-board');
        this.moveCount = document.getElementById('move-count');
        this.pairsCount = document.getElementById('pairs-count');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.cards = [];
        this.moves = 0;
        this.pairs = 0;
        this.flippedCards = [];
        this.isLocked = false;
        
        this.symbols = ['🍞', '🥖', '🥨', '🥯', '🥐', '🧀', '🥪', '🥓'];
        
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.startNewGame();
    }

    startNewGame() {
        this.moves = 0;
        this.pairs = 0;
        this.moveCount.textContent = this.moves;
        this.pairsCount.textContent = this.pairs;
        this.flippedCards = [];
        this.isLocked = false;
        
        // Create pairs of cards
        this.cards = [...this.symbols, ...this.symbols]
            .sort(() => Math.random() - 0.5);
        
        this.renderBoard();
    }

    renderBoard() {
        this.board.innerHTML = '';
        this.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="card-front"></div>
                <div class="card-back">${symbol}</div>
            `;
            card.addEventListener('click', () => this.flipCard(card, index));
            this.board.appendChild(card);
        });
    }

    flipCard(card, index) {
        if (this.isLocked || this.flippedCards.includes(card)) return;
        
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.moveCount.textContent = this.moves;
            this.isLocked = true;
            
            const [card1, card2] = this.flippedCards;
            const index1 = this.cards.indexOf(card1.querySelector('.card-back').textContent);
            const index2 = this.cards.indexOf(card2.querySelector('.card-back').textContent);
            
            if (this.cards[index1] === this.cards[index2]) {
                this.pairs++;
                this.pairsCount.textContent = this.pairs;
                this.flippedCards = [];
                this.isLocked = false;
                
                if (this.pairs === this.symbols.length) {
                    setTimeout(() => {
                        alert(`Congratulations! You won in ${this.moves} moves!`);
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    this.flippedCards = [];
                    this.isLocked = false;
                }, 1000);
            }
        }
    }
}

// Initialize the memory game
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});

// Color Game Logic
class ColorGame {
    constructor() {
        this.board = document.getElementById('color-board');
        this.moveCount = document.getElementById('move-count');
        this.pairsCount = document.getElementById('pairs-count');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.welcomeModal = document.getElementById('welcome-modal');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.bestScoreElement = document.getElementById('best-score');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        this.cards = [];
        this.moves = 0;
        this.pairs = 0;
        this.flippedCards = [];
        this.isLocked = false;
        this.isRevealing = false;
        this.difficulty = 'medium';
        this.bestScore = localStorage.getItem('bestScore') || '--';
        
        this.colors = {
            easy: [
                '#FF0000', '#00FF00', '#0000FF', '#FFFF00'
            ],
            medium: [
                '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
                '#FF00FF', '#00FFFF', '#FFA500', '#800080'
            ],
            hard: [
                '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
                '#FF00FF', '#00FFFF', '#FFA500', '#800080',
                '#008000', '#800000', '#008080', '#000080'
            ]
        };
        
        this.setupEventListeners();
        this.showWelcomeModal();
    }

    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.startGameBtn.addEventListener('click', () => this.hideWelcomeModal());
        
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
            });
        });
    }

    showWelcomeModal() {
        this.welcomeModal.classList.remove('hidden');
        this.bestScoreElement.textContent = this.bestScore;
    }

    hideWelcomeModal() {
        this.welcomeModal.classList.add('hidden');
        this.startNewGame();
    }

    startNewGame() {
        this.moves = 0;
        this.pairs = 0;
        this.moveCount.textContent = this.moves;
        this.pairsCount.textContent = this.pairs;
        this.flippedCards = [];
        this.isLocked = false;
        
        // Create pairs of colors based on difficulty
        this.cards = [...this.colors[this.difficulty], ...this.colors[this.difficulty]]
            .sort(() => Math.random() - 0.5);
        
        this.renderBoard();
        this.revealSequence();
    }

    renderBoard() {
        this.board.innerHTML = '';
        const gridSize = this.difficulty === 'easy' ? 4 : 
                        this.difficulty === 'medium' ? 4 : 6;
        this.board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        this.cards.forEach((color, index) => {
            const card = document.createElement('div');
            card.className = 'color-card';
            card.innerHTML = `
                <div class="card-front"></div>
                <div class="card-back" style="background-color: ${color}"></div>
            `;
            card.addEventListener('click', () => this.flipCard(card, index));
            this.board.appendChild(card);
        });
    }

    async revealSequence() {
        this.isRevealing = true;
        const cards = Array.from(this.board.children);
        
        // First reveal all cards
        for (let i = 0; i < cards.length; i++) {
            cards[i].classList.add('flipped');
            await this.delay(50); // Faster reveal
        }
        
        await this.delay(800); // Shorter pause
        
        for (let i = cards.length - 1; i >= 0; i--) {
            cards[i].classList.remove('flipped');
            await this.delay(30); // Faster hide
        }
        
        this.isRevealing = false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    flipCard(card, index) {
        if (this.isLocked || this.flippedCards.includes(card) || this.isRevealing) return;
        
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.moveCount.textContent = this.moves;
            this.isLocked = true;
            
            const [card1, card2] = this.flippedCards;
            const color1 = card1.querySelector('.card-back').style.backgroundColor;
            const color2 = card2.querySelector('.card-back').style.backgroundColor;
            
            if (color1 === color2) {
                this.pairs++;
                this.pairsCount.textContent = this.pairs;
                this.flippedCards = [];
                this.isLocked = false;
                
                if (this.pairs === this.colors[this.difficulty].length) {
                    this.handleWin();
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    this.flippedCards = [];
                    this.isLocked = false;
                }, 800); // Shorter delay for non-matches
            }
        }
    }

    handleWin() {
        const currentScore = this.moves;
        if (this.bestScore === '--' || currentScore < parseInt(this.bestScore)) {
            this.bestScore = currentScore.toString();
            localStorage.setItem('bestScore', this.bestScore);
            this.bestScoreElement.textContent = this.bestScore;
        }
        
        setTimeout(() => {
            alert(`Congratulations! You won in ${this.moves} moves!`);
        }, 500);
    }
}

// Initialize the color game
document.addEventListener('DOMContentLoaded', () => {
    new ColorGame();
    
    // Game Developer Description Toggle
    const gameDevStat = document.getElementById('game-dev-stat');
    const gameDevDescription = document.getElementById('game-dev-description');
    
    // Code Warrior Description Toggle
    const codeWarriorStat = document.getElementById('code-warrior-stat');
    const codeWarriorDescription = document.getElementById('code-warrior-description');
    
    // Achievement Unlocked Description Toggle
    const achievementStat = document.getElementById('achievement-stat');
    const achievementDescription = document.getElementById('achievement-description');
    
    // Special Skills Description Toggle
    const fullstackSkill = document.getElementById('fullstack-skill');
    const fullstackDescription = document.getElementById('fullstack-description');
    
    const gamedevSkill = document.getElementById('gamedev-skill');
    const gamedevDescription = document.getElementById('gamedev-description');
    
    const uiuxSkill = document.getElementById('uiux-skill');
    const uiuxDescription = document.getElementById('uiux-description');
    
    const problemSkill = document.getElementById('problem-skill');
    const problemDescription = document.getElementById('problem-description');
    
    // Function to toggle description visibility
    function toggleDescription(stat, description) {
        if (stat && description) {
            stat.addEventListener('click', () => {
                // Close all other descriptions first
                document.querySelectorAll('.stat-description.active, .skill-description.active').forEach(desc => {
                    if (desc !== description) {
                        desc.classList.remove('active');
                    }
                });
                
                // Toggle the clicked description
                description.classList.toggle('active');
            });
        }
    }
    
    // Set up click handlers for all descriptions
    toggleDescription(gameDevStat, gameDevDescription);
    toggleDescription(codeWarriorStat, codeWarriorDescription);
    toggleDescription(achievementStat, achievementDescription);
    
    // Set up click handlers for skill descriptions
    toggleDescription(fullstackSkill, fullstackDescription);
    toggleDescription(gamedevSkill, gamedevDescription);
    toggleDescription(uiuxSkill, uiuxDescription);
    toggleDescription(problemSkill, problemDescription);
    
    // Close descriptions when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInsideStat = e.target.closest('.stat-item, .skill-item');
        const isClickInsideDescription = e.target.closest('.stat-description, .skill-description');
        
        if (!isClickInsideStat && !isClickInsideDescription) {
            document.querySelectorAll('.stat-description.active, .skill-description.active').forEach(desc => {
                desc.classList.remove('active');
            });
        }
    });

    // Game buttons event listeners
    const pixelKnightBtn = document.getElementById('play-pixel-knight');
    const strategyBtn = document.getElementById('play-strategy');
    const racingBtn = document.getElementById('play-racing');

    if (pixelKnightBtn) {
        pixelKnightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGame('pixel-knight');
        });
    }

    if (strategyBtn) {
        strategyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGame('strategy');
        });
    }

    if (racingBtn) {
        racingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGame('racing');
        });
    }

    // Add global game state variables
    let currentGame = '';
    let gameOver = false;
    let gameLoopRunning = false;

    // Add global event listener for spacebar restart
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && gameOver) {
            event.preventDefault(); // Prevent page scrolling
            switch(currentGame) {
                case 'pixel-knight':
                    restartPixelKnightGame();
                    break;
                case 'strategy':
                    restartStrategyGame();
                    break;
                case 'chess':
                    restartChessGame();
                    break;
            }
            gameOver = false; // Reset game over state immediately
        }
    });

    // Update showGame function to track current game
    function showGame(gameId) {
        currentGame = gameId;
        gameOver = false;
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.display = 'flex';
        gameContainer.innerHTML = `
            <div class="active-game">
                <button class="close-game">&times;</button>
                <div id="${gameId}-game"></div>
            </div>
        `;

        const closeBtn = document.querySelector('.close-game');
        closeBtn.addEventListener('click', () => {
            gameContainer.style.display = 'none';
            currentGame = '';
            gameOver = false;
        });

        switch(gameId) {
            case 'pixel-knight':
                initPixelKnightGame();
                break;
            case 'strategy':
                initStrategyGame();
                break;
            case 'chess':
                initChessGame();
                break;
        }
    }

    // Pixel Knight Adventure Game (now Card Game)
    function initPixelKnightGame() {
        const gameArea = document.getElementById('pixel-knight-game');
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let gameOver = false;

        // Standard playing card symbols
        const symbols = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];

        gameArea.innerHTML = `
            <div class="game-stats">
                <div class="game-score">Pairs: <span id="score">0</span>/8</div>
                <div class="game-lives">Moves: <span id="moves">0</span></div>
            </div>
            <div class="card-board"></div>
        `;

        const cardBoard = document.querySelector('.card-board');
        cardBoard.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        `;

        function createCard(symbol, index) {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.style.cssText = `
                aspect-ratio: 1;
                background: linear-gradient(135deg, #2c3e50, #3498db);
                border-radius: 10px;
                cursor: pointer;
                transition: transform 0.6s;
                transform-style: preserve-3d;
                position: relative;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            `;

            const front = document.createElement('div');
            front.className = 'card-front';
            front.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 2em;
                background: linear-gradient(135deg, #2c3e50, #3498db);
                border-radius: 10px;
                background-image: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255, 255, 255, 0.1) 10px,
                    rgba(255, 255, 255, 0.1) 20px
                );
            `;

            const back = document.createElement('div');
            back.className = 'card-back';
            back.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 2.5em;
                font-weight: bold;
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                border-radius: 10px;
                transform: rotateY(180deg);
                color: white;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            `;
            back.textContent = symbol;

            card.appendChild(front);
            card.appendChild(back);
            card.addEventListener('click', () => flipCard(card));
            return card;
        }

        function flipCard(card) {
            if (gameOver || flippedCards.includes(card) || card.classList.contains('flipped')) return;

            card.classList.add('flipped');
            card.style.transform = 'rotateY(180deg)';
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                moves++;
                document.getElementById('moves').textContent = moves;
                checkMatch();
            }
        }

        function checkMatch() {
            const [card1, card2] = flippedCards;
            const match = card1.querySelector('.card-back').textContent === card2.querySelector('.card-back').textContent;

            if (match) {
                matchedPairs++;
                document.getElementById('score').textContent = matchedPairs;
                flippedCards = [];

                if (matchedPairs === 8) {
                    gameOver = true;
                    setTimeout(() => {
                        alert(`Congratulations! You won in ${moves} moves!`);
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    card1.style.transform = 'rotateY(0)';
                    card2.style.transform = 'rotateY(0)';
                    flippedCards = [];
                }, 1000);
            }
        }

        function initializeGame() {
            const cardPairs = [...symbols, ...symbols];
            cards = shuffleArray(cardPairs);
            cardBoard.innerHTML = '';
            cards.forEach((symbol, index) => {
                cardBoard.appendChild(createCard(symbol, index));
            });
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Initialize the game
        initializeGame();
    }

    // Strategy Commander Game (now Snake Game)
    function initStrategyGame() {
        const gameArea = document.getElementById('strategy-game');
        const gridSize = 20;
        const cellSize = 20;
        let snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        let food = {x: 15, y: 15};
        let direction = 'right';
        let nextDirection = 'right';
        let score = 0;
        let gameOver = false;
        let gameSpeed = 150; // milliseconds between moves
        
        gameArea.innerHTML = `
            <canvas id="snakeCanvas" width="${gridSize * cellSize}" height="${gridSize * cellSize}"></canvas>
            <div class="game-ui">
                <div class="game-score">Score: <span id="snake-score">0</span></div>
            </div>
        `;

        const canvas = document.getElementById('snakeCanvas');
        const ctx = canvas.getContext('2d');
        
        function drawGame() {
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= gridSize; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, gridSize * cellSize);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(gridSize * cellSize, i * cellSize);
                ctx.stroke();
            }
            
            // Draw snake
            snake.forEach((segment, index) => {
                // Snake head is a different color
                if (index === 0) {
                    ctx.fillStyle = '#4CAF50';
                } else {
                    ctx.fillStyle = '#8BC34A';
                }
                
                ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
                
                // Add eyes to the snake head
                if (index === 0) {
                    ctx.fillStyle = '#000';
                    
                    // Position eyes based on direction
                    let eyeX1, eyeX2, eyeY1, eyeY2;
                    
                    switch(direction) {
                        case 'up':
                            eyeX1 = segment.x * cellSize + 5;
                            eyeX2 = segment.x * cellSize + 15;
                            eyeY1 = eyeY2 = segment.y * cellSize + 5;
                            break;
                        case 'down':
                            eyeX1 = segment.x * cellSize + 5;
                            eyeX2 = segment.x * cellSize + 15;
                            eyeY1 = eyeY2 = segment.y * cellSize + 15;
                            break;
                        case 'left':
                            eyeX1 = eyeX2 = segment.x * cellSize + 5;
                            eyeY1 = segment.y * cellSize + 5;
                            eyeY2 = segment.y * cellSize + 15;
                            break;
                        case 'right':
                            eyeX1 = eyeX2 = segment.x * cellSize + 15;
                            eyeY1 = segment.y * cellSize + 5;
                            eyeY2 = segment.y * cellSize + 15;
                            break;
                    }
                    
                    ctx.beginPath();
                    ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
                    ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            // Draw food
            ctx.fillStyle = '#FF5722';
            ctx.beginPath();
            ctx.arc(
                food.x * cellSize + cellSize/2, 
                food.y * cellSize + cellSize/2, 
                cellSize/2, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        
        function updateGame() {
            if (gameOver) {
                drawGameOver();
                return;
            }
            
            // Update direction
            direction = nextDirection;
            
            // Calculate new head position
            const head = {x: snake[0].x, y: snake[0].y};
            
            switch(direction) {
                case 'up':
                    head.y--;
                    break;
                case 'down':
                    head.y++;
                    break;
                case 'left':
                    head.x--;
                    break;
                case 'right':
                    head.x++;
                    break;
            }
            
            // Check for collisions with walls
            if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                gameOver = true;
                return;
            }
            
            // Check for collisions with self
            for (let i = 0; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver = true;
                    return;
                }
            }
            
            // Add new head
            snake.unshift(head);
            
            // Check if snake ate food
            if (head.x === food.x && head.y === food.y) {
                // Increase score
                score++;
                document.getElementById('snake-score').textContent = score;
                
                // Generate new food
                generateFood();
                
                // Increase game speed every 5 points
                if (score % 5 === 0) {
                    gameSpeed = Math.max(50, gameSpeed - 10);
                }
            } else {
                // Remove tail if no food was eaten
                snake.pop();
            }
            
            // Draw the game
            drawGame();
            
            // Schedule next update
            setTimeout(updateGame, gameSpeed);
        }
        
        function generateFood() {
            // Generate random position for food
            let newFood;
            let foodOnSnake;
            
            do {
                foodOnSnake = false;
                newFood = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize)
                };
                
                // Check if food is on snake
                for (let i = 0; i < snake.length; i++) {
                    if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                        foodOnSnake = true;
                        break;
                    }
                }
            } while (foodOnSnake);
            
            food = newFood;
        }
        
        function drawGameOver() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 20);
            ctx.font = '18px Arial';
            ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
            ctx.fillText('Press Space to Restart', canvas.width/2, canvas.height/2 + 50);
            
            // Set global game over state
            gameOver = true;
        }
        
        // Controls
        document.addEventListener('keydown', (e) => {
            if (gameOver) {
                if (e.code === 'Space') {
                    e.preventDefault(); // Prevent page scrolling
                    restartStrategyGame();
                    return;
                }
                return;
            }
            
            switch(e.key) {
                case 'ArrowUp':
                    if (direction !== 'down') nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    if (direction !== 'up') nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    if (direction !== 'right') nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    if (direction !== 'left') nextDirection = 'right';
                    break;
            }
        });
        
        // Start the game
        updateGame();
    }

    // Speed Racer Game (now Chess Game)
    function initRacingGame() {
        initChessGame();
    }

    // Chess Game
    function initChessGame() {
        const gameArea = document.getElementById('chess-game');
        const boardSize = 8;
        const cellSize = 60;
        let selectedPiece = null;
        let playerTurn = true; // true for white, false for black
        let gameOver = false;
        
        gameArea.innerHTML = `
            <div class="chess-board"></div>
            <div class="game-ui">
                <div class="game-turn">Turn: <span id="turn-indicator">White</span></div>
            </div>
        `;

        const board = document.querySelector('.chess-board');
        const pieces = [];

        // Chess piece definitions
        const initialSetup = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
        ];

        // Create game board
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'chess-cell';
                cell.style.cssText = `
                    width: ${cellSize}px;
                    height: ${cellSize}px;
                    background: ${(row + col) % 2 === 0 ? '#f0d9b5' : '#b58863'};
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    position: relative;
                `;
                
                // Add piece if initial setup has one
                if (initialSetup[row][col]) {
                    const piece = createChessPiece(initialSetup[row][col], row < 2 ? 'black' : 'white');
                    cell.appendChild(piece);
                    pieces.push({
                        element: piece,
                        type: initialSetup[row][col],
                        color: row < 2 ? 'black' : 'white',
                        position: { row, col }
                    });
                }
                
                cell.addEventListener('click', () => handleChessCellClick(row, col));
                board.appendChild(cell);
            }
        }

        function createChessPiece(type, color) {
            const piece = document.createElement('div');
            piece.className = `chess-piece ${color} ${type}`;
            
            // Use Unicode chess symbols instead of images
            const symbols = {
                'white': {
                    'king': '♔',
                    'queen': '♕',
                    'rook': '♖',
                    'bishop': '♗',
                    'knight': '♘',
                    'pawn': '♙'
                },
                'black': {
                    'king': '♚',
                    'queen': '♛',
                    'rook': '♜',
                    'bishop': '♝',
                    'knight': '♞',
                    'pawn': '♟'
                }
            };
            
            piece.textContent = symbols[color][type];
            piece.style.cssText = `
                width: ${cellSize * 0.8}px;
                height: ${cellSize * 0.8}px;
                font-size: ${cellSize * 0.7}px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: ${color === 'white' ? '#fff' : '#000'};
                text-shadow: ${color === 'white' ? '0 0 2px #000' : '0 0 2px #fff'};
            `;
            return piece;
        }

        function handleChessCellClick(row, col) {
            if (gameOver) return;

            const clickedPiece = pieces.find(p => 
                p.position.row === row && p.position.col === col
            );
            const cells = document.querySelectorAll('.chess-cell');

            // Clear previous highlights
            cells.forEach(cell => {
                cell.style.boxShadow = 'none';
            });

            if (selectedPiece) {
                // Move piece
                if (isValidChessMove(selectedPiece, row, col)) {
                    moveChessPiece(selectedPiece, row, col);
                    playerTurn = !playerTurn;
                    document.getElementById('turn-indicator').textContent = playerTurn ? 'White' : 'Black';
                    
                    // Check for checkmate or stalemate
                    if (isCheckmate(!playerTurn)) {
                        gameOver = true;
                        setTimeout(() => {
                            alert(`Checkmate! ${playerTurn ? 'White' : 'Black'} wins!`);
                        }, 100);
                    } else if (isStalemate(!playerTurn)) {
                        gameOver = true;
                        setTimeout(() => {
                            alert("Stalemate! The game is a draw!");
                        }, 100);
                    }
                }
                selectedPiece = null;
            } else if (clickedPiece && clickedPiece.color === (playerTurn ? 'white' : 'black')) {
                // Select piece
                selectedPiece = clickedPiece;
                cells[row * boardSize + col].style.boxShadow = '0 0 10px #ffeb3b';
                showValidChessMoves(clickedPiece);
            }
        }

        function isValidChessMove(piece, targetRow, targetCol) {
            const targetPiece = pieces.find(p => 
                p.position.row === targetRow && p.position.col === targetCol
            );

            // Can't capture your own pieces
            if (targetPiece && targetPiece.color === piece.color) {
                return false;
            }

            // Basic movement validation based on piece type
            switch (piece.type) {
                case 'pawn':
                    return isValidPawnMove(piece, targetRow, targetCol, targetPiece);
                case 'rook':
                    return isValidRookMove(piece, targetRow, targetCol);
                case 'knight':
                    return isValidKnightMove(piece, targetRow, targetCol);
                case 'bishop':
                    return isValidBishopMove(piece, targetRow, targetCol);
                case 'queen':
                    return isValidQueenMove(piece, targetRow, targetCol);
                case 'king':
                    return isValidKingMove(piece, targetRow, targetCol);
                default:
                    return false;
            }
        }

        function isValidPawnMove(piece, targetRow, targetCol, targetPiece) {
            const direction = piece.color === 'white' ? -1 : 1;
            const startRow = piece.color === 'white' ? 6 : 1;

            // Forward move
            if (!targetPiece && targetCol === piece.position.col) {
                if (targetRow === piece.position.row + direction) {
                    return true;
                }
                // Initial two-square move
                if (piece.position.row === startRow && 
                    targetRow === piece.position.row + 2 * direction) {
                    return !pieces.some(p => 
                        p.position.row === piece.position.row + direction && 
                        p.position.col === piece.position.col
                    );
                }
            }
            
            // Capture move
            if (targetPiece && targetPiece.color !== piece.color) {
                return Math.abs(targetCol - piece.position.col) === 1 && 
                       targetRow === piece.position.row + direction;
            }

            return false;
        }

        function isValidRookMove(piece, targetRow, targetCol) {
            if (piece.position.row !== targetRow && piece.position.col !== targetCol) {
                return false;
            }
            return !isPathBlocked(piece.position, {row: targetRow, col: targetCol});
        }

        function isValidKnightMove(piece, targetRow, targetCol) {
            const rowDiff = Math.abs(targetRow - piece.position.row);
            const colDiff = Math.abs(targetCol - piece.position.col);
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        }

        function isValidBishopMove(piece, targetRow, targetCol) {
            if (Math.abs(targetRow - piece.position.row) !== Math.abs(targetCol - piece.position.col)) {
                return false;
            }
            return !isPathBlocked(piece.position, {row: targetRow, col: targetCol});
        }

        function isValidQueenMove(piece, targetRow, targetCol) {
            return isValidRookMove(piece, targetRow, targetCol) || 
                   isValidBishopMove(piece, targetRow, targetCol);
        }

        function isValidKingMove(piece, targetRow, targetCol) {
            const rowDiff = Math.abs(targetRow - piece.position.row);
            const colDiff = Math.abs(targetCol - piece.position.col);
            return rowDiff <= 1 && colDiff <= 1;
        }

        function isPathBlocked(start, end) {
            const rowDir = start.row === end.row ? 0 : (end.row - start.row) / Math.abs(end.row - start.row);
            const colDir = start.col === end.col ? 0 : (end.col - start.col) / Math.abs(end.col - start.col);
            
            let currentRow = start.row + rowDir;
            let currentCol = start.col + colDir;
            
            while (currentRow !== end.row || currentCol !== end.col) {
                if (pieces.some(p => p.position.row === currentRow && p.position.col === currentCol)) {
                    return true;
                }
                currentRow += rowDir;
                currentCol += colDir;
            }
            
            return false;
        }

        function showValidChessMoves(piece) {
            const cells = document.querySelectorAll('.chess-cell');
            for (let row = 0; row < boardSize; row++) {
                for (let col = 0; col < boardSize; col++) {
                    if (isValidChessMove(piece, row, col)) {
                        cells[row * boardSize + col].style.boxShadow = '0 0 10px #4caf50';
                    }
                }
            }
        }

        function moveChessPiece(piece, targetRow, targetCol) {
            const cells = document.querySelectorAll('.chess-cell');
            const targetPiece = pieces.find(p => 
                p.position.row === targetRow && p.position.col === targetCol
            );

            // Remove captured piece if any
            if (targetPiece) {
                cells[targetRow * boardSize + targetCol].removeChild(targetPiece.element);
                pieces.splice(pieces.indexOf(targetPiece), 1);
            }

            // Move piece
            cells[piece.position.row * boardSize + piece.position.col].removeChild(piece.element);
            cells[targetRow * boardSize + targetCol].appendChild(piece.element);
            piece.position = { row: targetRow, col: targetCol };
        }

        function isCheckmate(color) {
            // Simplified checkmate detection
            // In a real implementation, this would check for:
            // 1. King is in check
            // 2. No legal moves for any piece
            return false;
        }

        function isStalemate(color) {
            // Simplified stalemate detection
            // In a real implementation, this would check for:
            // 1. No legal moves for any piece
            // 2. King is not in check
            return false;
        }
    }

    // Update Chess Game restart function
    function restartChessGame() {
        if (gameOver) {
            gameOver = false;
            // Reset the chess game board
            const gameArea = document.getElementById('chess-game');
            initChessGame(); // Reinitialize the game
        }
    }

    // Add global event listener to prevent arrow keys from scrolling when a game is active
    document.addEventListener('keydown', function(event) {
        if (currentGame && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
        }
    });

    // Add global event listener to prevent arrow keys and space bar from scrolling when a game is active
    document.addEventListener('keydown', function(event) {
        if (currentGame && (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || event.code === 'Space')) {
            event.preventDefault();
        }
    });

    // Add event listener for chess game button
    const chessButton = document.getElementById('play-chess');
    if (chessButton) {
        chessButton.addEventListener('click', function(e) {
            e.preventDefault();
            showGame('chess');
        });
    }
});

// Add event listener for spacebar restart
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && gameOver) {
        event.preventDefault(); // Prevent page scrolling
        restartGame();
    }
});

function restartGame() {
    if (gameOver) {
        gameOver = false;
        playerScore = 0;
        playerLives = 3;
        hasShield = false;
        powerUpTime = 0;
        player.x = canvas.width / 2;
        player.y = canvas.height - 50;
        player.speedY = 0;
        player.canDoubleJump = true;
        
        // Reset game elements
        platforms = [];
        coins = [];
        powerUps = [];
        enemies = [];
        
        // Initialize new game elements
        initializePlatforms();
        initializeCoins();
        initializePowerUps();
        initializeEnemies();
        
        // Start game loop again
        if (!gameLoopRunning) {
            gameLoopRunning = true;
            gameLoop();
        }
    }
}

function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${playerScore}`, canvas.width / 2, canvas.height / 2);
    
    ctx.font = '18px Arial';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 50);
    
    gameOver = true;
    gameLoopRunning = false;
} 