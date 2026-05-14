import json
import random


class CharacterLinesLogic:

    SHOW_PROBABILITY = 0.13
    MAX_LINES_PER_GAME = 2

    CHARACTER_WEIGHTS = {
        "kakoshka": 0.75,
        "simba": 0.20,
        "shurik": 0.05,
    }

    def __init__(self):
        with open("static/data/character_lines.json", "r", encoding="utf-8") as file:
            self.lines = json.load(file)

        self._shown_lines_count = 0

    def should_show_line(self) -> bool:
        return random.random() < self.SHOW_PROBABILITY

    def pick_line(self, node: dict) -> dict | None:
        available_characters = []

        for character in self.CHARACTER_WEIGHTS:
            if character in node and node[character]:
                available_characters.append(character)

        if not available_characters:
            return None

        weights = [
            self.CHARACTER_WEIGHTS[character]
            for character in available_characters
        ]

        character = random.choices(
            available_characters,
            weights=weights,
            k=1
        )[0]

        line = random.choice(node[character])

        return {
            "character": character,
            "line": line
        }

    def get_event_node(self, event: str | None) -> dict:
        if event:
            section, key = event.split(".")
            return self.lines["game"][section][key]
        return self.lines["game"]["random"]

    def on_game_start(self) -> dict | None:
        self._shown_lines_count = 0

        if self.should_show_line():
            line = self.pick_line(self.lines["start"])
            if line:
                self._shown_lines_count += 1
            return line
        return None

    def on_guess(self, event: str | None) -> dict | None:
        if self._shown_lines_count < self.MAX_LINES_PER_GAME:
            if self.should_show_line():
                node = self.get_event_node(event)
                line = self.pick_line(node)
                if line:
                    self._shown_lines_count += 1
                return line
            return None
        return None

    def on_game_end(self, result: str) -> dict:
        node = self.lines["end"][result]
        return self.pick_line(node)