// Игровые переменные
let currentAttempt = 0;
let currentLetterIndex = 0;
let maxAttempts = 6;
let wordLength = 5;
let gameBoard = [];
let keyboardSoundEnabled = true;
let dialogSoundEnabled = true;
let characterVoiceEnabled = true;
let isWaitingResponse = false;
let musicEnabled = true;
let isGameOver = false;

// Аудио элементы
let bgMusic = null;
let clickSound = null;
let successSound = null;
let failSound = null;
let shurikSound = null;
let simbaSound = null;
let kakoshkaSound = null;
let meowSound = null;

// Переменные для управления диалогами
let currentDialogTimeout = null;
let dialogInterval = null;
let availableDialogues = [];
let lastDialogue = null;

// Инициализация звуков
function initSounds() {
    bgMusic = new Audio('/static/sounds/background_music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    clickSound = new Audio('/static/sounds/click.mp3');
    clickSound.volume = 0.3;

    successSound = new Audio('/static/sounds/success.mp3');
    successSound.volume = 0.4;

    failSound = new Audio('/static/sounds/fail.mp3');
    failSound.volume = 0.3;

    shurikSound = new Audio('/static/sounds/shurik_sound.mp3');
    shurikSound.volume = 0.5;

    simbaSound = new Audio('/static/sounds/simba_sound.mp3');
    simbaSound.volume = 0.5;

    kakoshkaSound = new Audio('/static/sounds/kakoshka_sound.mp3');
    kakoshkaSound.volume = 0.5;

    meowSound = new Audio('/static/sounds/meow.mp3');
    meowSound.volume = 0.4;
}

// Воспроизведение звука персонажа
function playCharacterSound(character) {
    if (!characterVoiceEnabled) return;

    let sound = null;

    switch(character) {
        case 'shurik':
            sound = shurikSound;
            break;
        case 'simba':
            sound = simbaSound;
            break;
        case 'kakoshka':
            sound = kakoshkaSound;
            break;
        default:
            sound = meowSound;
    }

    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log('Звук персонажа не воспроизведен:', error);
            if (meowSound) {
                meowSound.currentTime = 0;
                meowSound.play().catch(() => {});
            }
        });
    }
}

// Загрузка реплик
async function loadDialogues() {
    try {
        const response = await fetch('/api/get_dialogues');
        const data = await response.json();
        if (data.dialogues && data.dialogues.length > 0) {
            availableDialogues = data.dialogues;
        } else {
            availableDialogues = [
                { character: 'shurik', line: 'Мяу! Думай лучше!' },
                { character: 'shurik', line: 'Хорошая попытка!' },
                { character: 'shurik', line: 'Почти получилось!' },
                { character: 'simba', line: 'Ррр! Я помогу тебе!' },
                { character: 'simba', line: 'Следующая буква близко!' },
                { character: 'kakoshka', line: 'Мур-мяу! Ты справишься!' },
                { character: 'kakoshka', line: 'Я верю в тебя!' },
                { character: 'kakoshka', line: 'Еще немного!' }
            ];
        }
    } catch (error) {
        console.log('Ошибка загрузки реплик, использую стандартные');
        availableDialogues = [
            { character: 'shurik', line: 'Мяу! Думай лучше!' },
            { character: 'shurik', line: 'Хорошая попытка!' },
            { character: 'simba', line: 'Ррр! Я помогу тебе!' },
            { character: 'kakoshka', line: 'Мур-мяу! Ты справишься!' }
        ];
    }
}

// Получить случайную реплику (без повторения предыдущей)
function getRandomDialogue() {
    if (availableDialogues.length === 0) return null;

    if (!lastDialogue || availableDialogues.length === 1) {
        const randomIndex = Math.floor(Math.random() * availableDialogues.length);
        lastDialogue = availableDialogues[randomIndex];
        return lastDialogue;
    }

    let filteredDialogues = availableDialogues.filter(d =>
        d.character !== lastDialogue.character || d.line !== lastDialogue.line
    );

    if (filteredDialogues.length === 0) {
        filteredDialogues = availableDialogues;
    }

    const randomIndex = Math.floor(Math.random() * filteredDialogues.length);
    lastDialogue = filteredDialogues[randomIndex];
    return lastDialogue;
}

