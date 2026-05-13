// Слово для отгадывания (5 букв)
const targetWord = "HELLO";
const maxAttempts = 6;
let currentAttempt = 0;
let currentTile = 0;

// Массив для хранения введенных букв
let gameState = Array(maxAttempts).fill().map(() => Array(targetWord.length).fill(''));

// Обновление отображения сетки (буквы поверх картинки)
function updateBoard() {
    const tiles = document.querySelectorAll('.game-tile');
    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < targetWord.length; j++) {
            const index = i * targetWord.length + j;
            if (tiles[index]) {
                tiles[index].textContent = gameState[i][j];
            }
        }
    }
}

// Функция воспроизведения звука
function playClickSound() {
    // Создаем новый Audio объект при каждом нажатии
    const audio = new Audio('/static/sounds/click.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
        console.log('Звук не воспроизведен:', error);
    });
}

// Добавление буквы
function addLetter(letter) {
    if (currentAttempt >= maxAttempts) return;
    if (currentTile >= targetWord.length) return;

    gameState[currentAttempt][currentTile] = letter;
    updateBoard();

    playClickSound();
    currentTile++;
}

// Удаление последней буквы
function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        gameState[currentAttempt][currentTile] = '';
        updateBoard();
        playClickSound();
    }
}

// Проверка слова
function checkWord() {
    if (currentTile !== targetWord.length) return;

    let currentWord = '';
    for (let i = 0; i < targetWord.length; i++) {
        currentWord += gameState[currentAttempt][i];
    }

    // Подсветка букв (меняем цвет текста)
    const tiles = document.querySelectorAll('.game-tile');
    const startIndex = currentAttempt * targetWord.length;

    for (let i = 0; i < targetWord.length; i++) {
        const tile = tiles[startIndex + i];
        if (currentWord[i] === targetWord[i]) {
            tile.classList.add('correct');
        } else if (targetWord.includes(currentWord[i])) {
            tile.classList.add('present');
        } else {
            tile.classList.add('absent');
        }
    }

    // Воспроизводим звук при проверке
    playClickSound();

    // Проверяем победу
    if (currentWord === targetWord) {
        setTimeout(() => {
            alert('ПОЗДРАВЛЯЮ! ТЫ УГАДАЛ СЛОВО! 🎉');
            resetGame();
        }, 300);
        return;
    }

    currentAttempt++;
    currentTile = 0;

    // Проверяем поражение
    if (currentAttempt >= maxAttempts) {
        setTimeout(() => {
            alert(`ИГРА ОКОНЧЕНА! Загаданное слово: ${targetWord}`);
            resetGame();
        }, 300);
    }
}

// Сброс игры
function resetGame() {
    currentAttempt = 0;
    currentTile = 0;
    gameState = Array(maxAttempts).fill().map(() => Array(targetWord.length).fill(''));

    const tiles = document.querySelectorAll('.game-tile');
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.classList.remove('correct', 'present', 'absent');
    });
}

// Создание клеток поверх картинки
function createTiles() {
    const gameGrid = document.querySelector('.game_grid');
    const tileContainer = document.createElement('div');
    tileContainer.className = 'tiles-overlay';

    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < targetWord.length; j++) {
            const tile = document.createElement('div');
            tile.className = 'game-tile';
            tile.setAttribute('data-row', i);
            tile.setAttribute('data-col', j);
            tileContainer.appendChild(tile);
        }
    }

    gameGrid.appendChild(tileContainer);
}

// Обработка нажатия на кнопки клавиатуры
document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const letter = btn.getAttribute('data-letter');
        addLetter(letter);
    });
});

// Обработка физической клавиатуры
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();

    if (key >= 'A' && key <= 'Z') {
        addLetter(key);
        e.preventDefault();
    }
    else if (key === 'BACKSPACE') {
        deleteLetter();
        e.preventDefault();
    }
    else if (key === 'ENTER') {
        checkWord();
        e.preventDefault();
    }
});

function handleButtonClick(url) {
    window.location.href = url;
}

// Создаем клетки при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    createTiles();
});