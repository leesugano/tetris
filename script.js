document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#game-board');
    const scoreDisplay = document.getElementById('score');
    const startBtn = document.getElementById('start-button');
    const highScoresList = document.getElementById('high-scores');
    const nameForm = document.getElementById('name-form');
    const playerNameInput = document.getElementById('player-name');
    const nameModal = new bootstrap.Modal(document.getElementById('nameModal'));
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#F4B400', '#DB4437', '#0F9D58'];
    const width = 10;
    let squares = Array.from(Array(200), (_, i) => {
        const div = document.createElement('div');
        grid.appendChild(div);
        return div;
    });

    for (let i = 0; i < 10; i++) {
        const div = document.createElement('div');
        div.classList.add('taken');
        grid.appendChild(div);
        squares.push(div);
    }

    let currentPosition = 4;
    let currentRotation = 0;
    let timerId;
    let score = 0;

    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];
    let currentColor = colors[Math.floor(Math.random() * colors.length)];

    function draw() {
        current.forEach(index => {
            const square = squares[currentPosition + index];
            square.style.backgroundColor = currentColor;
            square.classList.add('block');
        });
    }

    function undraw() {
        current.forEach(index => {
            const square = squares[currentPosition + index];
            square.classList.remove('block');
            square.style.backgroundColor = '';
        });
    }

    function control(e) {
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        }
    }
    document.addEventListener('keydown', control);

    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            random = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentColor = colors[Math.floor(Math.random() * colors.length)];
            currentPosition = 4;
            draw();
            addScore();
            gameOver();
        }
    }

    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        draw();
    }

    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
            if (row.every(index => squares[index].classList.contains('taken'))) {
                row.forEach(index => {
                    squares[index].classList.add('explode');
                });

                setTimeout(() => {
                    row.forEach(index => {
                        squares[index].classList.remove('taken', 'block', 'explode');
                        squares[index].style.backgroundColor = '';
                    });

                    const squaresRemoved = squares.splice(i, width);
                    squares = squaresRemoved.concat(squares);
                    squares.forEach(cell => grid.appendChild(cell));

                    score += 10;
                    scoreDisplay.innerHTML = score;
                }, 500);
            }
        }
    }

    function saveHighScore(score, name) {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push({ score, name });
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10);
        localStorage.setItem('highScores', JSON.stringify(highScores));
        displayHighScores();
    }

    function displayHighScores() {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScoresList.innerHTML = highScores
            .filter(scoreEntry => scoreEntry.name && scoreEntry.score)
            .map((scoreEntry, index) => `<li class="list-group-item">${index + 1}. ${scoreEntry.name} - ${scoreEntry.score}</li>`)
            .join('');
    }

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            clearInterval(timerId);
            nameModal.show();
        }
    }

    nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const playerName = playerNameInput.value;
        saveHighScore(score, playerName);
        nameModal.hide();
    });

    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 1000);
            displayHighScores();
        }
    });

    displayHighScores();
});