// Обновление содержимого диалога
function updateDialogContent(dialogElement, dialog, catImage, characterName, characterEmoji) {
    dialogElement.innerHTML = `
        <div class="dialog-wrapper">
            <img src="${catImage}" alt="${characterName}" class="dialog-cat" onerror="this.style.display='none'; this.parentElement.querySelector('.dialog-cat-fallback').style.display='flex'">
            <div class="dialog-cat-fallback" style="display: none;">
                ${characterEmoji}
            </div>
            <div class="dialog-bubble">
                <div class="dialog-name">${characterName}</div>
                <div class="dialog-line">✨ "${dialog.line}" ✨</div>
            </div>
        </div>
    `;

    const img = dialogElement.querySelector('.dialog-cat');
    if (img) {
        img.onerror = function() {
            this.style.display = 'none';
            const fallback = dialogElement.querySelector('.dialog-cat-fallback');
            if (fallback) fallback.style.display = 'flex';
        };
    }
}

// Показать диалог с анимацией
function showDialogWithAnimation(dialogElement) {
    dialogElement.style.display = 'block';
    dialogElement.style.opacity = '0';
    dialogElement.style.transform = 'translateY(30px) scale(0.95)';
    setTimeout(() => {
        dialogElement.style.transition = 'all 0.3s ease';
        dialogElement.style.opacity = '1';
        dialogElement.style.transform = 'translateY(0) scale(1)';
    }, 10);
}

// Показать случайную реплику
function showRandomDialog() {
    if (!dialogSoundEnabled) return;
    if (isGameOver) return;

    const dialog = getRandomDialogue();
    if (!dialog) return;

    playCharacterSound(dialog.character);

    let dialogElement = document.getElementById('characterDialog');

    if (!dialogElement) {
        dialogElement = document.createElement('div');
        dialogElement.id = 'characterDialog';
        dialogElement.className = 'character-dialog';
        document.body.appendChild(dialogElement);
    }

    let catImage = '';
    let characterName = '';
    let characterEmoji = '';

    if (dialog.character === 'shurik') {
        catImage = '/static/data/images/cats/shurik.png';
        characterName = 'Шурик';
        characterEmoji = '😼';
    } else if (dialog.character === 'simba') {
        catImage = '/static/data/images/cats/simba.png';
        characterName = 'Симба';
        characterEmoji = '🦁';
    } else {
        catImage = '/static/data/images/cats/kakoshka.png';
        characterName = 'Какошка';
        characterEmoji = '🐱';
    }

    if (dialogElement.style.display === 'block') {
        dialogElement.style.opacity = '0';
        dialogElement.style.transform = 'translateY(30px) scale(0.95)';
        setTimeout(() => {
            updateDialogContent(dialogElement, dialog, catImage, characterName, characterEmoji);
            showDialogWithAnimation(dialogElement);
        }, 300);
    } else {
        updateDialogContent(dialogElement, dialog, catImage, characterName, characterEmoji);
        showDialogWithAnimation(dialogElement);
    }

    if (currentDialogTimeout) {
        clearTimeout(currentDialogTimeout);
    }

    currentDialogTimeout = setTimeout(() => {
        if (dialogElement && dialogElement.style.display !== 'none') {
            dialogElement.style.opacity = '0';
            dialogElement.style.transform = 'translateY(30px) scale(0.95)';
            setTimeout(() => {
                if (dialogElement) {
                    dialogElement.style.display = 'none';
                    dialogElement.style.opacity = '1';
                    dialogElement.style.transform = 'translateY(0) scale(1)';
                }
            }, 300);
        }
    }, 8000);
}

// Показать финальную реплику
function showFinalDialog(dialog) {
    if (!dialogSoundEnabled) return;

    lastDialogue = null;
    playCharacterSound(dialog.character);

    let dialogElement = document.getElementById('characterDialog');

    if (!dialogElement) {
        dialogElement = document.createElement('div');
        dialogElement.id = 'characterDialog';
        dialogElement.className = 'character-dialog';
        document.body.appendChild(dialogElement);
    }

    let catImage = '';
    let characterName = '';
    let characterEmoji = '';

    if (dialog.character === 'shurik') {
        catImage = '/static/data/images/cats/shurik.png';
        characterName = 'Шурик';
        characterEmoji = '😼';
    } else if (dialog.character === 'simba') {
        catImage = '/static/data/images/cats/simba.png';
        characterName = 'Симба';
        characterEmoji = '🦁';
    } else {
        catImage = '/static/data/images/cats/kakoshka.png';
        characterName = 'Какошка';
        characterEmoji = '🐱';
    }

    dialogElement.innerHTML = `
        <div class="dialog-wrapper">
            <img src="${catImage}" alt="${characterName}" class="dialog-cat" onerror="this.style.display='none'; this.parentElement.querySelector('.dialog-cat-fallback').style.display='flex'">
            <div class="dialog-cat-fallback" style="display: none;">
                ${characterEmoji}
            </div>
            <div class="dialog-bubble">
                <div class="dialog-name">${characterName}</div>
                <div class="dialog-line">✨ "${dialog.line}" ✨</div>
            </div>
        </div>
    `;

    const img = dialogElement.querySelector('.dialog-cat');
    if (img) {
        img.onerror = function() {
            this.style.display = 'none';
            const fallback = dialogElement.querySelector('.dialog-cat-fallback');
            if (fallback) fallback.style.display = 'flex';
        };
    }

    dialogElement.style.display = 'block';
    dialogElement.style.opacity = '0';
    dialogElement.style.transform = 'translateY(30px) scale(0.95)';
    setTimeout(() => {
        dialogElement.style.transition = 'all 0.3s ease';
        dialogElement.style.opacity = '1';
        dialogElement.style.transform = 'translateY(0) scale(1)';
    }, 10);
}

// Запуск интервала со случайными репликами
function startRandomDialogueInterval() {
    if (dialogInterval) {
        clearInterval(dialogInterval);
    }

    dialogInterval = setInterval(() => {
        if (!isGameOver && dialogSoundEnabled) {
            showRandomDialog();
        }
    }, 12000);
}

// Остановка интервала реплик
function stopRandomDialogueInterval() {
    if (dialogInterval) {
        clearInterval(dialogInterval);
        dialogInterval = null;
    }
}

// Сброс состояния реплик
function resetDialogState() {
    lastDialogue = null;
    if (currentDialogTimeout) {
        clearTimeout(currentDialogTimeout);
        currentDialogTimeout = null;
    }
}

