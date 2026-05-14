import random


class GameLogic:

    MAX_ATTEMPTS = 6

    def __init__(self):
        self.secret_word = self.get_random_word()
        self.current_attempt = 0
        self.is_game_over = False
        self.is_win = False

    def submit_guess(self, guess: str) -> dict:
        guess = guess.lower().replace("ё", "е")
        self.current_attempt += 1

        colors = self.check_guess(guess)

        if guess == self.secret_word:
            self.is_game_over = True
            self.is_win = True
            return {
                "status": "win",
                "guess": guess,
                "colors": colors,
                "attempt": self.current_attempt,
                "event": None
            }

        if self.current_attempt >= self.MAX_ATTEMPTS:
            self.is_game_over = True
            return {
                "status": "lose",
                "guess": guess,
                "colors": colors,
                "attempt": self.current_attempt,
                "event": self.determine_event(colors)
            }

        return {
            "status": "continue",
            "guess": guess,
            "colors": colors,
            "attempt": self.current_attempt,
            "event": self.determine_event(colors)
        }

    def get_random_word(self) -> str | None:
        with open("static/data/words.txt", "r", encoding="utf-8") as file:
            words = file.read().splitlines()
            word = random.choice(words)
            if len(word) == 5:
                return word
            return None

    def check_guess(self, guess: str) -> list[str]:
        result = ["gray"] * 5
        remaining_letters = list(self.secret_word)

        for index in range(5):
            if guess[index] == self.secret_word[index]:
                result[index] = "green"
                remaining_letters[index] = None

        for index in range(5):
            if result[index] == "green":
                continue
            letter = guess[index]
            if letter in remaining_letters:
                result[index] = "yellow"
                remove_index = remaining_letters.index(letter)
                remaining_letters[remove_index] = None

        return result

    def determine_event(self, colors: list[str]) -> str | None:
        green_count = colors.count("green")

        if self.current_attempt == 4:
            return "pressure.almost_last"
        if self.current_attempt == 5:
            return "pressure.last_chance"

        if green_count == 1:
            return "praise.first_green"
        if green_count == 3:
            return "praise.three_letters"
        if green_count == 4:
            return "praise.four_letters"

        return None