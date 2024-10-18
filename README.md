# Rock Paper Scissors Game

This is a simple implementation of the Rock Paper Scissors game using FastAPI for the backend and HTML/CSS/JavaScript for the frontend.

## Requirements

- Python 3.11 or higher
- Poetry (package manager)

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies using Poetry:

```bash
poetry install
```

## Running the Game

1. Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

2. Open your web browser and navigate to `http://127.0.0.1:8000` to access the game.

## Deployed
You can find live deployment of the game [Here](https://rock-paper-scissor-game-j67a.onrender.com/)

You can find the Swagger documentation [Here](https://rock-paper-scissor-game-j67a.onrender.com/docs)

## Notes

I made the game to meet the mendatory requirements for having both backend and frontend.
I added functionality to save and load games.
I added functionality to play against the computer or another player.

I decided to build the backend in FastAPI and create simple endpoints for playing a turn as both players or as a player and a computer.
Also added endpoints to save and load games. I kept everything well structured by having my endpoints in a routes module,
and having the game logic inside game_manager module, and put any models used (in my case 1) in a models module.

I used the Jinja2 templating engine to serve my HTML pages, and templated out my index page to allow for a clean user interface.
Everything loads on the same page with JS i didn't add any other pages.

I added some basic CSS to style the page.

I added some JavaScript to handle the game logic on the frontend, and to allow for a more interactive user experience.
I'm not great at frontend but I tried to keep everything DRY, though everything is in the same file.

Deployed the game on Render so you can easily try it out :)

Time it took was about 2.5h
