document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const homeButton = document.getElementById('homeButton');
    const timeLeftDisplay = document.getElementById('time-left');
    const startButton = document.getElementById('start-button');
    const currentLevelDisplay = document.getElementById('current-level');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // Game Parameters
    const numHoles = 9; // 3x3 grid
    
    // Difficulty Settings
    const difficultySettings = {
        easy: {
            moleUpTime: 2000,        // 2 seconds - plenty of time for 5-year-olds
            moleIntervalMin: 1500,   // 1.5 seconds minimum between moles
            moleIntervalMax: 3000,   // 3 seconds maximum between moles
            gameDuration: 45,        // 45 seconds - longer game
            name: 'Easy'
        },
        medium: {
            moleUpTime: 1200,        // 1.2 seconds
            moleIntervalMin: 800,    // 0.8 seconds minimum
            moleIntervalMax: 2000,   // 2 seconds maximum
            gameDuration: 30,        // 30 seconds
            name: 'Medium'
        },
        hard: {
            moleUpTime: 600,         // 0.6 seconds - very fast!
            moleIntervalMin: 300,    // 0.3 seconds minimum
            moleIntervalMax: 1000,   // 1 second maximum
            gameDuration: 20,        // 20 seconds - shorter but intense
            name: 'Hard'
        }
    };

    let currentDifficulty = 'easy'; // Default to easy for 5-year-olds

    let score = 0;
    let timeLeft = 0;
    let moleTimerId; // For mole appearances
    let gameTimerId; // For game duration countdown
    let holes = []; // Array to store hole elements
    let currentMoleHole = null; // Track which hole has the current mole
    let gameActive = false; // Track if game is running
    let moleDisappearTimer = null; // Track mole disappear timer

    function createGameBoard() {
        gameBoard.innerHTML = ''; // Clear existing holes
        holes = []; // Reset holes array
        
        for (let i = 0; i < numHoles; i++) {
            const hole = document.createElement('div');
            hole.classList.add('hole');
            hole.dataset.index = i;

            const mole = document.createElement('div');
            mole.classList.add('mole');
            hole.appendChild(mole);

            // Add click event with modern feedback
            hole.addEventListener('click', (e) => {
                whackMole(e);
                createClickEffect(e);
            });
            
            gameBoard.appendChild(hole);
            holes.push(hole);
            
            // Stagger hole appearance animation
            hole.style.animationDelay = `${i * 0.1}s`;
        }
    }

    // Modern click effect
    function createClickEffect(event) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        const rect = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
        
        event.currentTarget.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Success particles effect
    function createSuccessParticles(hole) {
        const rect = hole.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'success-particle';
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
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

        // Mole disappears after some time (based on difficulty)
        const settings = difficultySettings[currentDifficulty];
        moleDisappearTimer = setTimeout(() => {
            if (currentMoleHole === hole && gameActive) { // only hide if it's still the current mole and game is active
                hideMole(hole);
                currentMoleHole = null;
                scheduleNextMole(); // Schedule next mole appearance
            }
        }, settings.moleUpTime);
    }

    function scheduleNextMole() {
        if (!gameActive) return;
        
        const settings = difficultySettings[currentDifficulty];
        const nextMoleDelay = Math.random() * (settings.moleIntervalMax - settings.moleIntervalMin) + settings.moleIntervalMin;
        moleTimerId = setTimeout(showMole, nextMoleDelay);
    }

    // Difficulty selection functions
    function selectDifficulty(level) {
        currentDifficulty = level;
        const settings = difficultySettings[level];
        
        // Update UI
        currentLevelDisplay.textContent = settings.name;
        timeLeftDisplay.textContent = settings.gameDuration;
        
        // Update button states
        difficultyButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
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

            // Create success particles
            createSuccessParticles(hole);

            // Remove feedback class after a short delay
            setTimeout(() => {
                hole.classList.remove('whacked');
            }, 300);

            // Schedule next mole appearance
            scheduleNextMole();
        }
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
        
        // Add score animation
        scoreDisplay.parentElement.classList.add('score-animation');
        setTimeout(() => {
            scoreDisplay.parentElement.classList.remove('score-animation');
        }, 300);
    }

    function updateTimeLeftDisplay() {
        timeLeftDisplay.textContent = timeLeft;
    }

    function startGame() {
        // Reset game state
        const settings = difficultySettings[currentDifficulty];
        score = 0;
        timeLeft = settings.gameDuration;
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
            const settings = difficultySettings[currentDifficulty];
            let message = `🎉 Game Over! Your final score: ${score} 🎉\n`;
            message += `Difficulty: ${settings.name}\n`;
            
            // Encouraging messages based on difficulty and score
            if (currentDifficulty === 'easy') {
                if (score >= 15) message += "🌟 Excellent! You're a mole-whacking champion!";
                else if (score >= 10) message += "👏 Great job! Keep practicing!";
                else if (score >= 5) message += "😊 Good try! You're getting better!";
                else message += "🎮 Nice start! Try again to improve!";
            } else if (currentDifficulty === 'medium') {
                if (score >= 20) message += "🏆 Amazing! You're really skilled!";
                else if (score >= 15) message += "⭐ Very good! You're improving!";
                else if (score >= 10) message += "👍 Not bad! Keep going!";
                else message += "💪 Good effort! Practice makes perfect!";
            } else { // hard
                if (score >= 25) message += "🥇 Incredible! You're a master!";
                else if (score >= 20) message += "🔥 Fantastic! Lightning fast reflexes!";
                else if (score >= 15) message += "⚡ Great speed! You're getting there!";
                else message += "🚀 Challenging level! Keep trying!";
            }
            
            alert(message);
        }, 100);
    }

    // Event listeners for difficulty selection
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectDifficulty(btn.dataset.level);
        });
    });

    // Initial setup
    selectDifficulty('easy'); // Set default difficulty
    updateTimeLeftDisplay(); // Show initial time
    
    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });

    startButton.addEventListener('click', startGame);
});