// Показать результат игры
function showGameResult(result, secretWord) {
    isGameOver = true;
    stopRandomDialogueInterval();

    const finalDialog = getRandomDialogue();
    if (finalDialog) {
        showFinalDialog(finalDialog);
    }

    const resultOverlay = document.createElement('div');
    resultOverlay.className = 'result-overlay';

    const resultImage = document.createElement('img');
    if (result === 'win') {
        resultImage.src = '/static/data/images/icons/win_result.png';
        resultImage.alt = 'Победа!';
        startFireworks();
    } else {
        resultImage.src = '/static/data/images/icons/lose_result.png';
        resultImage.alt = 'Поражение!';
        startRain();
    }

    resultImage.onerror = function() {
        console.error('Не удалось загрузить картинку:', this.src);
        this.style.display = 'none';
        const errorText = document.createElement('div');
        errorText.textContent = result === 'win' ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ!';
        errorText.style.fontSize = '48px';
        errorText.style.color = '#FFD700';
        errorText.style.fontFamily = 'Courier New, monospace';
        resultOverlay.insertBefore(errorText, resultImage);
    };

    resultImage.className = 'result-image';

    if (result === 'lose') {
        const secretWordContainer = document.createElement('div');
        secretWordContainer.className = 'secret-word-container';
        secretWordContainer.innerHTML = `<span class="secret-word-label">Загаданное слово:</span><br><span class="secret-word">${secretWord ? secretWord.toUpperCase() : '???'}</span>`;
        resultOverlay.appendChild(secretWordContainer);
    }

    const homeBtn = document.createElement('button');
    homeBtn.className = 'result-home-btn';
    homeBtn.innerHTML = '<img src="/static/data/images/button/home_btn.png" alt="Главная">';
    homeBtn.onclick = () => {
        resultOverlay.remove();
        stopFireworks();
        stopRain();
        window.location.href = '/';
    };

    resultOverlay.appendChild(resultImage);
    resultOverlay.appendChild(homeBtn);
    document.body.appendChild(resultOverlay);

    setTimeout(() => {
        resultOverlay.classList.add('show');
    }, 100);
}

// Фейерверк
let canvas = null;
let ctx = null;
let particles = [];

function startFireworks() {
    canvas = document.createElement('canvas');
    canvas.id = 'fireworksCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1001';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createFirework(x, y) {
        const colors = ['#ff0000', '#ffaa00', '#ffff00', '#00ff00', '#00aaff', '#ff00ff', '#ffffff'];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 2
            });
        }
    }

    function animateFireworks() {
        if (!canvas || !ctx) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.01;

            if (p.life > 0) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            } else {
                particles.splice(i, 1);
                i--;
            }
        }

        if (Math.random() < 0.05) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.6;
            createFirework(x, y);
        }

        if (particles.length > 0 || true) {
            requestAnimationFrame(animateFireworks);
        }
    }

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            if (canvas) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height * 0.6;
                createFirework(x, y);
            }
        }, i * 200);
    }

    animateFireworks();
}

function stopFireworks() {
    if (canvas && document.body.contains(canvas)) {
        canvas.remove();
        canvas = null;
        ctx = null;
        particles = [];
    }
}

// Дождь
let rainCanvas = null;
let rainCtx = null;
let raindrops = [];
let rainAnimationId = null;

function startRain() {
    rainCanvas = document.createElement('canvas');
    rainCanvas.id = 'rainCanvas';
    rainCanvas.style.position = 'fixed';
    rainCanvas.style.top = '0';
    rainCanvas.style.left = '0';
    rainCanvas.style.width = '100%';
    rainCanvas.style.height = '100%';
    rainCanvas.style.pointerEvents = 'none';
    rainCanvas.style.zIndex = '1001';
    document.body.appendChild(rainCanvas);

    rainCtx = rainCanvas.getContext('2d');

    function resizeRainCanvas() {
        rainCanvas.width = window.innerWidth;
        rainCanvas.height = window.innerHeight;
    }
    resizeRainCanvas();
    window.addEventListener('resize', resizeRainCanvas);

    raindrops = [];
    for (let i = 0; i < 200; i++) {
        raindrops.push({
            x: Math.random() * rainCanvas.width,
            y: Math.random() * rainCanvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 5 + 3
        });
    }

    function animateRain() {
        if (!rainCanvas || !rainCtx) return;

        rainCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        rainCtx.fillRect(0, 0, rainCanvas.width, rainCanvas.height);

        rainCtx.strokeStyle = 'rgba(100, 150, 200, 0.6)';
        rainCtx.lineWidth = 2;

        for (let i = 0; i < raindrops.length; i++) {
            const drop = raindrops[i];
            rainCtx.beginPath();
            rainCtx.moveTo(drop.x, drop.y);
            rainCtx.lineTo(drop.x, drop.y + drop.length);
            rainCtx.stroke();

            drop.y += drop.speed;

            if (drop.y > rainCanvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * rainCanvas.width;
            }
        }

        rainAnimationId = requestAnimationFrame(animateRain);
    }

    animateRain();
}

