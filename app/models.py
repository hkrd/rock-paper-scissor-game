from pydantic import BaseModel


class Game(BaseModel):
    player1: str
    player2: str
    score1: int = 0
    score2: int = 0
    is_computer_opponent: bool = False
    rounds_played: int = 0
