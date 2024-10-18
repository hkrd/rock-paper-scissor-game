document.addEventListener('DOMContentLoaded', () => {
    const startGameForm = document.getElementById('start-game-form');
    const gameSetup = document.getElementById('game-setup');
    const gamePlay = document.getElementById('game-play');
    const player1Name = document.getElementById('player1-name');
    const player2Name = document.getElementById('player2-name');
    const player1Score = document.getElementById('player1-score');
    const player2Score = document.getElementById('player2-score');
    const currentPlayer = document.getElementById('current-player');
    const choiceButtons = document.querySelectorAll('.choice');
    const result = document.getElementById('result');
    const saveGameButton = document.getElementById('save-game');
    const loadGameButton = document.getElementById('load-game');
    const choosePlayerButton = document.getElementById('choose-player');
    const chooseComputerButton = document.getElementById('choose-computer');
    const player2Input = document.getElementById('player2');
    const player1Input = document.getElementById('player1');
    const turnCounter = document.createElement('div');
    gamePlay.insertBefore(turnCounter, result);

    const returnHomeButton = document.getElementById('return-home');

    let currentPlayerName = '';
    let isComputerOpponent = false;
    let player1Choice = null;
    let player2Choice = null;
    let roundsPlayed = 0;

    choosePlayerButton.addEventListener('click', () => {
        player2Input.style.display = 'block';
        player2Input.required = true;
        isComputerOpponent = false;
    });

    chooseComputerButton.addEventListener('click', () => {
        if (player1Input.value.trim() === '') {
            alert('Please enter Player 1 name before choosing to play against the computer.');
            return;
        }
        player2Input.style.display = 'none';
        player2Input.required = false;
        player2Input.value = 'Computer';
        isComputerOpponent = true;
        startGame();
    });

    startGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const player1 = document.getElementById('player1').value.trim();
        const player2 = document.getElementById('player2').value.trim();

        if (player1.toLowerCase() === player2.toLowerCase()) {
            alert('Players cannot have the same name. Please choose different names.');
            return;
        }
        startGame();
    });

    async function startGame() {
        const player1 = player1Input.value;
        const player2 = player2Input.value;

        const response = await fetch('/start_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                player1: player1,
                player2: player2,
                is_computer_opponent: isComputerOpponent,
            }),
        });

        const data = await response.json();
        if (data.message === 'Game started') {
            gameSetup.style.display = 'none';
            gamePlay.style.display = 'block';
            player1Name.textContent = data.player1;
            player2Name.textContent = data.player2;
            player1Name.classList.add('text-player1');
            player2Name.classList.add(isComputerOpponent ? 'text-computer' : 'text-player2');
            currentPlayerName = data.player1;
            updateCurrentPlayer();
            roundsPlayed = 0;
            updateScores({ score1: 0, score2: 0 }, 0);
            updateTurnCounter();
        }
    }

    choiceButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const choice = button.dataset.choice;
            
            if (isComputerOpponent) {
                await playAgainstComputer(choice);
            } else {
                await playAgainstPlayer(choice);
            }
        });
    });

    async function playAgainstComputer(playerChoice) {
        disableButtons();
        highlightButton(playerChoice, 'player1');
        const response = await fetch('/play_computer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                player_choice: playerChoice,
            }),
        });

        const data = await response.json();
        updateGameState(data);
    }

    async function playAgainstPlayer(choice) {
        if (currentPlayerName === player1Name.textContent) {
            player1Choice = choice;
            highlightButton(choice, 'player1');
            currentPlayerName = player2Name.textContent;
            updateCurrentPlayer();
            result.textContent = `${player1Name.textContent} has made their choice. ${player2Name.textContent}'s turn.`;
        } else {
            player2Choice = choice;
            highlightButton(choice, 'player2');
            disableButtons();
            const response = await fetch('/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    player1_choice: player1Choice,
                    player2_choice: player2Choice,
                }),
            });

            const data = await response.json();
            updateGameState(data);

            player1Choice = null;
            player2Choice = null;
        }
    }

    async function updateGameState(data) {
        if (data.error) {
            result.textContent = data.error;
        } else {
            if (isComputerOpponent) {
                highlightButton(data.player2_choice, 'computer');
            }
            result.textContent = `${data.result === 'tie' ? 'Tie' : `${data.result} wins this turn`}`;
            updateScores(data, data.rounds_played);
            updateTurnCounter();
            if (roundsPlayed < 3) {
                await countdown();
                resetButtons();
                enableButtons();
                if (!isComputerOpponent) {
                    currentPlayerName = player1Name.textContent;
                }
                updateCurrentPlayer();
            } else {
                await countdown();
                endGame();
            }
        }
    }

    function updateScores(data, round) {
        player1Score.textContent = data.score1;
        player2Score.textContent = data.score2;
        roundsPlayed = round;
    }

    function updateTurnCounter() {
        turnCounter.textContent = `Round ${roundsPlayed} of 3`;
    }

    function updateCurrentPlayer() {
        currentPlayer.textContent = currentPlayerName + "'s turn";
        currentPlayer.className = ''; // Remove all classes
        if (currentPlayerName === player1Name.textContent) {
            currentPlayer.classList.add('text-player1');
        } else if (isComputerOpponent) {
            currentPlayer.classList.add('text-computer');
        } else {
            currentPlayer.classList.add('text-player2');
        }
    }

    async function countdown() {
        for (let i = 3; i > 0; i--) {
            currentPlayer.textContent = i;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        result.textContent = '';
        currentPlayer.textContent = '';
    }

    function disableButtons() {
        choiceButtons.forEach(button => button.disabled = true);
    }

    function enableButtons() {
        choiceButtons.forEach(button => button.disabled = false);
    }

    function resetButtons() {
        choiceButtons.forEach(button => {
            button.classList.remove('choice-player1', 'choice-player2', 'choice-computer');
        });
    }

    function endGame() {
        const score1 = parseInt(player1Score.textContent);
        const score2 = parseInt(player2Score.textContent);
        let winnerMessage = '';

        if (score1 > score2) {
            winnerMessage = `${player1Name.textContent} wins the game!`;
        } else if (score2 > score1) {
            winnerMessage = `${player2Name.textContent} wins the game!`;
        } else {
            winnerMessage = "It's a tie!";
        }

        gamePlay.innerHTML = `
            <h2>${winnerMessage}</h2>
            <p>Final Score:</p>
            <p>${player1Name.textContent}: ${score1}</p>
            <p>${player2Name.textContent}: ${score2}</p>
            <button id="play-again">Play Again</button>
        `;

        document.getElementById('play-again').addEventListener('click', () => {
            location.reload();
        });
    }

    saveGameButton.addEventListener('click', async () => {
        const response = await fetch('/save_game', { method: 'POST' });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
        } else {
            alert('Game saved successfully!');
        }
    });

    loadGameButton.addEventListener('click', async () => {
        const response = await fetch('/load_game');
        const data = await response.json();
        if (data.error) {
            alert(data.error);
        } else {
            player1Name.textContent = data.player1;
            player2Name.textContent = data.player2;
            player1Name.classList.add('text-player1');
            player2Name.classList.add(data.is_computer_opponent ? 'text-computer' : 'text-player2');
            player1Score.textContent = data.score1;
            player2Score.textContent = data.score2;
            currentPlayerName = data.player1;
            updateCurrentPlayer();
            isComputerOpponent = data.is_computer_opponent;
            gameSetup.style.display = 'none';
            gamePlay.style.display = 'block';
            roundsPlayed = data.rounds_played;
            updateTurnCounter();
            if (roundsPlayed >= 3) {
                endGame();
            } else {
                enableButtons();
            }
        }
    });

    function highlightButton(choice, player) {
        const button = document.querySelector(`.choice[data-choice="${choice}"]`);
        button.classList.remove('choice-player1', 'choice-player2', 'choice-computer');
        button.classList.add(`choice-${player}`);
    }

    returnHomeButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to return to the main page? Any unsaved progress will be lost.')) {
            gamePlay.style.display = 'none';
            gameSetup.style.display = 'block';
            resetGame();
        }
    });

    function resetGame() {
        player1Input.value = '';
        player2Input.value = '';
        player2Input.style.display = 'none';
        player1Score.textContent = '0';
        player2Score.textContent = '0';
        result.textContent = '';
        currentPlayerName = '';
        isComputerOpponent = false;
        player1Choice = null;
        player2Choice = null;
        roundsPlayed = 0;
        resetButtons();
        enableButtons();
    }
});