function stopRain() {
    if (rainAnimationId) {
        cancelAnimationFrame(rainAnimationId);
        rainAnimationId = null;
    }
    if (rainCanvas && document.body.contains(rainCanvas)) {
        rainCanvas.remove();
        rainCanvas = null;
        rainCtx = null;
        raindrops = [];
    }
}

// Загрузка настроек
async function loadSettings() {
    try {
        const response = await fetch('/get_settings');
        const settings = await response.json();

        const volume = settings.volume || 50;
        dialogSoundEnabled = settings.dialogSound !== false;
        keyboardSoundEnabled = settings.keyboardSound !== false;
        characterVoiceEnabled = settings.characterVoice !== false;

        if (bgMusic) bgMusic.volume = volume / 100;
        if (clickSound) clickSound.volume = (volume / 100) * 0.3;
        if (successSound) successSound.volume = (volume / 100) * 0.4;
        if (failSound) failSound.volume = (volume / 100) * 0.3;
        if (shurikSound) shurikSound.volume = (volume / 100) * 0.5;
        if (simbaSound) simbaSound.volume = (volume / 100) * 0.5;
        if (kakoshkaSound) kakoshkaSound.volume = (volume / 100) * 0.5;
        if (meowSound) meowSound.volume = (volume / 100) * 0.4;

    } catch (error) {
        const savedSettings = localStorage.getItem('meowdex_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (bgMusic) bgMusic.volume = (settings.volume || 50) / 100;
            keyboardSoundEnabled = settings.keyboardSound !== false;
            dialogSoundEnabled = settings.dialogSound !== false;
            characterVoiceEnabled = settings.characterVoice !== false;
        }
    }
}

// Начать новую игру
async function startNewGame() {
    isGameOver = false;
    stopRandomDialogueInterval();
    resetDialogState();

    const dialogElement = document.getElementById('characterDialog');
    if (dialogElement) {
        dialogElement.style.display = 'none';
    }

    try {
        const response = await fetch('/api/start_game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        resetGameUI();
        startRandomDialogueInterval();

    } catch (error) {
        console.error('Ошибка начала игры:', error);
        resetGameUI();
        startRandomDialogueInterval();
    }
}

// Отправить предположение
async function submitGuess(word) {
    if (isWaitingResponse) return false;
    isWaitingResponse = true;

    try {
        const response = await fetch('/api/submit_guess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess: word })
        });
        const data = await response.json();

        updateBoardColors(data.colors, currentAttempt);
        updateKeyboardState(data.keyboard);

        if (data.status === 'win') {
            if (successSound) successSound.play();
            showGameResult('win', data.secret_word);
            return true;
        } else if (data.status === 'lose') {
            if (failSound) failSound.play();
            showGameResult('lose', data.secret_word);
            return true;
        } else {
            currentAttempt++;
            currentLetterIndex = 0;
        }

        return true;

    } catch (error) {
        console.error('Ошибка отправки:', error);
        return false;
    } finally {
        isWaitingResponse = false;
    }
}

// Обновление цветов в сетке
function updateBoardColors(colors, rowIndex) {
    const rows = document.querySelectorAll('.game-row');
    if (!rows[rowIndex]) return;

    const tiles = rows[rowIndex].querySelectorAll('.game-tile');

    for (let i = 0; i < wordLength; i++) {
        if (colors[i] === 'green') {
            tiles[i].classList.add('correct');
        } else if (colors[i] === 'yellow') {
            tiles[i].classList.add('present');
        } else {
            tiles[i].classList.add('absent');
        }
    }
}

