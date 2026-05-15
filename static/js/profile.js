// profile.js - система профилей игроков

const STORAGE_KEY = 'meowdex_players';
const CURRENT_PLAYER_KEY = 'meowdex_current_player';

let players = [];
let currentPlayer = null;

function loadPlayersData() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        players = JSON.parse(saved);
    } else {
        players = [];
    }

    const currentName = localStorage.getItem(CURRENT_PLAYER_KEY);

    if (currentName) {
        currentPlayer = players.find(p => p.name === currentName) || null;
    } else {
        currentPlayer = null;
    }

    updatePlayerDisplay();
}

function savePlayersData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));

    if (currentPlayer) {
        localStorage.setItem(CURRENT_PLAYER_KEY, currentPlayer.name);
    } else {
        localStorage.removeItem(CURRENT_PLAYER_KEY);
    }
}

function createPlayer(name, favoriteColor, favoriteWord) {
    const newPlayer = {
        name: name,
        favoriteColor: favoriteColor || null,
        favoriteWord: favoriteWord || null,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        joinDate: new Date().toISOString(),
        lastPlayed: new Date().toISOString()
    };

    players.push(newPlayer);
    currentPlayer = newPlayer;
    savePlayersData();
    updatePlayerDisplay();

    const modalElement = document.getElementById('registrationModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }

    alert(`🐱 Добро пожаловать, ${name}! Желаем удачи в игре!`);

    return newPlayer;
}

function updatePlayerStats(isWin) {
    if (!currentPlayer) return;

    if (isWin) {
        currentPlayer.wins++;
    } else {
        currentPlayer.losses++;
    }
    currentPlayer.gamesPlayed++;
    currentPlayer.lastPlayed = new Date().toISOString();

    const index = players.findIndex(p => p.name === currentPlayer.name);
    if (index !== -1) {
        players[index] = currentPlayer;
    }

    savePlayersData();
    updatePlayerDisplay();
}

function updatePlayerDisplay() {
    const nameElement = document.getElementById('playerNameDisplay');
    const winsElement = document.getElementById('playerWins');
    const lossesElement = document.getElementById('playerLosses');
    const gamesElement = document.getElementById('playerGames');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');

    if (currentPlayer && currentPlayer.name) {
        if (nameElement) nameElement.textContent = currentPlayer.name;
        if (winsElement) winsElement.textContent = currentPlayer.wins;
        if (lossesElement) lossesElement.textContent = currentPlayer.losses;
        if (gamesElement) gamesElement.textContent = currentPlayer.gamesPlayed;
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
    } else {
        if (nameElement) nameElement.textContent = 'Гость';
        if (winsElement) winsElement.textContent = '0';
        if (lossesElement) lossesElement.textContent = '0';
        if (gamesElement) gamesElement.textContent = '0';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
    }
}

function logoutPlayer() {
    currentPlayer = null;
    localStorage.removeItem(CURRENT_PLAYER_KEY);
    updatePlayerDisplay();
    alert('Вы вышли из аккаунта. Нажмите "Войти в игру" чтобы продолжить.');
}

function showRegistrationModal() {
    const modalElement = document.getElementById('registrationModal');
    if (modalElement) {
        document.getElementById('playerName').value = '';
        document.getElementById('playerFavoriteColor').value = '';
        document.getElementById('playerFavoriteWord').value = '';
        document.getElementById('rulesAgree').checked = false;

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function handleRegistrationClick() {
    const name = document.getElementById('playerName').value.trim();
    const favoriteColor = document.getElementById('playerFavoriteColor').value;
    const favoriteWord = document.getElementById('playerFavoriteWord').value.trim();
    const rulesAgree = document.getElementById('rulesAgree').checked;

    if (!name) {
        alert('Пожалуйста, введите имя!');
        return;
    }

    if (!rulesAgree) {
        alert('Пожалуйста, согласитесь с правилами игры!');
        return;
    }

    const existingPlayer = players.find(p => p.name === name);
    if (existingPlayer) {
        currentPlayer = existingPlayer;
        savePlayersData();
        updatePlayerDisplay();

        const modalElement = document.getElementById('registrationModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        alert(`С возвращением, ${name}!`);
    } else {
        createPlayer(name, favoriteColor, favoriteWord);
    }
}

function initProfileSystem() {
    loadPlayersData();
}

// Экспортируем в глобальную область
window.updatePlayerStats = updatePlayerStats;
window.updatePlayerDisplay = updatePlayerDisplay;
window.initProfileSystem = initProfileSystem;
window.showRegistrationModal = showRegistrationModal;
window.logoutPlayer = logoutPlayer;
window.handleRegistrationClick = handleRegistrationClick;

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', function() {
    initProfileSystem();
});