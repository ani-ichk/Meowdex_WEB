class KeyboardLogic:
    def __init__(self):
        self.keyboard_state = {}

    def update(self, guess: str, colors: list[str]) -> dict:
        for letter, color in zip(guess, colors):
            current_color = self.keyboard_state.get(letter)

            if current_color is None:
                self.keyboard_state[letter] = color
                continue
            if current_color == "green":
                continue
            if current_color == "yellow" and color == "gray":
                continue

            self.keyboard_state[letter] = color

        return self.keyboard_state

    def get_keyboard_state(self) -> dict:
        return self.keyboard_state