// Обновление состояния клавиатуры
function updateKeyboardState(keyboardState) {
    for (const [letter, color] of Object.entries(keyboardState)) {
        const buttons = document.querySelectorAll('.key-btn');
        for (const btn of buttons) {
            const btnLetter = btn.getAttribute('data-letter');
            if (btnLetter && btnLetter.toLowerCase() === letter.toLowerCase()) {
                btn.classList.remove('correct', 'present', 'absent');
                if (color === 'green') btn.classList.add('correct');
                else if (color === 'yellow') btn.classList.add('present');
                else if (color === 'gray') btn.classList.add('absent');
                break;
            }
        }
    }
}

// Сброс UI игры
function resetGameUI() {
    currentAttempt = 0;
    currentLetterIndex = 0;

    gameBoard = [];
    for (let i = 0; i < maxAttempts; i++) {
        gameBoard[i] = [];
        for (let j = 0; j < wordLength; j++) {
            gameBoard[i][j] = '';
        }
    }

    const allTiles = document.querySelectorAll('.game-tile');
    allTiles.forEach(tile => {
        tile.textContent = '';
        tile.classList.remove('correct', 'present', 'absent');
    });

    document.querySelectorAll('.key-btn').forEach(btn => {
        btn.classList.remove('correct', 'present', 'absent');
    });
}

// Добавление буквы
function addLetter(letter) {
    if (currentAttempt >= maxAttempts) {
        console.log('Игра окончена');
        return;
    }

    if (currentLetterIndex >= wordLength) {
        console.log('Строка заполнена');
        return;
    }

    gameBoard[currentAttempt][currentLetterIndex] = letter;

    const rows = document.querySelectorAll('.game-row');
    if (rows[currentAttempt]) {
        const tiles = rows[currentAttempt].querySelectorAll('.game-tile');
        tiles[currentLetterIndex].textContent = letter;
    }

    if (clickSound && keyboardSoundEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }

    currentLetterIndex++;
}

// Удаление последней буквы
function deleteLetter() {
    if (currentLetterIndex > 0) {
        currentLetterIndex--;
        gameBoard[currentAttempt][currentLetterIndex] = '';

        const rows = document.querySelectorAll('.game-row');
        if (rows[currentAttempt]) {
            const tiles = rows[currentAttempt].querySelectorAll('.game-tile');
            tiles[currentLetterIndex].textContent = '';
        }

        if (clickSound && keyboardSoundEnabled) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        }
    }
}

// Проверка слова
async function checkWord() {
    if (currentLetterIndex !== wordLength) {
        alert(`Заполните все буквы! Осталось ${wordLength - currentLetterIndex} букв`);
        return;
    }

    let currentWord = '';
    for (let i = 0; i < wordLength; i++) {
        currentWord += gameBoard[currentAttempt][i];
    }

    await submitGuess(currentWord);
}

// Создание сетки
function createTiles() {
    const gameGrid = document.querySelector('.game_grid');
    if (!gameGrid) return;

    const oldOverlay = document.querySelector('.tiles-overlay');
    if (oldOverlay) oldOverlay.remove();

    const tileContainer = document.createElement('div');
    tileContainer.className = 'tiles-overlay';

    for (let row = 0; row < maxAttempts; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'game-row';
        rowDiv.setAttribute('data-row', row);

        for (let col = 0; col < wordLength; col++) {
            const tile = document.createElement('div');
            tile.className = 'game-tile';
            tile.setAttribute('data-row', row);
            tile.setAttribute('data-col', col);
            rowDiv.appendChild(tile);
        }

        tileContainer.appendChild(rowDiv);
    }

    gameGrid.appendChild(tileContainer);
}

// Запуск фоновой музыки
function startBackgroundMusic() {
    if (bgMusic && musicEnabled && bgMusic.paused) {
        bgMusic.play().catch(error => {
            console.log('Автовоспроизведение заблокировано');
            showMusicButton();
        });
    }
}

function showMusicButton() {
    let musicBtn = document.getElementById('musicStartBtn');
    if (!musicBtn) {
        musicBtn = document.createElement('button');
        musicBtn.id = 'musicStartBtn';
        musicBtn.textContent = '🔊 ВКЛЮЧИТЬ МУЗЫКУ';
        musicBtn.style.position = 'fixed';
        musicBtn.style.bottom = '100px';
        musicBtn.style.left = '50%';
        musicBtn.style.transform = 'translateX(-50%)';
        musicBtn.style.padding = '10px 20px';
        musicBtn.style.background = '#2c2c2c';
        musicBtn.style.color = '#FFD700';
        musicBtn.style.border = '2px solid #8B7355';
        musicBtn.style.fontFamily = 'Courier New, monospace';
        musicBtn.style.cursor = 'pointer';
        musicBtn.style.zIndex = '1000';
        musicBtn.onclick = () => {
            bgMusic.play();
            musicBtn.remove();
        };
        document.body.appendChild(musicBtn);
    }
}

// Обновление настроек из страницы настроек
window.updateGameSettings = function(volume, keyboardSound, characterVoice, dialogSound) {
    if (bgMusic) bgMusic.volume = volume / 100;
    if (clickSound) clickSound.volume = (volume / 100) * 0.3;
    if (successSound) successSound.volume = (volume / 100) * 0.4;
    if (failSound) failSound.volume = (volume / 100) * 0.3;
    if (shurikSound) shurikSound.volume = (volume / 100) * 0.5;
    if (simbaSound) simbaSound.volume = (volume / 100) * 0.5;
    if (kakoshkaSound) kakoshkaSound.volume = (volume / 100) * 0.5;
    if (meowSound) meowSound.volume = (volume / 100) * 0.4;

    keyboardSoundEnabled = keyboardSound;
    characterVoiceEnabled = characterVoice !== undefined ? characterVoice : characterVoiceEnabled;
    dialogSoundEnabled = dialogSound !== undefined ? dialogSound : dialogSoundEnabled;

    const settings = {
        volume: volume,
        keyboardSound: keyboardSound,
        dialogSound: dialogSoundEnabled,
        characterVoice: characterVoiceEnabled,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('meowdex_settings', JSON.stringify(settings));

    if (dialogSoundEnabled && !isGameOver) {
        if (!dialogInterval) {
            startRandomDialogueInterval();
        }
    } else if (!dialogSoundEnabled && dialogInterval) {
        stopRandomDialogueInterval();
    }
};

// Функция для кнопки назад
function handleButtonClick(url) {
    stopFireworks();
    stopRain();
    window.location.href = url;
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', async function() {
    initSounds();
    await loadDialogues();
    await loadSettings();
    createTiles();
    resetGameUI();
    await startNewGame();

    document.body.addEventListener('click', function startMusic() {
        startBackgroundMusic();
        document.body.removeEventListener('click', startMusic);
    }, { once: true });
});

// Обработка кнопок клавиатуры
document.querySelectorAll('.key-btn[data-letter]').forEach(btn => {
    btn.addEventListener('click', () => {
        const letter = btn.getAttribute('data-letter');
        if (letter && letter !== 'ENTER' && letter !== 'BACKSPACE' && letter.length === 1) {
            addLetter(letter);
        }
    });
});

// Backspace
const backspaceBtn = document.getElementById('backspaceBtn');
if (backspaceBtn) {
    backspaceBtn.addEventListener('click', () => {
        deleteLetter();
    });
}

// Enter
const enterBtn = document.getElementById('enterBtn');
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        checkWord();
    });
}

// Физическая клавиатура
document.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();

    if (/[А-ЯЁ]/i.test(key)) {
        addLetter(key);
        e.preventDefault();
    }
    else if (key >= 'A' && key <= 'Z') {
        const ruMap = {
            'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'E': 'Е',
            'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П',
            'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'F': 'Ф', 'H': 'Х',
            'C': 'Ц', 'Z': 'З'
        };
        if (ruMap[key]) {
            addLetter(ruMap[key]);
            e.preventDefault();
        }
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