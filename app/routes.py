from fastapi import APIRouter, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from app.game_manager import GameManager

router = APIRouter()
templates = Jinja2Templates(directory="templates")
game_manager = GameManager()


@router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/start_game")
async def start_game(
    player1: str = Form(...),
    player2: str = Form(...),
    is_computer_opponent: bool = Form(...),
):
    game_manager.create_game(player1, player2, is_computer_opponent)
    return {"message": "Game started", "player1": player1, "player2": player2}


@router.post("/play")
async def play(player1_choice: str = Form(...), player2_choice: str = Form(...)):
    return game_manager.play_turn(player1_choice, player2_choice)


@router.post("/play_computer")
async def play_computer(player_choice: str = Form(...)):
    return game_manager.play_turn(player_choice)


@router.post("/save_game")
async def save_game():
    return game_manager.save()


@router.get("/load_game")
async def load_game():
    return game_manager.load()
