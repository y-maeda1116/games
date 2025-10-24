document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const homeButton = document.getElementById('homeButton');
    const timeLeftDisplay = document.getElementById('time-left');
    const startButton = document.getElementById('start-button');

    // Game Parameters
    const numHoles = 9; // 3x3 grid
    const moleUpTime = 800; // How long a mole stays up in milliseconds
    const moleIntervalMin = 500; // Minimum time between mole appearances
    const moleIntervalMax = 1500; // Maximum time between mole appearances
    const gameDuration = 30; // Game duration in seconds

    let score = 0;
    let timeLeft = gameDuration;
    let moleTimerId; // For mole appearances
    let gameTimerId; // For game duration countdown
    let holes = []; // Array to store hole elements
    let currentMoleHole = null; // Track which hole has the current mole

    function createGameBoard() {
        for (let i = 0; i < numHoles; i++) {
            const hole = document.createElement('div');
            hole.classList.add('hole');
            hole.dataset.index = i; // Store index for reference

            const mole = document.createElement('div');
            mole.classList.add('mole');
            hole.appendChild(mole);

            hole.addEventListener('click', whackMole);
            gameBoard.appendChild(hole);
            holes.push(hole);
        }
    }

    function getRandomHole() {
        const randomIndex = Math.floor(Math.random() * holes.length);
        return holes[randomIndex];
    }

    function showMole() {
        if (currentMoleHole) { // If a mole is already up, hide it first
            hideMole(currentMoleHole);
        }

        const hole = getRandomHole();
        if (!hole) return;

        currentMoleHole = hole;
        const mole = hole.querySelector('.mole');
        mole.classList.add('up');

        // Mole disappears after some time
        setTimeout(() => {
            hideMole(hole);
            if (currentMoleHole === hole) { // only nullify if it's still the current mole
                currentMoleHole = null;
            }
        }, moleUpTime);
    }

    function hideMole(hole) {
        if(hole && hole.querySelector('.mole')) {
            hole.querySelector('.mole').classList.remove('up');
            hole.classList.remove('whacked'); // Remove whacked feedback if any
        }
    }

    function whackMole(event) {
        const hole = event.currentTarget;
        const mole = hole.querySelector('.mole');

        if (mole.classList.contains('up')) {
            score++;
            updateScoreDisplay();
            mole.classList.remove('up'); // Mole goes down immediately
            hole.classList.add('whacked'); // Visual feedback
            currentMoleHole = null; // Mole is whacked, no longer current

            // Remove feedback class after a short delay
            setTimeout(() => {
                hole.classList.remove('whacked');
            }, 200);

            // Stop the current mole timer and start a new one sooner for faster gameplay feel
            clearTimeout(moleTimerId); // Stop current mole's disappear timer
            moleTimerId = setTimeout(showMole, moleIntervalMin / 2); // Next mole appears a bit faster
        }
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    function updateTimeLeftDisplay() {
        timeLeftDisplay.textContent = timeLeft;
    }

    function startGame() {
        score = 0;
        timeLeft = gameDuration;
        updateScoreDisplay();
        updateTimeLeftDisplay();
        startButton.disabled = true;
        gameBoard.innerHTML = ''; // Clear previous board if any
        holes = [];
        createGameBoard(); // Recreate board for a fresh game

        // Start mole appearances
        moleTimerId = setTimeout(showMole, moleIntervalMin); // Initial mole

        // Start game timer
        gameTimerId = setInterval(() => {
            timeLeft--;
            updateTimeLeftDisplay();
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(gameTimerId);
        clearTimeout(moleTimerId); // Stop moles from appearing/disappearing

        if (currentMoleHole) { // Hide any mole that might be up
            hideMole(currentMoleHole);
            currentMoleHole = null;
        }

        startButton.disabled = false;
        alert(`Game Over! Your final score: ${score}`);
    }

    // Initial setup
    updateTimeLeftDisplay(); // Show initial time
    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    startButton.addEventListener('click', startGame);
    // createGameBoard(); // Create board initially so it's visible, or do it in startGame for fresh setup
});
