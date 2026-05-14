document.addEventListener('DOMContentLoaded', function() {
            loadSettings();
            setupVolumeDisplay();
        });

        function setupVolumeDisplay() {
            const slider = document.getElementById('volumeSlider');
            const volumeValue = document.getElementById('volumeValue');

            slider.addEventListener('input', function() {
                volumeValue.textContent = this.value + '%';
                updateMusicVolume(this.value);
            });

            slider.addEventListener('change', saveSettings);
        }

        function updateMusicVolume(volume) {
            const audioElements = document.querySelectorAll('audio');
            audioElements.forEach(audio => {
                audio.volume = volume / 100;
            });

            if (window.musicPlayer) {
                window.musicPlayer.volume = volume / 100;
            }
        }

        function saveSettings() {
            const volume = document.getElementById('volumeSlider').value;
            const keyboardSound = document.getElementById('keyboardSoundToggle').checked;

            const settings = {
                volume: parseInt(volume),
                keyboardSound: keyboardSound,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('meowdex_settings', JSON.stringify(settings));

            fetch('/save_settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Настройки сохранены:', data);
                showToast();
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showToast();
            });

            applySettings(settings);
        }

        function loadSettings() {
            fetch('/get_settings')
                .then(response => response.json())
                .then(settings => {
                    document.getElementById('volumeSlider').value = settings.volume || 50;
                    document.getElementById('volumeValue').textContent = (settings.volume || 50) + '%';
                    document.getElementById('keyboardSoundToggle').checked = settings.keyboardSound || false;
                    applySettings(settings);
                })
                .catch(error => {
                    const savedSettings = localStorage.getItem('meowdex_settings');
                    if (savedSettings) {
                        const settings = JSON.parse(savedSettings);
                        document.getElementById('volumeSlider').value = settings.volume || 50;
                        document.getElementById('volumeValue').textContent = (settings.volume || 50) + '%';
                        document.getElementById('keyboardSoundToggle').checked = settings.keyboardSound || false;
                        applySettings(settings);
                    }
                });
        }

        function applySettings(settings) {
            updateMusicVolume(settings.volume);

            if (settings.keyboardSound) {
                enableKeyboardSound();
            } else {
                disableKeyboardSound();
            }
        }

        let keyboardSoundEnabled = false;

        function enableKeyboardSound() {
            keyboardSoundEnabled = true;
            document.addEventListener('keypress', playKeySound);
        }

        function disableKeyboardSound() {
            keyboardSoundEnabled = false;
            document.removeEventListener('keypress', playKeySound);
        }

        function playKeySound(e) {
            if (!keyboardSoundEnabled) return;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.1;

            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        }

        function showToast() {
            const toast = document.getElementById('toast');
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }