from flask import Flask, render_template, request, jsonify, session
import uuid
import json

app = Flask(__name__)
app.secret_key = 'meowdex_secret_key_2024'

# Импорт бэкенда
from backend.game_controller import GameController

# Хранилище игровых сессий
sessions = {}


def get_game_controller():
    """Получить или создать контроллер игры для текущей сессии"""
    if 'game_session_id' not in session:
        session['game_session_id'] = str(uuid.uuid4())

    session_id = session['game_session_id']

    if session_id not in sessions:
        sessions[session_id] = GameController()

    return sessions[session_id]


@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')


@app.route('/game')
def game():
    """Страница игры"""
    controller = get_game_controller()
    result = controller.start_game()
    return render_template('game.html', dialog=result.get('dialog'))


@app.route('/rules')
def rules():
    """Страница правил"""
    return render_template('rules.html')


@app.route('/settings')
def settings():
    """Страница настроек - ВАЖНО: должна возвращать settings.html, НЕ game.html"""
    return render_template('settings.html')


# API для игры
@app.route('/api/start_game', methods=['POST'])
def start_game():
    """API: Начать новую игру"""
    if 'game_session_id' in session:
        session_id = session['game_session_id']
        if session_id in sessions:
            del sessions[session_id]

    controller = get_game_controller()
    result = controller.start_game()

    return jsonify({
        'success': True,
        'dialog': result.get('dialog'),
        'max_attempts': 6
    })


@app.route('/api/submit_guess', methods=['POST'])
def submit_guess():
    """API: Отправить предположение"""
    data = request.json
    guess = data.get('guess', '').lower()

    controller = get_game_controller()
    result = controller.submit_guess(guess)

    response = {
        'status': result['status'],
        'guess': result['guess'],
        'colors': result['colors'],
        'attempt': result['attempt'],
        'keyboard': result.get('keyboard', {}),
        'dialog': result.get('dialog')
    }

    if result['status'] in ['win', 'lose']:
        response['secret_word'] = result.get('secret_word', '')

    return jsonify(response)


@app.route('/api/reset_game', methods=['POST'])
def reset_game():
    """API: Сбросить игру"""
    if 'game_session_id' in session:
        session_id = session['game_session_id']
        if session_id in sessions:
            del sessions[session_id]

    controller = get_game_controller()
    result = controller.start_game()

    return jsonify({
        'success': True,
        'dialog': result.get('dialog')
    })


# API для настроек
SETTINGS_FILE = 'settings.json'


def load_settings():
    try:
        with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
            settings = json.load(f)
            # Устанавливаем значения по умолчанию, если их нет
            if 'dialogSound' not in settings:
                settings['dialogSound'] = True
            return settings
    except:
        return {'volume': 50, 'keyboardSound': True, 'dialogSound': True}

def save_settings(settings):
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(settings, f)



@app.route('/save_settings', methods=['POST'])
def save_settings_route():
    settings = request.json
    save_settings(settings)
    return jsonify({'status': 'success'})


@app.route('/get_settings', methods=['GET'])
def get_settings_route():
    settings = load_settings()
    return jsonify(settings)


@app.route('/api/get_dialogues', methods=['GET'])
def get_dialogues():
    """API: Получить список реплик для игры"""
    try:
        with open('static/data/character_lines.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Собираем все реплики из файла
            dialogues = []

            # Реплики из разных категорий
            if 'start' in data:
                for char, lines in data['start'].items():
                    for line in lines:
                        dialogues.append({'character': char, 'line': line})

            if 'game' in data and 'random' in data['game']:
                for char, lines in data['game']['random'].items():
                    for line in lines:
                        dialogues.append({'character': char, 'line': line})

            return jsonify({'dialogues': dialogues})
    except:
        return jsonify({'dialogues': []})

if __name__ == '__main__':
    app.run(debug=True)