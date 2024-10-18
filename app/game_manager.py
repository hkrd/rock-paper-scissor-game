import random
from app.models import Game


class GameManager:

    def __init__(self):
        self.options = ["rock", "paper", "scissors"]
        self.current_game = None
        self.saved_game = None

    def create_game(self, player1, player2, is_computer_opponent):
        self.current_game = Game(
            player1=player1, player2=player2, is_computer_opponent=is_computer_opponent
        )

    def play_turn(self, player1_choice, player2_choice=None):
        if not self.current_game:
            return {"error": "No game in progress"}

        if self.current_game.is_computer_opponent:
            computer_choice = random.choice(self.options)
            return self.get_scores(player1_choice, computer_choice)
        return self.get_scores(player1_choice, player2_choice)

    def save(self):
        if not self.current_game:
            return {"error": "No game in progress"}

        self.saved_game = Game(
            player1=self.current_game.player1,
            player2=self.current_game.player2,
            score1=self.current_game.score1,
            score2=self.current_game.score2,
            is_computer_opponent=self.current_game.is_computer_opponent,
            rounds_played=self.current_game.rounds_played,
        )
        return {"message": "Game saved successfully"}

    def load(self):
        if not self.saved_game:
            return {"error": "No saved game found"}

        self.current_game = Game(
            player1=self.saved_game.player1,
            player2=self.saved_game.player2,
            score1=self.saved_game.score1,
            score2=self.saved_game.score2,
            is_computer_opponent=self.saved_game.is_computer_opponent,
            rounds_played=self.saved_game.rounds_played,
        )

        return {
            "player1": self.current_game.player1,
            "player2": self.current_game.player2,
            "score1": self.current_game.score1,
            "score2": self.current_game.score2,
            "is_computer_opponent": self.current_game.is_computer_opponent,
            "rounds_played": self.current_game.rounds_played,
        }

    def determine_winner(self, choice1, choice2) -> str:
        match (choice1, choice2):
            case ("rock", "scissors") | ("paper", "rock") | ("scissors", "paper"):
                return self.current_game.player1
            case ("scissors", "rock") | ("rock", "paper") | ("paper", "scissors"):
                return self.current_game.player2
            case _:
                return "tie"

    def update_scores(self, outcome):
        if outcome == self.current_game.player1:
            self.current_game.score1 += 1
        elif outcome == self.current_game.player2:
            self.current_game.score2 += 1
        else:
            self.current_game.score1 += 1
            self.current_game.score2 += 1

    def get_scores(self, player1_choice, player2_choice):
        outcome = self.determine_winner(player1_choice, player2_choice)
        self.update_scores(outcome)
        self.current_game.rounds_played += 1

        return {
            "player1_choice": player1_choice,
            "player2_choice": player2_choice,
            "result": outcome,
            "score1": self.current_game.score1,
            "score2": self.current_game.score2,
            "rounds_played": self.current_game.rounds_played,
        }
