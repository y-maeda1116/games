document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const homeButton = document.getElementById('homeButton');
    const startButton = document.getElementById('start-button');
    const lanes = [
        document.getElementById('lane-0'),
        document.getElementById('lane-1'),
        document.getElementById('lane-2'),
        document.getElementById('lane-3')
    ];

    // Game Parameters
    const noteSpeed = 2; // Pixels per frame
    const numLanes = 4;
    const targetZoneHeight = 50; // The area (height in px) at the bottom of the lane for hitting notes
    const noteHeight = 20; // Matches CSS .note height

    let score = 0;
    let gameInterval;
    let notes = []; // Array to store active note elements and their data
    let gameTime = 0; // Simple timer for scheduling notes
    let noteSchedule = [ // { time: (in frames/ticks), lane: (0-3) }
        { time: 60, lane: 0 },
        { time: 120, lane: 1 },
        { time: 180, lane: 2 },
        { time: 240, lane: 3 },
        { time: 300, lane: 0 },
        { time: 300, lane: 1 },
        { time: 360, lane: 2 },
        { time: 360, lane: 3 },
        { time: 420, lane: 0 },
        { time: 450, lane: 1 },
        { time: 480, lane: 2 },
        { time: 510, lane: 3 },
        { time: 540, lane: 0 },
        { time: 540, lane: 1 },
        { time: 540, lane: 2 },
        { time: 540, lane: 3 },
    ];
    let nextNoteIndex = 0;
    let gameLoopId;
    let keysPressed = {}; // To track currently pressed keys for each lane

    const laneKeys = ['D', 'F', 'J', 'K']; // Keys corresponding to lanes

    function startGame() {
        score = 0;
        notes = [];
        gameTime = 0;
        nextNoteIndex = 0;
        updateScoreDisplay();
        startButton.disabled = true;

        // Clear any existing notes from previous games
        lanes.forEach(lane => {
            lane.querySelectorAll('.note').forEach(noteEl => noteEl.remove());
        });

        document.addEventListener('keydown', handleKeyPress);
        document.addEventListener('keyup', handleKeyRelease);

        gameLoopId = requestAnimationFrame(updateGameArea);
    }

    function generateNote(laneIndex) {
        if (laneIndex < 0 || laneIndex >= numLanes) {
            console.error("Invalid lane index:", laneIndex);
            return;
        }

        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.style.top = '0px'; // Start at the top of the game area

        // Append note to the correct lane div
        lanes[laneIndex].appendChild(noteElement);
        notes.push({
            element: noteElement,
            lane: laneIndex,
            y: 0 // y position relative to gameArea top
        });
    }

    function updateGameArea() {
        gameTime++;

        // Generate new notes based on schedule
        if (nextNoteIndex < noteSchedule.length && gameTime >= noteSchedule[nextNoteIndex].time) {
            generateNote(noteSchedule[nextNoteIndex].lane);
            nextNoteIndex++;
        }

        // Move notes and check for hits/misses
        for (let i = notes.length - 1; i >= 0; i--) {
            const note = notes[i];
            note.y += noteSpeed;
            note.element.style.top = note.y + 'px';

            // Check for miss (note passed target zone)
            if (note.y + noteHeight > gameArea.clientHeight) {
                note.element.remove();
                notes.splice(i, 1);
                // console.log("Missed!");
                // Add miss visual feedback if desired
            }
        }

        if (nextNoteIndex >= noteSchedule.length && notes.length === 0) {
            // All notes generated and cleared
            endGame();
        } else {
            gameLoopId = requestAnimationFrame(updateGameArea);
        }
    }

    function handleKeyPress(event) {
        const key = event.key.toUpperCase();
        const laneIndex = laneKeys.indexOf(key);

        if (laneIndex !== -1 && !keysPressed[laneIndex]) { // Check if key is for a lane and not already processed
            keysPressed[laneIndex] = true; // Mark key as being processed for this press
            // Check for hit
            const targetBottom = gameArea.clientHeight - (gameArea.clientHeight * 0.10); // 10% from bottom
            const targetTop = targetBottom - targetZoneHeight;

            for (let i = notes.length - 1; i >= 0; i--) {
                const note = notes[i];
                if (note.lane === laneIndex) {
                    const noteBottom = note.y + noteHeight;
                    // Check if the note is within the target zone
                    if (note.y < targetBottom && noteBottom > targetTop) {
                        score++;
                        updateScoreDisplay();
                        note.element.remove(); // Or apply 'hit' class and then remove
                        notes.splice(i, 1);
                        // console.log("Hit!");
                        // Add hit visual feedback (e.g., flash lane)
                        lanes[laneIndex].classList.add('feedback-hit');
                        setTimeout(() => lanes[laneIndex].classList.remove('feedback-hit'), 200);
                        break; // Process only one note per key press per lane
                    }
                }
            }
        }
    }

    function handleKeyRelease(event) {
        const key = event.key.toUpperCase();
        const laneIndex = laneKeys.indexOf(key);
        if (laneIndex !== -1) {
            keysPressed[laneIndex] = false; // Reset key state on release
        }
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }

    function endGame() {
        cancelAnimationFrame(gameLoopId);
        startButton.disabled = false;
        document.removeEventListener('keydown', handleKeyPress);
        document.removeEventListener('keyup', handleKeyRelease);
        alert("Game Over! Your score: " + score);
    }

    // Home button event listener
    homeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    startButton.addEventListener('click', startGame);
});
