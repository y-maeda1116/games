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
    let gameActive = false; // Track if game is running
    let moleDisappearTimer = null; // Track mole disappear timer

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
        if (!gameActive) return; // Don't show moles if game is not active
        
        if (currentMoleHole) { // If a mole is already up, hide it first
            hideMole(currentMoleHole);
        }

        const hole = getRandomHole();
        if (!hole) return;

        currentMoleHole = hole;
        const mole = hole.querySelector('.mole');
        mole.classList.add('up');

        // Clear any existing disappear timer
        if (moleDisappearTimer) {
            clearTimeout(moleDisappearTimer);
        }

        // Mole disappears after some time
        moleDisappearTimer = setTimeout(() => {
            if (currentMoleHole === hole && gameActive) { // only hide if it's still the current mole and game is active
                hideMole(hole);
                currentMoleHole = null;
                scheduleNextMole(); // Schedule next mole appearance
            }
        }, moleUpTime);
    }

    function scheduleNextMole() {
        if (!gameActive) return;
        
        const nextMoleDelay = Math.random() * (moleIntervalMax - moleIntervalMin) + moleIntervalMin;
        moleTimerId = setTimeout(showMole, nextMoleDelay);
    }

    function hideMole(hole) {
        if(hole && hole.querySelector('.mole')) {
            hole.querySelector('.mole').classList.remove('up');
            hole.classList.remove('whacked'); // Remove whacked feedback if any
        }
    }

    function whackMole(event) {
        if (!gameActive) return; // Don't allow whacking if game is not active
        
        const hole = event.currentTarget;
        const mole = hole.querySelector('.mole');

        if (mole.classList.contains('up') && currentMoleHole === hole) {
            score++;
            updateScoreDisplay();
            mole.classList.remove('up'); // Mole goes down immediately
            hole.classList.add('whacked'); // Visual feedback
            currentMoleHole = null; // Mole is whacked, no longer current

            // Clear the disappear timer since mole was whacked
            if (moleDisappearTimer) {
                clearTimeout(moleDisappearTimer);
                moleDisappearTimer = null;
            }

            // Remove feedback class after a short delay
            setTimeout(() => {
                hole.classList.remove('whacked');
            }, 200);

            // Schedule next mole appearance
            scheduleNextMole();
        }
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    function updateTimeLeftDisplay() {
        timeLeftDisplay.textContent = timeLeft;
    }

    function startGame() {
        // Reset game state
        score = 0;
        timeLeft = gameDuration;
        gameActive = true;
        currentMoleHole = null;
        
        // Clear any existing timers
        if (moleTimerId) clearTimeout(moleTimerId);
        if (gameTimerId) clearInterval(gameTimerId);
        if (moleDisappearTimer) clearTimeout(moleDisappearTimer);
        
        updateScoreDisplay();
        updateTimeLeftDisplay();
        startButton.disabled = true;
        gameBoard.innerHTML = ''; // Clear previous board if any
        holes = [];
        createGameBoard(); // Recreate board for a fresh game

        // Start mole appearances
        scheduleNextMole();

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
        gameActive = false; // Stop game activity
        
        // Clear all timers
        if (gameTimerId) clearInterval(gameTimerId);
        if (moleTimerId) clearTimeout(moleTimerId);
        if (moleDisappearTimer) clearTimeout(moleDisappearTimer);

        if (currentMoleHole) { // Hide any mole that might be up
            hideMole(currentMoleHole);
            currentMoleHole = null;
        }

        startButton.disabled = false;
        
        // Show result with better styling
        setTimeout(() => {
            alert(`🎉 Game Over! Your final score: ${score} 🎉`);
        }, 100);
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
