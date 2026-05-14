from backend.game_logic import GameLogic
from backend.keyboard_logic import KeyboardLogic
from backend.character_lines_logic import CharacterLinesLogic


class GameController:
    def __init__(self):
        self.game_logic = GameLogic()
        self.keyboard_logic = KeyboardLogic()
        self.character_lines_manager = CharacterLinesLogic()

    def start_game(self) -> dict:
        dialog = self.character_lines_manager.on_game_start()
        return {
            "dialog": dialog
        }

    def submit_guess(self, guess: str) -> dict:
        result = self.game_logic.submit_guess(guess)

        keyboard_state = self.keyboard_logic.update(
            result["guess"],
            result["colors"]
        )

        if result["status"] == "continue":
            dialog = self.character_lines_manager.on_guess(
                result["event"]
            )
            return {
                "status": result["status"],
                "guess": result["guess"],
                "colors": result["colors"],
                "attempt": result["attempt"],
                "keyboard": keyboard_state,
                "dialog": dialog
            }

        if result["status"] == "win":
            dialog = self.character_lines_manager.on_game_end(
                "win"
            )
            return {
                "status": result["status"],
                "guess": result["guess"],
                "colors": result["colors"],
                "attempt": result["attempt"],
                "keyboard": keyboard_state,
                "dialog": dialog,
                "secret_word": self.game_logic.secret_word
            }

        dialog = self.character_lines_manager.on_game_end(
            "lose"
        )
        return {
            "status": result["status"],
            "guess": result["guess"],
            "colors": result["colors"],
            "attempt": result["attempt"],
            "keyboard": keyboard_state,
            "dialog": dialog,
            "secret_word": self.game_logic.secret_word
        }