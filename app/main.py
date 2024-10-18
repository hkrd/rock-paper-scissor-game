from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import random

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="templates")

class Game(BaseModel):
    player1: str
    player2: str
    score1: int = 0
    score2: int = 0
    is_computer_opponent: bool = False
    rounds_played: int = 0

options = ["rock", "paper", "scissors"]


current_game = None
saved_game = None  # New variable to store the saved game state

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/start_game")
async def start_game(player1: str = Form(...), player2: str = Form(...), is_computer_opponent: bool = Form(...)):
    global current_game
    current_game = Game(player1=player1, player2=player2, is_computer_opponent=is_computer_opponent)
    return {"message": "Game started", "player1": player1, "player2": player2}

@app.post("/play")
async def play(player1_choice: str = Form(...), player2_choice: str = Form(...)):
    global current_game
    if not current_game:
        return {"error": "No game in progress"}
    
    return get_scores(player1_choice, player2_choice)


@app.post("/play_computer")
async def play_computer(player_choice: str = Form(...)):
    global current_game
    if not current_game or not current_game.is_computer_opponent:
        return {"error": "No game in progress or not playing against computer"}
    
    computer_choice = random.choice(options)
    return get_scores(player_choice, computer_choice)


def determine_winner(choice1, choice2) -> str:
    match (choice1, choice2):
        case ("rock", "scissors") | ("paper", "rock") | ("scissors", "paper"):
            return current_game.player1
        case ("scissors", "rock") | ("rock", "paper") | ("paper", "scissors"):
            return current_game.player2
        case _:
            return "tie"

def update_scores(outcome):
    if outcome == current_game.player1:
        current_game.score1 += 1
    elif outcome == current_game.player2:
        current_game.score2 += 1
    else:
        current_game.score1 += 1
        current_game.score2 += 1


def get_scores(player1_choice, player2_choice):
    outcome = determine_winner(player1_choice, player2_choice)
    update_scores(outcome)
    current_game.rounds_played += 1
    
    return {
        "player1_choice": player1_choice,
        "player2_choice": player2_choice,
        "result": outcome,
        "score1": current_game.score1,
        "score2": current_game.score2,
        "rounds_played": current_game.rounds_played
    }

@app.post("/save_game")
async def save_game():
    global current_game, saved_game
    if not current_game:
        return {"error": "No game in progress"}
    
    # Save the current game state
    saved_game = Game(
        player1=current_game.player1,
        player2=current_game.player2,
        score1=current_game.score1,
        score2=current_game.score2,
        is_computer_opponent=current_game.is_computer_opponent,
        rounds_played=current_game.rounds_played
    )
    
    return {"message": "Game saved successfully"}

@app.get("/load_game")
async def load_game():
    global saved_game, current_game
    if not saved_game:
        return {"error": "No saved game found"}
    
    # Set the current_game to the saved_game state
    current_game = Game(
        player1=saved_game.player1,
        player2=saved_game.player2,
        score1=saved_game.score1,
        score2=saved_game.score2,
        is_computer_opponent=saved_game.is_computer_opponent,
        rounds_played=saved_game.rounds_played
    )
    
    return {
        "player1": current_game.player1,
        "player2": current_game.player2,
        "score1": current_game.score1,
        "score2": current_game.score2,
        "is_computer_opponent": current_game.is_computer_opponent,
        "rounds_played": current_game.rounds_played
    }
